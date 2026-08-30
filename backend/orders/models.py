"""
Order model and state machine for FarmLink Direct.
Canonical states: reserved → confirmed → pickup_scheduled → picked_up →
                  delivered → settlement_ready → settled
Side paths: cancelled, exception
"""

from django.db import models, transaction
from django.conf import settings
from lots.models import Lot


class Order(models.Model):
    """An order commitment from a buyer for a produce lot."""

    STATUS_CHOICES = [
        ("reserved", "Reserved"),
        ("confirmed", "Confirmed"),
        ("pickup_scheduled", "Pickup Scheduled"),
        ("picked_up", "Picked Up"),
        ("delivered", "Delivered"),
        ("settlement_ready", "Settlement Ready"),
        ("settled", "Settled"),
        ("cancelled", "Cancelled"),
        ("exception", "Exception"),
    ]

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders_as_buyer",
    )
    lot = models.ForeignKey(
        Lot,
        on_delete=models.CASCADE,
        related_name="orders",
    )
    requested_qty = models.FloatField(help_text="Quantity in kg")
    agreed_price = models.FloatField(help_text="Agreed price per kg in INR")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="reserved"
    )
    delivery_address = models.TextField(blank=True)
    delivery_lat = models.FloatField(null=True, blank=True)
    delivery_lng = models.FloatField(null=True, blank=True)
    delivery_window_start = models.DateTimeField(null=True, blank=True)
    delivery_window_end = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"Order #{self.id} - {self.requested_qty}kg "
            f"{self.lot.commodity} [{self.status}]"
        )

    # Valid state transitions
    VALID_TRANSITIONS = {
        "reserved": ["confirmed", "cancelled"],
        "confirmed": ["pickup_scheduled", "picked_up", "cancelled", "exception"],
        "pickup_scheduled": ["picked_up", "delivered", "exception", "cancelled"],
        "picked_up": ["delivered", "settlement_ready", "exception"],
        "delivered": ["settlement_ready", "settled", "exception"],
        "settlement_ready": ["settled"],
        "exception": ["confirmed", "pickup_scheduled", "picked_up", "cancelled"],
    }

    def can_transition_to(self, new_status):
        """Check if a state transition is valid."""
        allowed = self.VALID_TRANSITIONS.get(self.status, [])
        return new_status in allowed

    def transition_to(self, new_status, actor=None, note=""):
        """
        Advance the order state machine.
        Creates an audit event for every transition.
        """
        if not self.can_transition_to(new_status):
            raise ValueError(
                f"Cannot transition from '{self.status}' to '{new_status}'. "
                f"Allowed: {self.VALID_TRANSITIONS.get(self.status, [])}"
            )

        old_status = self.status
        self.status = new_status
        self.save(update_fields=["status", "updated_at"])

        # Create audit event
        from fulfillment.models import FulfillmentEvent
        FulfillmentEvent.objects.create(
            order=self,
            actor=actor,
            event_type=new_status,
            note=f"Transition: {old_status} → {new_status}. {note}".strip(),
        )

        # Handle cancellation — release reserved qty
        if new_status == "cancelled":
            self.lot.release(self.requested_qty)

        return self

    @classmethod
    def create_order(cls, buyer, lot, requested_qty, agreed_price, **kwargs):
        """
        Atomically create an order and reserve inventory.
        Uses database transaction to prevent double-selling.
        """
        with transaction.atomic():
            # Re-fetch lot with lock (SQLite uses IMMEDIATE mode)
            lot_fresh = Lot.objects.select_for_update().get(pk=lot.pk)

            if requested_qty > lot_fresh.remaining_qty:
                raise ValueError(
                    f"Insufficient quantity. Available: {lot_fresh.remaining_qty}kg, "
                    f"Requested: {requested_qty}kg"
                )

            # Reserve the quantity
            lot_fresh.reserve(requested_qty)

            # Create the order
            order = cls.objects.create(
                buyer=buyer,
                lot=lot_fresh,
                requested_qty=requested_qty,
                agreed_price=agreed_price,
                status="reserved",
                **kwargs,
            )

            # Create audit event
            from fulfillment.models import FulfillmentEvent
            FulfillmentEvent.objects.create(
                order=order,
                actor=buyer,
                event_type="reserved",
                note=f"Order created: {requested_qty}kg at ₹{agreed_price}/kg",
            )

            return order
