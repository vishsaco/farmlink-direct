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


class PredictionAccuracy(models.Model):
    """
    Tracks forecast accuracy for backtesting and model validation.
    Stores predicted vs actual for every commodity/day to compute
    rolling MAPE, MAE, RMSE metrics.
    """

    commodity = models.CharField(max_length=20, db_index=True)
    market_cluster = models.CharField(max_length=100, default="Lucknow")
    forecast_date = models.DateField(db_index=True)
    horizon_days = models.IntegerField(
        default=1, help_text="How many days ahead this prediction was made"
    )
    predicted_price = models.FloatField()
    actual_price = models.FloatField(null=True, blank=True)
    absolute_error = models.FloatField(null=True, blank=True)
    percentage_error = models.FloatField(null=True, blank=True)
    model_version = models.CharField(max_length=50, default="ensemble-v5")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "prediction_accuracy"
        ordering = ["-forecast_date"]
        unique_together = [
            "commodity", "market_cluster", "forecast_date", "horizon_days", "model_version"
        ]

    def __str__(self):
        status = f"err={self.percentage_error:.1f}%" if self.percentage_error is not None else "pending"
        return f"{self.commodity} {self.forecast_date} h={self.horizon_days}d: pred=₹{self.predicted_price} ({status})"


class WeatherCache(models.Model):
    """Caches weather API responses to minimize API calls (free tier limit)."""

    location = models.CharField(max_length=50, default="Lucknow")
    date = models.DateField()
    temperature_c = models.FloatField(null=True)
    humidity_pct = models.FloatField(null=True)
    rainfall_mm = models.FloatField(default=0.0)
    condition = models.CharField(max_length=50, default="Clear")
    wind_speed_kmh = models.FloatField(default=0.0)
    raw_json = models.TextField(blank=True, default="")
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "weather_cache"
        unique_together = ["location", "date"]

    def __str__(self):
        return f"Weather {self.location} {self.date}: {self.temperature_c}°C, {self.condition}"
