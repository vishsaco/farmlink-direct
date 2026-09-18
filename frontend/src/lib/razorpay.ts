/**
 * FarmLink Direct - Razorpay Payment SDK Client Integration
 * Secure Escrow payments from Buyer to Farmer with fee splitting
 */

export const RAZORPAY_TEST_KEY_ID = "rzp_test_TdaeQZjpBM06vR";

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key?: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string; // Razorpay Order ID returned by backend
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
  handler?: (response: RazorpaySuccessResponse) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      close: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

/**
 * Dynamically loads the official Razorpay Checkout v1 script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay payment checkout modal
 */
export async function openRazorpayCheckout({
  razorpayOrderId,
  amountPaise,
  buyerName,
  buyerEmail,
  buyerPhone,
  description,
  notes,
  onSuccess,
  onDismiss,
}: {
  razorpayOrderId: string;
  amountPaise: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  description?: string;
  notes?: Record<string, string>;
  onSuccess: (res: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
}): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    throw new Error("Unable to connect to Razorpay payment gateway. Please check internet connection.");
  }

  const options: RazorpayOptions = {
    key: RAZORPAY_TEST_KEY_ID,
    amount: amountPaise,
    currency: "INR",
    name: "FarmLink Direct",
    description: description || "Direct Farmer Escrow Payment",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80",
    order_id: razorpayOrderId,
    prefill: {
      name: buyerName || "FarmLink Buyer",
      email: buyerEmail || "buyer@farmlink.org",
      contact: buyerPhone || "+919876543210",
    },
    notes: {
      platform: "FarmLink Direct Escrow",
      ...(notes || {}),
    },
    theme: {
      color: "#262238",
      backdrop_color: "rgba(38, 34, 56, 0.6)",
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
      confirm_close: true,
    },
    handler: (response: RazorpaySuccessResponse) => {
      onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
