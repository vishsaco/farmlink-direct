"""Admin for forecasts."""

from django.contrib import admin
from .models import Forecast, MarketPrice


@admin.register(Forecast)
class ForecastAdmin(admin.ModelAdmin):
    list_display = ["commodity", "market_cluster", "forecast_date", "price_base", "confidence"]
    list_filter = ["commodity", "confidence"]


@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    list_display = ["commodity", "market", "date", "modal_price"]
