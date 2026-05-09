from django.urls import path
from .views import (
    RegisterView, LoginView, MeView,
    GigListCreateView, GigDetailView,
    OrderListCreateView, OrderDetailView,
    AdminUsersView, AdminGigsView, AdminOrdersView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/',    LoginView.as_view()),
    path('auth/me/',       MeView.as_view()),

    # Gigs
    path('gigs/',       GigListCreateView.as_view()),
    path('gigs/<int:pk>/', GigDetailView.as_view()),

    # Orders
    path('orders/',          OrderListCreateView.as_view()),
    path('orders/<int:pk>/', OrderDetailView.as_view()),

    # Admin
    path('admin/users/',          AdminUsersView.as_view()),
    path('admin/gigs/',           AdminGigsView.as_view()),
    path('admin/gigs/<int:pk>/',  AdminGigsView.as_view()),
    path('admin/orders/',         AdminOrdersView.as_view()),
]
