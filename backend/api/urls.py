from django.urls import path
from .views import (
    RegisterView, LoginView, MeView,
    UserDetailView,
    GigListCreateView, GigDetailView,
    OrderListCreateView, OrderDetailView,
    AdminUsersView, AdminGigsView, AdminOrdersView,
    ReviewListCreateView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/',    LoginView.as_view()),
    path('auth/me/',       MeView.as_view()),

    # Users (public profile lookup)
    path('users/<pk>/',    UserDetailView.as_view()),   # supports numeric id and 'me'

    # Gigs
    path('gigs/',           GigListCreateView.as_view()),
    path('gigs/<int:pk>/',  GigDetailView.as_view()),

    # Orders
    path('orders/',           OrderListCreateView.as_view()),
    path('orders/<int:pk>/',  OrderDetailView.as_view()),

    # Admin
    path('admin/users/',          AdminUsersView.as_view()),
    path('admin/gigs/',           AdminGigsView.as_view()),
    path('admin/gigs/<int:pk>/',  AdminGigsView.as_view()),
    path('admin/orders/',         AdminOrdersView.as_view()),

    # Reviews
    path('reviews/',              ReviewListCreateView.as_view()),
]
