"""Fulfillment URL routes."""

from django.urls import path
from . import views

urlpatterns = [
    path("orders/<int:order_id>/proof/", views.delivery_proof, name="delivery-proof"),
    path("orders/<int:order_id>/timeline/", views.order_timeline, name="order-timeline"),
    path("orders/<int:order_id>/otp/", views.generate_otp, name="generate-otp"),
    path("settlements/<int:order_id>/", views.settlement_detail, name="settlement-detail"),
    path("exceptions/", views.exceptions_list, name="exceptions-list"),
]
