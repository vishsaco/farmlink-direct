"""
Route and stop models for delivery planning.
"""

from django.db import models
from django.conf import settings


class Route(models.Model):
    """A planned pickup-delivery route for confirmed orders."""

    STATUS_CHOICES = [
        ("planned", "Planned"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    vehicle_id = models.CharField(max_length=20, default="VH-001")
    vehicle_name = models.CharField(max_length=100, default="Demo Vehicle")
    max_capacity_kg = models.FloatField(default=2000)
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default="planned"
    )
    total_distance_km = models.FloatField(default=0)
    total_load_kg = models.FloatField(default=0)
    estimated_duration_mins = models.IntegerField(default=0)
    planned_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "routes"
        ordering = ["-planned_date"]

    def __str__(self):
        return (
            f"Route {self.vehicle_id} on {self.planned_date} "
            f"[{self.status}] {self.total_load_kg}/{self.max_capacity_kg}kg"
        )


class RouteStop(models.Model):
    """A stop in a route — either pickup or delivery."""

    STOP_TYPE_CHOICES = [
        ("pickup", "Pickup"),
        ("delivery", "Delivery"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("skipped", "Skipped"),
        ("exception", "Exception"),
    ]

    route = models.ForeignKey(
        Route, on_delete=models.CASCADE, related_name="stops"
    )
    order = models.ForeignKey(
        "orders.Order", on_delete=models.CASCADE, related_name="route_stops"
    )
    sequence = models.IntegerField()
    stop_type = models.CharField(max_length=10, choices=STOP_TYPE_CHOICES)
    location_name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    eta = models.DateTimeField()
    load_kg = models.FloatField()
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default="pending"
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "route_stops"
        ordering = ["route", "sequence"]

    def __str__(self):
        return (
            f"Stop #{self.sequence} [{self.stop_type}] "
            f"@ {self.location_name} - {self.load_kg}kg"
        )
