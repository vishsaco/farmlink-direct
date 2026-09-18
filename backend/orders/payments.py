"""
Razorpay payment helper module for FarmLink Direct.
Handles order creation in paise, cryptographic HMAC-SHA256 signature verification,
and escrow allocation for direct farmer payouts.
"""

import hmac
import hashlib
import logging
from django.conf import settings
import razorpay

logger = logging.getLogger(__name__)


def get_razorpay_client():
    """Instantiate and return a configured Razorpay client."""
    key_id = getattr(settings, "RAZORPAY_KEY_ID", "rzp_test_TdaeQZjpBM06vR")
    key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "bqMhLl1SbomvbDnq9QdO8ebC")
    return razorpay.Client(auth=(key_id, key_secret))


def create_razorpay_order(order):
    """
    Creates a Razorpay Order corresponding to a FarmLink order commitment.
    Amount is converted to paise (INR × 100).
    """
    client = get_razorpay_client()
    key_id = getattr(settings, "RAZORPAY_KEY_ID", "rzp_test_TdaeQZjpBM06vR")
    
    # Calculate amount in paise
    gross_amount_inr = round(order.requested_qty * order.agreed_price, 2)
    amount_in_paise = int(round(gross_amount_inr * 100))

    farmer = order.lot.created_by
    farmer_name = f"{farmer.first_name} {farmer.last_name or ''}".strip() or farmer.username

    payload = {
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": f"order_rcptid_{order.id}",
        "notes": {
            "farmlink_order_id": str(order.id),
            "lot_id": str(order.lot.id),
            "commodity": order.lot.commodity,
            "quantity_kg": str(order.requested_qty),
            "agreed_price": str(order.agreed_price),
            "buyer_username": order.buyer.username,
            "farmer_username": farmer.username,
            "farmer_name": farmer_name,
            "platform_fee_percent": "2.0",
            "logistics_fee_percent": "5.0",
            "net_farmer_percent": "93.0",
        },
    }

    try:
        rzp_order = client.order.create(data=payload)
        logger.info(f"Razorpay order created: {rzp_order.get('id')} for Order #{order.id}")
        return {
            "razorpay_order_id": rzp_order.get("id"),
            "amount": amount_in_paise,
            "currency": "INR",
            "key_id": key_id,
            "gross_inr": gross_amount_inr,
            "farmer_name": farmer_name,
        }
    except Exception as exc:
        logger.error(f"Razorpay order creation failed for Order #{order.id}: {exc}")
        raise exc


def verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    """
    Cryptographically verifies the payment signature using HMAC SHA256.
    """
    key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "bqMhLl1SbomvbDnq9QdO8ebC")
    
    # Verify via Razorpay utility first
    client = get_razorpay_client()
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        })
        return True
    except razorpay.errors.SignatureVerificationError:
        # Explicit HMAC-SHA256 fallback check
        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
        expected_sig = hmac.new(key_secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected_sig, razorpay_signature)
    except Exception as exc:
        logger.warning(f"Signature check fallback: {exc}")
        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
        expected_sig = hmac.new(key_secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected_sig, razorpay_signature)
