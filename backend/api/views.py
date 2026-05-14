from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Q, Max
from .models import User, Gig, Order, Review, Message, Favourite
from .serializers import (
    UserSerializer, UserUpdateSerializer, RegisterSerializer, LoginSerializer,
    GigSerializer, OrderSerializer, ReviewSerializer, MessageSerializer, FavouriteSerializer
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

    def patch(self, request):
        s = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(UserSerializer(request.user).data)
        return Response(s.errors, status=400)


# ── USERS ─────────────────────────────────────────────────────────────────────

class UserDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        if pk == 'me':
            if request.user.is_authenticated:
                return Response(UserSerializer(request.user).data)
            return Response({'error': 'Not authenticated'}, status=401)
        try:
            user = User.objects.get(pk=pk)
            return Response(UserSerializer(user).data)
        except (User.DoesNotExist, ValueError):
            return Response({'error': 'User not found'}, status=404)


class SellerListView(APIView):
    """GET /api/sellers/ — browse all sellers with optional filters."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = User.objects.filter(role='seller')
        search = request.query_params.get('search')
        skill  = request.query_params.get('skill')
        if search:
            qs = qs.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search) | Q(bio__icontains=search))
        if skill:
            qs = qs.filter(skills__icontains=skill)
        data = [{
            'id':               u.id,
            'name':             u.name,
            'bio':              u.bio,
            'skills':           u.skills_list,
            'location':         u.location,
            'avatar_url':       u.avatar_url,
            'hourly_rate':      float(u.hourly_rate) if u.hourly_rate else None,
            'total_earnings':   float(u.total_earnings),
            'gig_count':        u.gigs.filter(is_active=True).count(),
            'completed_orders': u.orders_sold.filter(status='completed').count(),
        } for u in qs]
        return Response(data)


# ── GIGS ──────────────────────────────────────────────────────────────────────

class GigListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        qs = Gig.objects.filter(is_active=True)
        cat      = request.query_params.get('category')
        search   = request.query_params.get('search')
        seller   = request.query_params.get('seller')
        min_price= request.query_params.get('min_price')
        max_price= request.query_params.get('max_price')
        sort     = request.query_params.get('sort', '-created_at')

        if cat:       qs = qs.filter(category=cat)
        if search:    qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if seller:    qs = qs.filter(seller__id=seller)
        if min_price: qs = qs.filter(price_basic__gte=min_price)
        if max_price: qs = qs.filter(price_basic__lte=max_price)
        if sort in ['-created_at', 'price_basic', '-price_basic', '-rating', '-orders_completed']:
            qs = qs.order_by(sort)

        return Response(GigSerializer(qs, many=True, context={'request': request}).data)

    def post(self, request):
        if request.user.role not in ('seller', 'admin'):
            return Response({'error': 'Only sellers can post gigs.'}, status=403)
        s = GigSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            return Response(GigSerializer(s.save()).data, status=201)
        return Response(s.errors, status=400)


class GigDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        try:
            gig = Gig.objects.get(pk=pk)
            return Response(GigSerializer(gig, context={'request': request}).data)
        except Gig.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

    def patch(self, request, pk):
        try:
            gig = Gig.objects.get(pk=pk, seller=request.user)
        except Gig.DoesNotExist:
            return Response({'error': 'Not found or not yours'}, status=404)
        s = GigSerializer(gig, data=request.data, partial=True, context={'request': request})
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
            return Response(OrderSerializer(s.save()).data, status=201)
        return Response(s.errors, status=400)


class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_order(self, pk, user):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return None
        if order.buyer != user and order.seller != user and user.role != 'admin':
            return None
        return order

    def get(self, request, pk):
        order = self.get_order(pk, request.user)
        if not order:
            return Response({'error': 'Not found or not authorized'}, status=404)
        return Response(OrderSerializer(order).data)

    def patch(self, request, pk):
        order = self.get_order(pk, request.user)
        if not order:
            return Response({'error': 'Not found or not authorized'}, status=404)

        new_status = request.data.get('status')
        if not new_status:
            return Response({'error': 'status field required'}, status=400)

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
                order.seller.total_earnings += order.amount
                order.seller.save()
                order.gig.orders_completed += 1
                order.gig.save()
        else:
            return Response({'error': 'Invalid status transition'}, status=400)

        order.save()
        return Response(OrderSerializer(order).data)


# ── REVIEWS ───────────────────────────────────────────────────────────────────

class ReviewListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request):
        qs = Review.objects.select_related('buyer', 'seller', 'gig')
        if request.query_params.get('gig'):
            qs = qs.filter(gig__id=request.query_params['gig'])
        if request.query_params.get('seller'):
            qs = qs.filter(seller__id=request.query_params['seller'])
        return Response(ReviewSerializer(qs, many=True).data)

    def post(self, request):
        s = ReviewSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            return Response(ReviewSerializer(s.save()).data, status=201)
        return Response(s.errors, status=400)


# ── MESSAGES ─────────────────────────────────────────────────────────────────

class MessageListCreateView(APIView):
    """
    GET  /api/messages/               → list all conversations (unique partners + last message)
    GET  /api/messages/?with=<id>     → get full thread with a user
    POST /api/messages/               → send a message { receiver, content, order(optional) }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        partner_id = request.query_params.get('with')

        if partner_id:
            # Full thread between two users
            msgs = Message.objects.filter(
                Q(sender=user, receiver_id=partner_id) |
                Q(sender_id=partner_id, receiver=user)
            ).select_related('sender', 'receiver')
            # Mark incoming as read
            msgs.filter(receiver=user, is_read=False).update(is_read=True)
            return Response(MessageSerializer(msgs, many=True).data)

        # List unique conversations (last message per partner)
        sent     = Message.objects.filter(sender=user).values_list('receiver_id', flat=True)
        received = Message.objects.filter(receiver=user).values_list('sender_id', flat=True)
        partner_ids = set(list(sent) + list(received))

        conversations = []
        for pid in partner_ids:
            try:
                partner = User.objects.get(pk=pid)
            except User.DoesNotExist:
                continue
            last_msg = Message.objects.filter(
                Q(sender=user, receiver_id=pid) | Q(sender_id=pid, receiver=user)
            ).order_by('-created_at').first()
            unread = Message.objects.filter(sender_id=pid, receiver=user, is_read=False).count()
            conversations.append({
                'partner_id':   partner.id,
                'partner_name': partner.name,
                'partner_avatar': partner.avatar_url or '',
                'partner_role': partner.role,
                'last_message': last_msg.content if last_msg else '',
                'last_at':      last_msg.created_at if last_msg else None,
                'unread_count': unread,
            })
        conversations.sort(key=lambda x: x['last_at'] or '', reverse=True)
        return Response(conversations)

    def post(self, request):
        s = MessageSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            return Response(MessageSerializer(s.save()).data, status=201)
        return Response(s.errors, status=400)


class UnreadCountView(APIView):
    """GET /api/messages/unread/ → { count: N }"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(receiver=request.user, is_read=False).count()
        return Response({'count': count})


# ── FAVOURITES ────────────────────────────────────────────────────────────────

class FavouriteListView(APIView):
    """GET /api/favourites/ — list user's saved gigs."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        favs = Favourite.objects.filter(user=request.user).select_related('gig')
        return Response(FavouriteSerializer(favs, many=True, context={'request': request}).data)


class FavouriteToggleView(APIView):
    """POST /api/favourites/toggle/ { gig_id } — add or remove a favourite."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        gig_id = request.data.get('gig_id')
        if not gig_id:
            return Response({'error': 'gig_id required'}, status=400)
        try:
            gig = Gig.objects.get(pk=gig_id)
        except Gig.DoesNotExist:
            return Response({'error': 'Gig not found'}, status=404)

        fav, created = Favourite.objects.get_or_create(user=request.user, gig=gig)
        if not created:
            fav.delete()
            return Response({'favourited': False})
        return Response({'favourited': True})


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
            'location':    u.location,
            'date_joined': u.date_joined.strftime('%Y-%m-%d'),
            'gig_count':   u.gigs.count() if u.role == 'seller' else 0,
        } for u in users]
        return Response(data)

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        try:
            user = User.objects.get(pk=pk)
            if 'role' in request.data:
                user.role = request.data['role']
                user.save()
            return Response({'success': True})
        except User.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


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
            'created_at':       g.created_at.strftime('%Y-%m-%d'),
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

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        try:
            order = Order.objects.get(pk=pk)
            if 'status' in request.data:
                order.status = request.data['status']
                order.save()
            return Response({'success': True})
        except Order.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
