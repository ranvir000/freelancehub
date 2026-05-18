from django.urls import path
from .views import (
    RegisterView, LoginView, MeView,
    UserDetailView, SellerListView,
    GigListCreateView, GigDetailView,
    OrderListCreateView, OrderDetailView,
    ReviewListCreateView,
    MessageListCreateView, UnreadCountView,
    FavouriteListView, FavouriteToggleView,
    AdminUsersView, AdminGigsView, AdminOrdersView,
    SupportChatView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/',    LoginView.as_view()),
    path('auth/me/',       MeView.as_view()),

    # Users
    path('users/<pk>/',    UserDetailView.as_view()),
    path('sellers/',       SellerListView.as_view()),
    path('support/chat/',  SupportChatView.as_view()),

    # Gigs
    path('gigs/',           GigListCreateView.as_view()),
    path('gigs/<int:pk>/',  GigDetailView.as_view()),

    # Orders
    path('orders/',           OrderListCreateView.as_view()),
    path('orders/<int:pk>/',  OrderDetailView.as_view()),

    # Reviews
    path('reviews/',          ReviewListCreateView.as_view()),

    # Messages
    path('messages/',         MessageListCreateView.as_view()),
    path('messages/unread/',  UnreadCountView.as_view()),

    # Favourites
    path('favourites/',           FavouriteListView.as_view()),
    path('favourites/toggle/',    FavouriteToggleView.as_view()),

    # Admin
    path('admin/users/',          AdminUsersView.as_view()),
    path('admin/users/<int:pk>/', AdminUsersView.as_view()),
    path('admin/gigs/',           AdminGigsView.as_view()),
    path('admin/gigs/<int:pk>/',  AdminGigsView.as_view()),
    path('admin/orders/',         AdminOrdersView.as_view()),
    path('admin/orders/<int:pk>/',AdminOrdersView.as_view()),
]
