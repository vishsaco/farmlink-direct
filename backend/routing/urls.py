"""Routing URL routes."""

from django.urls import path
from . import views

urlpatterns = [
    path("plan/", views.create_route_plan, name="route-plan"),
    path("<int:route_id>/", views.route_detail, name="route-detail"),
]
