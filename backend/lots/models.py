"""
Lot and Farm models for FarmLink Direct.
Uses lat/lng with Haversine distance for spatial search (no PostGIS needed).
"""

import math
from django.db import models
from django.conf import settings


class Farm(models.Model):
    """A farm location owned by a farmer, optionally managed by an FPO."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="farms",
    )
    name = models.CharField(max_length=200, blank=True)
    village = models.CharField(max_length=200)
    district = models.CharField(max_length=200, default="Lucknow")
    state = models.CharField(max_length=100, default="Uttar Pradesh")
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "farms"

    def __str__(self):
        return f"{self.name or self.village} ({self.owner})"

    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        """Calculate the great-circle distance between two points in km."""
        R = 6371  # Earth's radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c


class Lot(models.Model):
    """A produce listing — the core unit of supply in FarmLink Direct."""

    COMMODITY_CHOICES = [
        ("tomato", "Tomato (Tamatar)"),
        ("onion", "Onion (Pyaaz)"),
        ("potato", "Potato (Aaloo)"),
        ("mango", "Mango (Malihabadi Dussehri)"),
        ("chilli", "Green Chilli (Hari Mirch)"),
        ("garlic", "Garlic (Lahsun)"),
        ("ginger", "Ginger (Adrak)"),
        ("spinach", "Spinach (Palak)"),
        ("cauliflower", "Cauliflower (Gobhi)"),
        ("wheat", "Wheat (Gehu)"),
    ]

    GRADE_CHOICES = [
        ("A", "Grade A - Premium"),
        ("B", "Grade B - Standard"),
        ("C", "Grade C - Economy"),
    ]

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("listed", "Listed"),
        ("partially_reserved", "Partially Reserved"),
        ("fully_reserved", "Fully Reserved"),
        ("exhausted", "Exhausted"),
    ]

    UNIT_CHOICES = [
        ("kg", "Kilogram"),
        ("quintal", "Quintal"),
    ]

    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="lots")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_lots",
    )
    commodity = models.CharField(max_length=20, choices=COMMODITY_CHOICES)
    grade = models.CharField(max_length=5, choices=GRADE_CHOICES)
    available_qty = models.FloatField(help_text="Available quantity in kg")
    reserved_qty = models.FloatField(default=0, help_text="Reserved quantity in kg")
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default="kg")
    asking_price = models.FloatField(help_text="Price per kg in INR")
    harvest_at = models.DateField(help_text="Harvest or ready date")
    pickup_window_start = models.DateTimeField(
        help_text="Earliest pickup time"
    )
    pickup_window_end = models.DateTimeField(
        help_text="Latest pickup time"
    )
    quality_notes = models.TextField(blank=True)
    photo_url = models.URLField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="draft"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lots"
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.get_commodity_display()} Grade {self.grade} "
            f"- {self.available_qty}kg @ ₹{self.asking_price}/kg"
        )

    @property
    def remaining_qty(self):
        return max(0, self.available_qty - self.reserved_qty)

    @property
    def is_available(self):
        return self.status == "listed" and self.remaining_qty > 0

    def reserve(self, qty):
        """Atomically reserve quantity. Returns True if successful."""
        if qty > self.remaining_qty:
            return False
        self.reserved_qty += qty
        if self.reserved_qty >= self.available_qty:
            self.status = "fully_reserved"
        elif self.reserved_qty > 0:
            self.status = "partially_reserved"
        self.save(update_fields=["reserved_qty", "status", "updated_at"])
        return True

    def release(self, qty):
        """Release reserved quantity back to available."""
        self.reserved_qty = max(0, self.reserved_qty - qty)
        if self.reserved_qty == 0:
            self.status = "listed"
        elif self.reserved_qty < self.available_qty:
            self.status = "partially_reserved"
        self.save(update_fields=["reserved_qty", "status", "updated_at"])

    def distance_to(self, lat, lng):
        """Calculate distance from this lot's origin farm to given coordinates in km."""
        if self.farm and self.farm.latitude is not None and self.farm.longitude is not None:
            return round(Farm.haversine_distance(self.farm.latitude, self.farm.longitude, lat, lng), 1)
        return 12.0

