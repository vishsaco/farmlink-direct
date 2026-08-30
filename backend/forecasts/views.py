"""Views for price forecasts and real Lucknow mandi integration."""

import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .engine import get_price_guidance, generate_forecasts, fetch_real_lucknow_mandi_prices
from .models import MarketPrice


@api_view(["GET"])
@permission_classes([AllowAny])
def forecast_view(request, commodity):
    """
    GET /api/forecasts/<commodity>/?cluster=Lucknow
    Returns today's base price, suggested range, 7-day trend, and Agmarknet source metadata.
    """
    cluster = request.query_params.get("cluster", "Lucknow")
    guidance = get_price_guidance(commodity, cluster)
    return Response(guidance)


@api_view(["POST"])
@permission_classes([AllowAny])
def sync_mandi_view(request):
    """
    POST /api/forecasts/sync-mandi/
    Body: { "commodity": "tomato", "api_key": "..." } (api_key optional)
    Triggers live Agmarknet sync for Lucknow cluster.
    """
    commodity = request.data.get("commodity", "tomato")
    api_key = request.data.get("api_key")

    result = fetch_real_lucknow_mandi_prices(commodity, api_key)
    # Regenerate 7-day forecast with newly fetched baseline
    generate_forecasts(commodity, "Lucknow", days=7)
    return Response(result)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_api_key_view(request):
    """
    POST /api/forecasts/config-key/
    Body: { "api_key": "..." }
    Sets the data.gov.in API key in the server process.
    """
    api_key = request.data.get("api_key", "").strip()
    if not api_key:
        return Response({"error": "API key required"}, status=status.HTTP_400_BAD_REQUEST)

    os.environ["DATA_GOV_IN_API_KEY"] = api_key
    return Response({"status": "ok", "message": "data.gov.in API key saved successfully for Lucknow cluster."})
