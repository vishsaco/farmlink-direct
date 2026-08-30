"""
User and Organization models for FarmLink Direct.
Supports roles: farmer, fpo, buyer, ops, driver.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class Organization(models.Model):
    """FPO, buyer organization, or logistics company."""

    TYPE_CHOICES = [
        ("fpo", "Farmer Producer Organization"),
        ("buyer_org", "Buyer Organization"),
        ("logistics", "Logistics Provider"),
    ]

    name = models.CharField(max_length=200)
    org_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    location = models.CharField(max_length=300, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "organizations"

    def __str__(self):
        return f"{self.name} ({self.get_org_type_display()})"


class User(AbstractUser):
    """Custom user with role-based access for the marketplace."""

    ROLE_CHOICES = [
        ("farmer", "Farmer"),
        ("fpo", "FPO Operator"),
        ("buyer", "Institutional Buyer"),
        ("ops", "Operations Coordinator"),
        ("driver", "Driver"),
    ]

    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("hi", "Hindi"),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="farmer")
    phone = models.CharField(max_length=15, blank=True)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
    )
    language = models.CharField(
        max_length=5, choices=LANGUAGE_CHOICES, default="en"
    )
    is_verified = models.BooleanField(default=False)
    avatar_url = models.URLField(blank=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.get_full_name() or self.username} [{self.role}]"

    @property
    def is_farmer(self):
        return self.role == "farmer"

    @property
    def is_fpo(self):
        return self.role == "fpo"

    @property
    def is_buyer(self):
        return self.role == "buyer"

    @property
    def is_ops(self):
        return self.role == "ops"

    @property
    def is_driver(self):
        return self.role == "driver"
