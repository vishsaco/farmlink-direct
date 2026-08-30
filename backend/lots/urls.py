"""Lot URL routes."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"farms", views.FarmViewSet, basename="farm")
router.register(r"items", views.LotViewSet, basename="lot")

urlpatterns = [
    path("search/", views.search_lots, name="lot-search"),
    path("", include(router.urls)),
]
