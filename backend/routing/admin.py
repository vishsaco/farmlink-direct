"""Admin for routing."""

from django.contrib import admin
from .models import Route, RouteStop


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ["id", "vehicle_id", "planned_date", "total_load_kg", "status"]
    list_filter = ["status"]


@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ["route", "sequence", "stop_type", "location_name", "load_kg", "status"]
