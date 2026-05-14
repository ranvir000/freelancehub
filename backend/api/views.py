from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics
from django.db.models import Q
from .models import User, Gig, Order
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    GigSerializer, OrderSerializer
)


# ── AUTH ──────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        if s.is_valid():
            user = s.save()
            from rest_framework_simplejwt.tokens import RefreshToken
            token = str(RefreshToken.for_user(user).access_token)
            return Response({'user': UserSerializer(user).data, 'token': token}, status=201)
        return Response(s.errors, status=400)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = LoginSerializer(data=request.data)
        if s.is_valid():
            return Response({
                'user':  UserSerializer(s.validated_data['user']).data,
                'token': s.validated_data['token'],
            })
        return Response(s.errors, status=401)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ── USERS ─────────────────────────────────────────────────────────────────────

class UserDetailView(APIView):
    """GET /api/users/<pk>/ — public profile lookup used by UserProfile page."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        # Support 'me' alias when authenticated
        if pk == 'me':
            if request.user.is_authenticated:
                return Response(UserSerializer(request.user).data)
            return Response({'error': 'Not authenticated'}, status=401)
        try:
            user = User.objects.get(pk=pk)
            return Response(UserSerializer(user).data)
        except (User.DoesNotExist, ValueError):
            return Response({'error': 'User not found'}, status=404)


# ── GIGS ──────────────────────────────────────────────────────────────────────

class GigListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        qs = Gig.objects.filter(is_active=True)
        cat    = request.query_params.get('category')
        search = request.query_params.get('search')
        seller = request.query_params.get('seller')

        if cat:    qs = qs.filter(category=cat)
        if search: qs = qs.filter(title__icontains=search)
        if seller: qs = qs.filter(seller__id=seller)

        return Response(GigSerializer(qs, many=True).data)

    def post(self, request):
        if request.user.role not in ('seller', 'admin'):
            return Response({'error': 'Only sellers can post gigs.'}, status=403)
        s = GigSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            gig = s.save()
            # Return properly serialized data (not raw __dict__)
            return Response(GigSerializer(gig).data, status=201)
        return Response(s.errors, status=400)


class GigDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        try:
            gig = Gig.objects.get(pk=pk)
            return Response(GigSerializer(gig).data)
        except Gig.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

    def patch(self, request, pk):
        try:
            gig = Gig.objects.get(pk=pk, seller=request.user)
        except Gig.DoesNotExist:
            return Response({'error': 'Not found or not yours'}, status=404)
        s = GigSerializer(gig, data=request.data, partial=True)
        if s.is_valid():
            return Response(GigSerializer(s.save()).data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        try:
            Gig.objects.get(pk=pk, seller=request.user).delete()
            return Response(status=204)
        except Gig.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


# ── ORDERS ────────────────────────────────────────────────────────────────────

class OrderListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Order.objects.filter(Q(buyer=request.user) | Q(seller=request.user))
        return Response(OrderSerializer(qs, many=True).data)

    def post(self, request):
        s = OrderSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            order = s.save()
            return Response(OrderSerializer(order).data, status=201)
        return Response(s.errors, status=400)


class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_order(self, pk, user):
        """Return the order only if the requesting user is buyer, seller, or admin."""
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return None
        # Authorization check — user must be a party to the order
        if order.buyer != user and order.seller != user and user.role != 'admin':
            return None
        return order

    def patch(self, request, pk):
        order = self.get_order(pk, request.user)
        if not order:
            return Response({'error': 'Not found or not authorized'}, status=404)

        new_status = request.data.get('status')
        if not new_status:
            return Response({'error': 'status field required'}, status=400)

        # Validate who can do what
        is_seller = request.user == order.seller
        is_buyer  = request.user == order.buyer

        allowed = {
            'seller': {'pending':'accepted', 'accepted':'in_progress', 'in_progress':'delivered'},
            'buyer':  {'delivered':'completed', 'pending':'cancelled'},
        }

        if is_seller and allowed['seller'].get(order.status) == new_status:
            order.status = new_status
        elif is_buyer and allowed['buyer'].get(order.status) == new_status:
            order.status = new_status
            if new_status == 'completed':
                # Release payment to seller — uses the proper DB field
                order.seller.total_earnings += order.amount
                order.seller.save()
                order.gig.orders_completed += 1
                order.gig.save()
        else:
            return Response({'error': 'Invalid status transition'}, status=400)

        order.save()
        return Response(OrderSerializer(order).data)


# ── ADMIN ─────────────────────────────────────────────────────────────────────

class AdminUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        users = User.objects.all().order_by('-date_joined')
        data = [{
            'id':          u.id,
            'name':        u.name,
            'email':       u.email,
            'role':        u.role,
            'date_joined': u.date_joined.strftime('%Y-%m-%d'),
        } for u in users]
        return Response(data)


class AdminGigsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        gigs = Gig.objects.all().select_related('seller')
        data = [{
            'id':               g.id,
            'title':            g.title,
            'seller_name':      g.seller.name,
            'category':         g.category,
            'price':            float(g.price_basic),
            'orders_completed': g.orders_completed,
            'is_active':        g.is_active,
        } for g in gigs]
        return Response(data)

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        try:
            gig = Gig.objects.get(pk=pk)
            if 'is_active' in request.data:
                gig.is_active = request.data['is_active']
                gig.save()
            return Response({'success': True})
        except Gig.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


class AdminOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        orders = Order.objects.all().select_related('buyer', 'seller', 'gig')
        data = [{
            'id':          o.id,
            'gig_title':   o.gig.title,
            'buyer_name':  o.buyer.name,
            'seller_name': o.seller.name,
            'amount':      float(o.amount),
            'status':      o.status,
            'created_at':  o.created_at.strftime('%Y-%m-%d'),
        } for o in orders]
        return Response(data)


class ReviewListCreateView(APIView):
    """
    GET  /api/reviews/?gig=<id>     → reviews for a gig
    GET  /api/reviews/?seller=<id>  → reviews for a seller
    POST /api/reviews/              → submit a review
    """
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request):
        from api.models import Review
        from api.serializers import ReviewSerializer
        qs = Review.objects.select_related('buyer', 'seller', 'gig')
        if request.query_params.get('gig'):
            qs = qs.filter(gig__id=request.query_params['gig'])
        if request.query_params.get('seller'):
            qs = qs.filter(seller__id=request.query_params['seller'])
        return Response(ReviewSerializer(qs, many=True).data)

    def post(self, request):
        from api.serializers import ReviewSerializer
        s = ReviewSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            return Response(ReviewSerializer(s.save()).data, status=201)
        return Response(s.errors, status=400)
