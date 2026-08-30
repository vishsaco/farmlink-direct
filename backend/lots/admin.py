"""Admin configuration for lots."""

from django.contrib import admin
from .models import Farm, Lot


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ["name", "owner", "village", "district", "latitude", "longitude"]
    list_filter = ["district"]


@admin.register(Lot)
class LotAdmin(admin.ModelAdmin):
    list_display = [
        "commodity", "grade", "available_qty", "reserved_qty",
        "asking_price", "status", "farm", "created_by",
    ]
    list_filter = ["commodity", "grade", "status"]
    search_fields = ["farm__village", "created_by__username"]
