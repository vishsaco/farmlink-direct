"""Serializers for Orders."""

from rest_framework import serializers
from .models import Order
from lots.serializers import LotSerializer


class OrderSerializer(serializers.ModelSerializer):
    lot_detail = LotSerializer(source="lot", read_only=True)
    buyer_name = serializers.CharField(
        source="buyer.get_full_name", read_only=True
    )
    buyer_phone = serializers.CharField(
        source="buyer.phone", read_only=True
    )
    buyer_org = serializers.SerializerMethodField()
    farmer_name = serializers.CharField(
        source="lot.created_by.get_full_name", read_only=True
    )
    farmer_phone = serializers.CharField(
        source="lot.created_by.phone", read_only=True
    )
    farmer_village = serializers.SerializerMethodField()
    driver_name = serializers.SerializerMethodField()
    driver_phone = serializers.SerializerMethodField()
    vehicle_info = serializers.SerializerMethodField()
    delivery_otp = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    valid_transitions = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "buyer", "buyer_name", "buyer_phone", "buyer_org",
            "lot", "lot_detail", "farmer_name", "farmer_phone", "farmer_village",
            "driver_name", "driver_phone", "vehicle_info", "delivery_otp",
            "requested_qty", "agreed_price", "total_amount",
            "status", "status_display", "valid_transitions",
            "delivery_address", "delivery_lat", "delivery_lng",
            "delivery_window_start", "delivery_window_end",
            "notes", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "buyer", "status", "created_at", "updated_at",
        ]

    def get_buyer_org(self, obj):
        if obj.buyer and obj.buyer.organization:
            return obj.buyer.organization.name
        if obj.buyer and obj.buyer.get_full_name():
            return f"{obj.buyer.get_full_name()} Procurement"
        return "Direct Commercial Buyer"

    def get_farmer_village(self, obj):
        if obj.lot and obj.lot.farm:
            return f"{obj.lot.farm.village}, {obj.lot.farm.district}"
        return "Lucknow Agri Cluster"

    def get_driver_name(self, obj):
        # Look for driver actor in fulfillment events
        event = obj.events.filter(actor__role="driver").first()
        if event and event.actor:
            return event.actor.get_full_name() or event.actor.username
        # Look for any registered driver in database
        from accounts.models import User
        driver = User.objects.filter(role="driver").first()
        if driver:
            return driver.get_full_name() or driver.username
        return "Designated Fleet Driver"

    def get_driver_phone(self, obj):
        event = obj.events.filter(actor__role="driver").first()
        if event and event.actor and event.actor.phone:
            return event.actor.phone
        from accounts.models import User
        driver = User.objects.filter(role="driver").first()
        if driver and driver.phone:
            return driver.phone
        return "+91-9876500000"

    def get_vehicle_info(self, obj):
        return "Tata Ace Gold • Lucknow Regional Logistics"

    def get_delivery_otp(self, obj):
        # Deterministic 4-digit verification code based on Order ID
        return str((obj.id * 1337 + 2345) % 9000 + 1000)

    def get_total_amount(self, obj):
        return round(obj.requested_qty * obj.agreed_price, 2)

    def get_valid_transitions(self, obj):
        return Order.VALID_TRANSITIONS.get(obj.status, [])


class CreateOrderSerializer(serializers.Serializer):
    """Validates order creation input."""
    lot_id = serializers.IntegerField()
    requested_qty = serializers.FloatField(min_value=1)
    agreed_price = serializers.FloatField(min_value=0.01)
    delivery_address = serializers.CharField(required=False, default="")
    delivery_lat = serializers.FloatField(required=False)
    delivery_lng = serializers.FloatField(required=False)
    delivery_window_start = serializers.DateTimeField(required=False)
    delivery_window_end = serializers.DateTimeField(required=False)
    notes = serializers.CharField(required=False, default="")


class StatusTransitionSerializer(serializers.Serializer):
    """Validates status transition."""
    new_status = serializers.CharField()
    note = serializers.CharField(required=False, default="")
