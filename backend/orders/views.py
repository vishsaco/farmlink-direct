"""Order views: create, list, status transitions."""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Order
from .serializers import (
    OrderSerializer,
    CreateOrderSerializer,
    StatusTransitionSerializer,
)
from lots.models import Lot


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def order_list_create(request):
    """
    GET  /api/orders/ — List orders filtered by role.
    POST /api/orders/ — Create order with atomic reservation.
    """
    if request.method == "GET":
        user = request.user
        if user.is_buyer:
            orders = Order.objects.filter(buyer=user)
        elif user.is_farmer:
            orders = Order.objects.filter(lot__created_by=user)
        elif user.is_fpo and user.organization:
            orders = Order.objects.filter(
                lot__created_by__organization=user.organization
            )
        else:
            orders = Order.objects.all()

        orders = orders.select_related(
            "lot", "lot__farm", "buyer", "lot__created_by"
        )
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    # POST — create order
    ser = CreateOrderSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data

    try:
        lot = Lot.objects.get(pk=data["lot_id"])
    except Lot.DoesNotExist:
        return Response(
            {"error": "Lot not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        order = Order.create_order(
            buyer=request.user,
            lot=lot,
            requested_qty=data["requested_qty"],
            agreed_price=data["agreed_price"],
            delivery_address=data.get("delivery_address", ""),
            delivery_lat=data.get("delivery_lat"),
            delivery_lng=data.get("delivery_lng"),
            delivery_window_start=data.get("delivery_window_start"),
            delivery_window_end=data.get("delivery_window_end"),
            notes=data.get("notes", ""),
        )
    except ValueError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_409_CONFLICT,
        )

    return Response(
        OrderSerializer(order).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    """GET /api/orders/<id>/ — Order detail with lot and buyer info."""
    try:
        order = Order.objects.select_related(
            "lot", "lot__farm", "buyer", "lot__created_by"
        ).get(pk=order_id)
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(OrderSerializer(order).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def order_transition(request, order_id):
    """
    POST /api/orders/<id>/status/
    Body: { "new_status": "confirmed", "note": "..." }
    Advances the order state machine.
    """
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    ser = StatusTransitionSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    try:
        order.transition_to(
            new_status=ser.validated_data["new_status"],
            actor=request.user,
            note=ser.validated_data.get("note", ""),
        )
    except ValueError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(OrderSerializer(order).data)
