import uuid
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Gig, Order, Review, Message, Favourite


class UserSerializer(serializers.ModelSerializer):
    name           = serializers.ReadOnlyField()
    total_earnings = serializers.ReadOnlyField()
    skills_list    = serializers.ReadOnlyField()

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'name', 'email', 'role', 'bio',
            'skills', 'skills_list', 'location', 'avatar_url',
            'hourly_rate', 'total_earnings',
        ]
        read_only_fields = ['id']


class UserUpdateSerializer(serializers.ModelSerializer):
    """For PATCH /api/auth/me/ — lets user update their profile."""
    name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model  = User
        fields = ['name', 'bio', 'skills', 'location', 'avatar_url', 'hourly_rate']

    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        if name:
            parts = name.strip().split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name  = parts[1] if len(parts) > 1 else ''
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name     = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['name', 'email', 'password', 'role', 'bio']

    def validate(self, attrs):
        if User.objects.filter(email__iexact=attrs.get('email')).exists():
            raise serializers.ValidationError({'message': 'A user with this email already exists.'})
        return attrs

    def create(self, validated_data):
        name  = validated_data.pop('name', '')
        parts = name.strip().split(' ', 1)
        username = validated_data['email'].split('@')[0][:20] + '_' + uuid.uuid4().hex[:6]
        user = User.objects.create_user(
            username   = username,
            email      = validated_data['email'],
            password   = validated_data['password'],
            first_name = parts[0],
            last_name  = parts[1] if len(parts) > 1 else '',
            role       = validated_data.get('role', 'buyer'),
            bio        = validated_data.get('bio', ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = User.objects.filter(email__iexact=data['email']).first()
        if not user:
            raise serializers.ValidationError({'message': 'No account with this email.'})
        if not user.check_password(data['password']):
            raise serializers.ValidationError({'message': 'Incorrect password.'})
        refresh = RefreshToken.for_user(user)
        data['user']  = user
        data['token'] = str(refresh.access_token)
        return data


class GigSerializer(serializers.ModelSerializer):
    seller_name    = serializers.ReadOnlyField()
    price          = serializers.ReadOnlyField()
    badge          = serializers.SerializerMethodField()
    seller_avatar  = serializers.SerializerMethodField()
    seller_location= serializers.SerializerMethodField()
    is_favourited  = serializers.SerializerMethodField()

    class Meta:
        model  = Gig
        fields = [
            'id', 'title', 'category', 'description',
            'seller', 'seller_name', 'seller_avatar', 'seller_location',
            'price', 'price_basic', 'price_standard', 'price_premium',
            'delivery_basic', 'delivery_standard', 'delivery_premium',
            'rating', 'review_count', 'orders_completed', 'badge',
            'is_active', 'is_favourited', 'created_at',
        ]
        read_only_fields = ['id', 'seller', 'rating', 'review_count', 'orders_completed', 'created_at']

    def get_badge(self, obj):
        if obj.orders_completed >= 100: return 'Top Rated'
        if obj.orders_completed >= 50:  return 'Best Seller'
        if obj.orders_completed >= 10:  return 'Popular'
        return 'New'

    def get_seller_avatar(self, obj):
        return obj.seller.avatar_url or ''

    def get_seller_location(self, obj):
        return obj.seller.location or ''

    def get_is_favourited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favourite.objects.filter(user=request.user, gig=obj).exists()
        return False

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)


class OrderSerializer(serializers.ModelSerializer):
    gig_title   = serializers.ReadOnlyField()
    buyer_name  = serializers.ReadOnlyField()
    seller_name = serializers.ReadOnlyField()

    class Meta:
        model  = Order
        fields = [
            'id', 'gig', 'gig_title', 'buyer', 'buyer_name',
            'seller', 'seller_name', 'package', 'status',
            'amount', 'requirements', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'buyer', 'seller', 'created_at', 'updated_at']

    def create(self, validated_data):
        gig    = validated_data['gig']
        pkg    = validated_data.get('package', 'standard')
        prices = {'basic': gig.price_basic, 'standard': gig.price_standard, 'premium': gig.price_premium}
        validated_data['buyer']  = self.context['request'].user
        validated_data['seller'] = gig.seller
        validated_data['amount'] = validated_data.get('amount') or prices.get(pkg, gig.price_standard)
        return super().create(validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    buyer_name     = serializers.ReadOnlyField(source='buyer.name')
    buyer_initials = serializers.SerializerMethodField()
    buyer_avatar   = serializers.SerializerMethodField()

    class Meta:
        model  = Review
        fields = ['id', 'buyer', 'buyer_name', 'buyer_initials', 'buyer_avatar',
                  'seller', 'gig', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'buyer', 'seller', 'gig', 'created_at']

    def get_buyer_initials(self, obj):
        parts = obj.buyer.name.split()
        return (parts[0][0] + (parts[1][0] if len(parts) > 1 else '')).upper()

    def get_buyer_avatar(self, obj):
        return obj.buyer.avatar_url or ''

    def create(self, validated_data):
        order = Order.objects.get(id=self.context['request'].data.get('order'))
        buyer = self.context['request'].user
        if order.buyer != buyer:
            raise serializers.ValidationError('Only the buyer can review.')
        if order.status != 'completed':
            raise serializers.ValidationError('Order must be completed first.')
        review = Review.objects.create(
            order=order, buyer=buyer, seller=order.seller, gig=order.gig,
            rating=validated_data['rating'], comment=validated_data['comment']
        )
        gig     = order.gig
        reviews = Review.objects.filter(gig=gig)
        gig.rating       = round(sum(r.rating for r in reviews) / reviews.count(), 1)
        gig.review_count = reviews.count()
        gig.save()
        return review


class MessageSerializer(serializers.ModelSerializer):
    sender_name   = serializers.ReadOnlyField(source='sender.name')
    sender_avatar = serializers.SerializerMethodField()
    receiver_name = serializers.ReadOnlyField(source='receiver.name')

    class Meta:
        model  = Message
        fields = ['id', 'sender', 'sender_name', 'sender_avatar',
                  'receiver', 'receiver_name', 'order', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']

    def get_sender_avatar(self, obj):
        return obj.sender.avatar_url or ''

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class FavouriteSerializer(serializers.ModelSerializer):
    gig_data = GigSerializer(source='gig', read_only=True)

    class Meta:
        model  = Favourite
        fields = ['id', 'gig', 'gig_data', 'created_at']
        read_only_fields = ['id', 'created_at']
