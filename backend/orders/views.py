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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def order_create_payment(request, order_id):
    """
    POST /api/orders/<id>/create-payment/
    Creates a Razorpay Order for online escrow payment by the buyer.
    """
    try:
        order = Order.objects.select_related("lot", "lot__created_by", "buyer").get(pk=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check permission (buyer or ops can initiate payment)
    if order.buyer != request.user and not request.user.is_ops:
        return Response({"error": "Unauthorized to pay for this order"}, status=status.HTTP_403_FORBIDDEN)

    from .payments import create_razorpay_order
    try:
        payment_payload = create_razorpay_order(order)
        return Response(payment_payload, status=status.HTTP_200_OK)
    except Exception as exc:
        return Response({"error": f"Payment gateway initialization failed: {str(exc)}"}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def order_verify_payment(request, order_id):
    """
    POST /api/orders/<id>/verify-payment/
    Cryptographically verifies Razorpay signature, confirms order, and locks funds in Escrow.
    Body: { "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }
    """
    try:
        order = Order.objects.select_related("lot", "lot__created_by", "buyer").get(pk=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    razorpay_order_id = request.data.get("razorpay_order_id", "").strip()
    razorpay_payment_id = request.data.get("razorpay_payment_id", "").strip()
    razorpay_signature = request.data.get("razorpay_signature", "").strip()

    if not razorpay_payment_id or not razorpay_order_id:
        return Response({"error": "Missing Razorpay payment identifiers"}, status=status.HTTP_400_BAD_REQUEST)

    from .payments import verify_razorpay_signature
    is_valid = verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if not is_valid:
        return Response({"error": "Cryptographic signature verification failed"}, status=status.HTTP_400_BAD_REQUEST)

    # Advance state machine: reserved -> confirmed (escrow locked)
    if order.status == "reserved":
        try:
            order.transition_to(
                "confirmed",
                actor=request.user,
                note=f"Payment verified via Razorpay ({razorpay_payment_id}). Funds held in Escrow.",
            )
        except ValueError:
            pass

    # Record or update transparent Settlement breakdown
    from fulfillment.models import Settlement
    gross = round(order.requested_qty * order.agreed_price, 2)
    platform_fee = round(gross * 0.02, 2)     # 2.0% platform fee
    logistics_fee = round(gross * 0.05, 2)    # 5.0% logistics fee
    net_farmer = round(gross - platform_fee - logistics_fee, 2)  # 93.0% to farmer

    settlement, _ = Settlement.objects.get_or_create(
        order=order,
        defaults={
            "gross_amount": gross,
            "logistics_fee": logistics_fee,
            "platform_fee": platform_fee,
            "net_farmer_amount": net_farmer,
            "status": "ready",
            "payout_status": "escrow_held",
            "settlement_reference": f"RZP-ESCROW-{order.id:06d}",
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        }
    )

    settlement.razorpay_order_id = razorpay_order_id
    settlement.razorpay_payment_id = razorpay_payment_id
    settlement.razorpay_signature = razorpay_signature
    settlement.payout_status = "escrow_held"
    settlement.status = "ready"
    settlement.save()

    return Response({
        "success": True,
        "message": f"Payment {razorpay_payment_id} verified. ₹{gross} held in Escrow.",
        "order": OrderSerializer(order).data,
        "settlement": {
            "gross_amount": gross,
            "platform_fee": platform_fee,
            "logistics_fee": logistics_fee,
            "net_farmer_amount": net_farmer,
            "razorpay_payment_id": razorpay_payment_id,
            "payout_status": settlement.payout_status,
        }
    }, status=status.HTTP_200_OK)
