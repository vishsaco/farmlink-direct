"""Fulfillment views: delivery proof, settlement, and audit timeline."""

import random
import string
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import FulfillmentEvent, Settlement
from orders.models import Order


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delivery_proof(request, order_id):
    """
    POST /api/fulfillment/orders/<id>/proof/
    Capture delivery evidence (OTP/photo/GPS) and advance to delivered.
    Body: { "otp": "1234", "media_url": "...", "latitude": ..., "longitude": ..., "note": "..." }
    """
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    if order.status not in ("picked_up", "pickup_scheduled"):
        return Response(
            {"error": f"Cannot capture proof in status '{order.status}'"},
            status=400,
        )

    # Record proof event
    event = FulfillmentEvent.objects.create(
        order=order,
        actor=request.user,
        event_type="delivered",
        latitude=request.data.get("latitude"),
        longitude=request.data.get("longitude"),
        media_url=request.data.get("media_url", ""),
        otp_code=request.data.get("otp", ""),
        note=request.data.get("note", "Delivery confirmed with proof"),
    )

    # Advance state machine
    if order.status == "pickup_scheduled":
        order.transition_to("picked_up", actor=request.user, note="Auto-advanced")
    order.transition_to("delivered", actor=request.user, note="Delivery proof captured")

    # Auto-create settlement and advance to settlement_ready
    settlement = Settlement.create_for_order(order)
    order.transition_to("settlement_ready", actor=request.user, note="Settlement calculated")

    return Response({
        "message": "Delivery confirmed",
        "order_status": order.status,
        "settlement": {
            "gross_amount": settlement.gross_amount,
            "logistics_fee": settlement.logistics_fee,
            "platform_fee": settlement.platform_fee,
            "net_farmer_amount": settlement.net_farmer_amount,
            "status": settlement.status,
            "reference": settlement.settlement_reference,
        },
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_timeline(request, order_id):
    """
    GET /api/fulfillment/orders/<id>/timeline/
    Returns the complete audit trail for an order.
    """
    events = FulfillmentEvent.objects.filter(
        order_id=order_id
    ).select_related("actor")

    timeline = [
        {
            "id": e.id,
            "event_type": e.event_type,
            "event_display": e.get_event_type_display(),
            "actor": e.actor.get_full_name() if e.actor else "System",
            "timestamp": e.timestamp.isoformat(),
            "latitude": e.latitude,
            "longitude": e.longitude,
            "media_url": e.media_url,
            "has_otp": bool(e.otp_code),
            "note": e.note,
        }
        for e in events
    ]

    return Response({
        "order_id": order_id,
        "event_count": len(timeline),
        "timeline": timeline,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def settlement_detail(request, order_id):
    """
    GET /api/fulfillment/settlements/<order_id>/
    Returns the transparent settlement statement.
    """
    try:
        settlement = Settlement.objects.get(order_id=order_id)
    except Settlement.DoesNotExist:
        return Response({"error": "Settlement not found"}, status=404)

    return Response({
        "order_id": order_id,
        "gross_amount": settlement.gross_amount,
        "logistics_fee": settlement.logistics_fee,
        "logistics_fee_percent": 5.0,
        "platform_fee": settlement.platform_fee,
        "platform_fee_percent": 2.0,
        "net_farmer_amount": settlement.net_farmer_amount,
        "status": settlement.status,
        "status_display": settlement.get_status_display(),
        "reference": settlement.settlement_reference,
        "note": "Simulated settlement — no live money movement in MVP",
        "created_at": settlement.created_at.isoformat(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def exceptions_list(request):
    """
    GET /api/fulfillment/exceptions/
    Returns orders with exception status for ops dashboard.
    """
    exception_orders = Order.objects.filter(
        status="exception"
    ).select_related("lot", "lot__farm", "buyer")

    # Also include seeded exception events
    exception_events = FulfillmentEvent.objects.filter(
        event_type="exception"
    ).select_related("order", "actor")

    results = []
    for event in exception_events:
        results.append({
            "event_id": event.id,
            "order_id": event.order_id,
            "event_type": event.event_type,
            "note": event.note,
            "actor": event.actor.get_full_name() if event.actor else "System",
            "timestamp": event.timestamp.isoformat(),
            "order_status": event.order.status,
        })

    return Response({
        "count": len(results),
        "exceptions": results,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_otp(request, order_id):
    """
    POST /api/fulfillment/orders/<id>/otp/
    Generate a delivery OTP for an order.
    """
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    otp = "".join(random.choices(string.digits, k=4))

    return Response({
        "order_id": order_id,
        "otp": otp,
        "message": "Share this OTP with the delivery driver for verification",
    })
