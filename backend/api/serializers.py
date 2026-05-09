from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Gig, Order


class UserSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'name', 'email', 'role', 'bio']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name     = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['name', 'email', 'password', 'role']

    def create(self, validated_data):
        name  = validated_data.pop('name', '')
        parts = name.strip().split(' ', 1)
        user  = User.objects.create_user(
            username   = validated_data['email'].split('@')[0] + str(User.objects.count()),
            email      = validated_data['email'],
            password   = validated_data['password'],
            first_name = parts[0],
            last_name  = parts[1] if len(parts) > 1 else '',
            role       = validated_data.get('role', 'buyer'),
        )
        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError({'message': 'No account with this email.'})

        if not user.check_password(data['password']):
            raise serializers.ValidationError({'message': 'Incorrect password.'})

        refresh = RefreshToken.for_user(user)
        data['user']  = user
        data['token'] = str(refresh.access_token)
        return data


class GigSerializer(serializers.ModelSerializer):
    seller_name = serializers.ReadOnlyField()
    price       = serializers.ReadOnlyField()
    badge       = serializers.SerializerMethodField()

    class Meta:
        model  = Gig
        fields = [
            'id', 'title', 'category', 'description',
            'seller', 'seller_name',
            'price', 'price_basic', 'price_standard', 'price_premium',
            'delivery_basic', 'delivery_standard', 'delivery_premium',
            'rating', 'review_count', 'orders_completed', 'badge',
            'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'seller', 'rating', 'review_count', 'orders_completed', 'created_at']

    def get_badge(self, obj):
        if obj.orders_completed >= 100: return 'Top Rated'
        if obj.orders_completed >= 50:  return 'Best Seller'
        if obj.orders_completed >= 10:  return 'Popular'
        return 'New'

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
            'amount', 'requirements', 'created_at',
        ]
        read_only_fields = ['id', 'buyer', 'seller', 'created_at']

    def create(self, validated_data):
        gig    = validated_data['gig']
        pkg    = validated_data.get('package', 'standard')
        prices = {'basic': gig.price_basic, 'standard': gig.price_standard, 'premium': gig.price_premium}
        validated_data['buyer']  = self.context['request'].user
        validated_data['seller'] = gig.seller
        validated_data['amount'] = validated_data.get('amount') or prices.get(pkg, gig.price_standard)
        return super().create(validated_data)
