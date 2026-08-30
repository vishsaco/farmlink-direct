"""Serializers for Lots and Farms."""

from rest_framework import serializers
from .models import Farm, Lot


class FarmSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(
        source="owner.get_full_name", read_only=True
    )

    class Meta:
        model = Farm
        fields = [
            "id", "owner", "owner_name", "name", "village",
            "district", "state", "latitude", "longitude",
            "address", "created_at",
        ]
        read_only_fields = ["id", "owner", "created_at"]


class LotSerializer(serializers.ModelSerializer):
    farm = serializers.PrimaryKeyRelatedField(
        queryset=Farm.objects.all(), required=False, allow_null=True
    )
    farm_detail = FarmSerializer(source="farm", read_only=True)
    remaining_qty = serializers.FloatField(read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    commodity_display = serializers.CharField(
        source="get_commodity_display", read_only=True
    )
    grade_display = serializers.CharField(
        source="get_grade_display", read_only=True
    )
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Lot
        fields = [
            "id", "farm", "farm_detail", "created_by", "created_by_name",
            "commodity", "commodity_display", "grade", "grade_display",
            "available_qty", "reserved_qty", "remaining_qty", "unit",
            "asking_price", "harvest_at", "pickup_window_start",
            "pickup_window_end", "quality_notes", "photo_url",
            "status", "created_at", "updated_at", "distance_km",
        ]
        read_only_fields = [
            "id", "created_by", "reserved_qty", "status",
            "created_at", "updated_at",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["created_by"] = user
        validated_data["status"] = "listed"

        # Auto-link or auto-create farm if not explicitly provided
        if not validated_data.get("farm"):
            farm = Farm.objects.filter(owner=user).first()
            if not farm:
                village_name = "Bakshi Ka Talab"
                if user.organization and user.organization.location:
                    village_name = user.organization.location.split(",")[0].strip()
                farm = Farm.objects.create(
                    owner=user,
                    name=f"{user.first_name or user.username}'s Farm",
                    village=village_name,
                    district="Lucknow",
                    state="Uttar Pradesh",
                    latitude=26.9124,
                    longitude=80.8947,
                    address=f"{village_name}, Lucknow, Uttar Pradesh",
                )
            validated_data["farm"] = farm

        return super().create(validated_data)


class LotSearchSerializer(serializers.Serializer):
    """Query parameters for buyer spatial search."""
    commodity = serializers.CharField(required=False)
    grade = serializers.CharField(required=False)
    max_price = serializers.FloatField(required=False)
    min_qty = serializers.FloatField(required=False)
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)
    radius_km = serializers.FloatField(required=False, default=50.0)
    sort_by = serializers.CharField(required=False, default="distance")
