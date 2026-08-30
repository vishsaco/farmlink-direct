"""
Forecast model and pre-seeded price engine for FarmLink Direct.
Provides 7-day price guidance with explainable inputs.
"""

from django.db import models


class Forecast(models.Model):
    """
    A versioned 7-day price forecast for a commodity in a market cluster.
    Never overwritten — each update creates a new version.
    """

    CONFIDENCE_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    commodity = models.CharField(max_length=20)
    market_cluster = models.CharField(max_length=100, default="Lucknow")
    forecast_date = models.DateField()
    price_low = models.FloatField(help_text="Low estimate in INR/kg")
    price_base = models.FloatField(help_text="Base estimate in INR/kg")
    price_high = models.FloatField(help_text="High estimate in INR/kg")
    confidence = models.CharField(
        max_length=10, choices=CONFIDENCE_CHOICES, default="medium"
    )
    source_version = models.CharField(
        max_length=50, default="seed-v1",
        help_text="Version of the data/model used"
    )
    explanation = models.TextField(
        blank=True,
        help_text="Human-readable explanation of the forecast inputs"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "forecasts"
        ordering = ["forecast_date"]
        unique_together = [
            "commodity", "market_cluster", "forecast_date", "source_version"
        ]

    def __str__(self):
        return (
            f"{self.commodity} @ {self.market_cluster} "
            f"on {self.forecast_date}: ₹{self.price_base}/kg "
            f"[{self.confidence}]"
        )


class MarketPrice(models.Model):
    """Historical market price data for reference/training."""

    commodity = models.CharField(max_length=20)
    market = models.CharField(max_length=100)
    date = models.DateField()
    min_price = models.FloatField()
    max_price = models.FloatField()
    modal_price = models.FloatField()
    unit = models.CharField(max_length=10, default="kg")
    source = models.CharField(max_length=50, default="seed")

    class Meta:
        db_table = "market_prices"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.commodity} @ {self.market}: ₹{self.modal_price}/kg on {self.date}"
