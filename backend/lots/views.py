"""
Lot views: CRUD for farmers/FPOs, spatial search for buyers.
Uses Haversine distance calculation instead of PostGIS for zero-setup.
"""

from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Farm, Lot
from .serializers import FarmSerializer, LotSerializer, LotSearchSerializer


class FarmViewSet(viewsets.ModelViewSet):
    """CRUD for farms — farmers see their own, FPOs see member farms."""
    serializer_class = FarmSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_fpo and user.organization:
            return Farm.objects.filter(
                owner__organization=user.organization
            )
        return Farm.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class LotViewSet(viewsets.ModelViewSet):
    """CRUD for lots — farmers/FPOs create and manage listings."""
    serializer_class = LotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_buyer:
            return Lot.objects.filter(status__in=["listed", "partially_reserved"])
        if user.is_fpo and user.organization:
            return Lot.objects.filter(
                created_by__organization=user.organization
            )
        if user.is_ops or user.is_driver:
            return Lot.objects.all()
        return Lot.objects.filter(created_by=user)

    def perform_create(self, serializer):
        serializer.save()


@api_view(["GET"])
@permission_classes([AllowAny])
def search_lots(request):
    """
    GET /api/lots/search/?commodity=tomato&latitude=26.8&longitude=80.9&radius_km=50
    Spatial search using Haversine distance. Returns lots sorted by distance.
    """
    params = LotSearchSerializer(data=request.query_params)
    params.is_valid(raise_exception=True)
    data = params.validated_data

    qs = Lot.objects.filter(status__in=["listed", "partially_reserved"])

    if "commodity" in data:
        qs = qs.filter(commodity=data["commodity"])
    if "grade" in data:
        qs = qs.filter(grade=data["grade"])
    if "max_price" in data:
        qs = qs.filter(asking_price__lte=data["max_price"])

    lat = data.get("latitude")
    lng = data.get("longitude")
    radius_km = data.get("radius_km", 50.0)

    results = []
    for lot in qs.select_related("farm", "created_by"):
        if lot.remaining_qty <= 0:
            continue
        dist = None
        if lat is not None and lng is not None:
            dist = lot.distance_to(lat, lng)
            if dist > radius_km:
                continue

        serializer = LotSerializer(lot)
        lot_data = serializer.data
        lot_data["distance_km"] = dist
        results.append((dist if dist is not None else 0, lot_data))

    results.sort(key=lambda x: x[0])
    return Response({
        "count": len(results),
        "radius_km": radius_km,
        "results": [r[1] for r in results],
    })
