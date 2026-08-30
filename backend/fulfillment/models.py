"""
Fulfillment models: delivery proof events and settlement records.
Append-only audit trail for every handoff.
"""

from django.db import models
from django.conf import settings


class FulfillmentEvent(models.Model):
    """
    Append-only audit event for order state changes.
    Records actor, timestamp, location, and evidence for every handoff.
    """

    EVENT_TYPE_CHOICES = [
        ("reserved", "Reserved"),
        ("confirmed", "Confirmed"),
        ("pickup_scheduled", "Pickup Scheduled"),
        ("picked_up", "Picked Up"),
        ("delivered", "Delivered"),
        ("settlement_ready", "Settlement Ready"),
        ("settled", "Settled"),
        ("exception", "Exception"),
        ("cancelled", "Cancelled"),
        ("note", "Note"),
    ]

    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="events",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    media_url = models.URLField(blank=True, help_text="Photo evidence URL")
    otp_code = models.CharField(max_length=6, blank=True)
    note = models.TextField(blank=True)

    class Meta:
        db_table = "fulfillment_events"
        ordering = ["timestamp"]

    def __str__(self):
        return (
            f"Order #{self.order_id} - {self.get_event_type_display()} "
            f"at {self.timestamp}"
        )


class Settlement(models.Model):
    """
    Settlement record — transparent fee breakdown.
    MVP: status tracking only, no live money movement.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("ready", "Ready for Release"),
        ("settled", "Settled"),
        ("disputed", "Disputed"),
    ]

    order = models.OneToOneField(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="settlement",
    )
    gross_amount = models.FloatField(help_text="Total amount (qty × price)")
    logistics_fee = models.FloatField(help_text="Logistics deduction")
    platform_fee = models.FloatField(help_text="Platform deduction")
    net_farmer_amount = models.FloatField(help_text="Amount due to farmer")
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default="pending"
    )
    settlement_reference = models.CharField(
        max_length=100, blank=True,
        help_text="Simulated transaction reference"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "settlements"

    def __str__(self):
        return (
            f"Settlement for Order #{self.order_id}: "
            f"₹{self.net_farmer_amount} [{self.status}]"
        )

    @classmethod
    def create_for_order(cls, order):
        """
        Create a settlement record when order reaches delivered status.
        Uses configured fee percentages from settings.
        """
        config = settings.FARMLINK_CONFIG
        gross = order.requested_qty * order.agreed_price
        logistics = round(gross * config["LOGISTICS_FEE_PERCENT"] / 100, 2)
        platform = round(gross * config["PLATFORM_FEE_PERCENT"] / 100, 2)
        net = round(gross - logistics - platform, 2)

        settlement, created = cls.objects.get_or_create(
            order=order,
            defaults={
                "gross_amount": gross,
                "logistics_fee": logistics,
                "platform_fee": platform,
                "net_farmer_amount": net,
                "status": "ready",
                "settlement_reference": f"SIM-{order.id:06d}",
            }
        )
        return settlement
