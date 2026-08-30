"""Admin for fulfillment."""

from django.contrib import admin
from .models import FulfillmentEvent, Settlement


@admin.register(FulfillmentEvent)
class FulfillmentEventAdmin(admin.ModelAdmin):
    list_display = ["order", "event_type", "actor", "timestamp"]
    list_filter = ["event_type"]


@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    list_display = ["order", "gross_amount", "net_farmer_amount", "status"]
    list_filter = ["status"]
