from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("login/", views.login_view, name="auth-login"),
    path("register/", views.register_view, name="auth-register"),
    path("google/", views.google_auth_view, name="auth-google"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.me_view, name="auth-me"),
    path("language/", views.update_language, name="auth-language"),
    path("verify-farmer-id/", views.verify_farmer_id_view, name="auth-verify-farmer-id"),
    path("verify-kisan/", views.verify_kisan_view, name="auth-verify-kisan"),
    path("payout-details/", views.update_payout_details, name="auth-payout-details"),
]

