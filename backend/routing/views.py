"""Routing views."""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Route, RouteStop
from .planner import plan_route


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_route_plan(request):
    """
    POST /api/routes/plan/
    Body: { "order_ids": [1, 2, 3], "vehicle_capacity": 2000 }
    Generates a pickup-delivery route plan.
    """
    order_ids = request.data.get("order_ids", [])
    vehicle_capacity = request.data.get("vehicle_capacity", 2000)

    if not order_ids:
        return Response({"error": "order_ids required"}, status=400)

    try:
        route = plan_route(order_ids, vehicle_capacity)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    stops = RouteStop.objects.filter(route=route).order_by("sequence")

    return Response({
        "route_id": route.id,
        "vehicle": {
            "id": route.vehicle_id,
            "name": route.vehicle_name,
            "max_capacity_kg": route.max_capacity_kg,
        },
        "summary": {
            "total_distance_km": route.total_distance_km,
            "total_load_kg": route.total_load_kg,
            "load_utilization": round(
                route.total_load_kg / route.max_capacity_kg * 100, 1
            ),
            "estimated_duration_mins": route.estimated_duration_mins,
            "stop_count": stops.count(),
            "planned_date": str(route.planned_date),
        },
        "stops": [
            {
                "sequence": s.sequence,
                "type": s.stop_type,
                "location": s.location_name,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "eta": s.eta.isoformat(),
                "load_kg": s.load_kg,
                "order_id": s.order_id,
                "status": s.status,
            }
            for s in stops
        ],
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def route_detail(request, route_id):
    """GET /api/routes/<id>/ — Route detail with all stops."""
    try:
        route = Route.objects.get(pk=route_id)
    except Route.DoesNotExist:
        return Response({"error": "Route not found"}, status=404)

    stops = route.stops.order_by("sequence")

    return Response({
        "route_id": route.id,
        "vehicle": {
            "id": route.vehicle_id,
            "name": route.vehicle_name,
            "max_capacity_kg": route.max_capacity_kg,
        },
        "summary": {
            "total_distance_km": route.total_distance_km,
            "total_load_kg": route.total_load_kg,
            "estimated_duration_mins": route.estimated_duration_mins,
            "status": route.status,
            "planned_date": str(route.planned_date),
        },
        "stops": [
            {
                "sequence": s.sequence,
                "type": s.stop_type,
                "location": s.location_name,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "eta": s.eta.isoformat(),
                "load_kg": s.load_kg,
                "order_id": s.order_id,
                "status": s.status,
            }
            for s in stops
        ],
    })
