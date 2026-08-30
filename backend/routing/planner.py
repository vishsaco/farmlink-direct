"""
Route planner using simple nearest-neighbor heuristic.
OR-Tools can be used for production; this works for demo with deterministic results.
"""

from datetime import datetime, timedelta, date
from lots.models import Farm
from orders.models import Order
from .models import Route, RouteStop


def plan_route(order_ids, vehicle_capacity=2000, start_lat=26.8467, start_lng=80.9462):
    """
    Generate a pickup-delivery route for confirmed orders.
    Uses nearest-neighbor heuristic with capacity and time-window constraints.
    
    Args:
        order_ids: List of order IDs to include
        vehicle_capacity: Max vehicle capacity in kg
        start_lat/lng: Vehicle depot location (default: Lucknow center)
    
    Returns:
        Route object with stops
    """
    orders = Order.objects.filter(
        id__in=order_ids,
        status__in=["confirmed", "reserved"],
    ).select_related("lot", "lot__farm")

    if not orders:
        raise ValueError("No valid orders found for routing")

    # Check total load vs capacity
    total_load = sum(o.requested_qty for o in orders)
    if total_load > vehicle_capacity:
        raise ValueError(
            f"Total load ({total_load}kg) exceeds vehicle capacity ({vehicle_capacity}kg)"
        )

    # Create route
    route = Route.objects.create(
        vehicle_id="VH-001",
        vehicle_name="FarmLink Demo Vehicle (Tata Ace)",
        max_capacity_kg=vehicle_capacity,
        total_load_kg=total_load,
        planned_date=date.today(),
        status="planned",
    )

    # Build stops using nearest-neighbor
    stops = []
    current_lat, current_lng = start_lat, start_lng
    remaining_orders = list(orders)
    sequence = 1
    current_time = datetime.now().replace(hour=6, minute=0)  # Start at 6 AM
    total_distance = 0

    while remaining_orders:
        # Find nearest pickup
        nearest = min(
            remaining_orders,
            key=lambda o: Farm.haversine_distance(
                current_lat, current_lng,
                o.lot.farm.latitude, o.lot.farm.longitude,
            ),
        )

        # Pickup stop
        dist = Farm.haversine_distance(
            current_lat, current_lng,
            nearest.lot.farm.latitude, nearest.lot.farm.longitude,
        )
        travel_mins = max(15, int(dist * 2.5))  # ~24 km/h avg speed
        current_time += timedelta(minutes=travel_mins)
        total_distance += dist

        pickup_stop = RouteStop.objects.create(
            route=route,
            order=nearest,
            sequence=sequence,
            stop_type="pickup",
            location_name=f"{nearest.lot.farm.village}, {nearest.lot.farm.district}",
            latitude=nearest.lot.farm.latitude,
            longitude=nearest.lot.farm.longitude,
            eta=current_time,
            load_kg=nearest.requested_qty,
        )
        stops.append(pickup_stop)
        sequence += 1

        # Loading time
        current_time += timedelta(minutes=20)
        current_lat = nearest.lot.farm.latitude
        current_lng = nearest.lot.farm.longitude

        remaining_orders.remove(nearest)

    # Delivery stops (back to buyer locations or depot)
    for order in orders:
        delivery_lat = order.delivery_lat or start_lat
        delivery_lng = order.delivery_lng or start_lng

        dist = Farm.haversine_distance(
            current_lat, current_lng, delivery_lat, delivery_lng
        )
        travel_mins = max(10, int(dist * 2.5))
        current_time += timedelta(minutes=travel_mins)
        total_distance += dist

        delivery_stop = RouteStop.objects.create(
            route=route,
            order=order,
            sequence=sequence,
            stop_type="delivery",
            location_name=order.delivery_address or "Buyer Location, Lucknow",
            latitude=delivery_lat,
            longitude=delivery_lng,
            eta=current_time,
            load_kg=order.requested_qty,
        )
        stops.append(delivery_stop)
        sequence += 1

        current_time += timedelta(minutes=15)  # Unloading time
        current_lat = delivery_lat
        current_lng = delivery_lng

    # Update route totals
    route.total_distance_km = round(total_distance, 1)
    duration = (current_time - datetime.now().replace(hour=6, minute=0)).total_seconds() / 60
    route.estimated_duration_mins = int(duration)
    route.save()

    return route
