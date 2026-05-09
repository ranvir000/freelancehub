from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as Base
from .models import User, Gig, Order

@admin.register(User)
class UserAdmin(Base):
    list_display  = ['username', 'name', 'email', 'role', 'date_joined']
    list_filter   = ['role']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    fieldsets     = Base.fieldsets + (('Role', {'fields': ('role', 'bio')}),)

@admin.register(Gig)
class GigAdmin(admin.ModelAdmin):
    list_display  = ['title', 'seller', 'category', 'price_basic', 'orders_completed', 'is_active']
    list_filter   = ['category', 'is_active']
    search_fields = ['title']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ['id', 'gig', 'buyer', 'seller', 'package', 'amount', 'status', 'created_at']
    list_filter   = ['status', 'package']
    search_fields = ['buyer__username', 'seller__username']
