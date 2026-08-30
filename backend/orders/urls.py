"""Order URL routes."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.order_list_create, name="order-list-create"),
    path("<int:order_id>/", views.order_detail, name="order-detail"),
    path("<int:order_id>/status/", views.order_transition, name="order-transition"),
]
