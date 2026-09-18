"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Order, OrderStatus, Timeline } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import {
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  FileCheck,
  Clock,
  ArrowRight,
  Truck,
  Sprout,
  ShoppingBag,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";

interface OrderTimelineCardProps {
  order: Order;
  onRefresh?: () => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: "reserved", label: "Reserved", description: "Inventory atomically locked" },
  { status: "confirmed", label: "Confirmed", description: "Buyer committed & escrow held" },
  { status: "pickup_scheduled", label: "Pickup Scheduled", description: "Route & vehicle assigned" },
  { status: "picked_up", label: "Picked Up", description: "Produce loaded at farm gate" },
  { status: "delivered", label: "Delivered", description: "Proof of delivery verified" },
  { status: "settlement_ready", label: "Settlement Ready", description: "Payout ledger calculated" },
  { status: "settled", label: "Settled", description: "Disbursal complete" },
];

export function OrderTimelineCard({ order, onRefresh }: OrderTimelineCardProps) {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .getTimeline(order.id)
      .then((data) => {
        if (isMounted) {
          setTimeline(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Timeline error", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [order.id, order.status]);

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="editorial-card p-6 space-y-6 bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E2DD] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-2xl font-normal text-[#262238]">
              Order #{order.id}
            </span>
            <span className="rounded-full bg-[#E8E4F2] border border-[#262238]/10 px-3 py-0.5 text-[11px] font-medium text-[#262238] uppercase tracking-wider">
              {order.status_display}
            </span>
          </div>
          <p className="text-xs text-[#737184] mt-1">
            {order.requested_qty} kg {order.lot_detail?.commodity} (Grade {order.lot_detail?.grade}) @ ₹{order.agreed_price}/kg
          </p>
        </div>

        <div className="sm:text-right">
          <p className="font-serif text-2xl font-normal text-[#262238]">
            ₹{(order.requested_qty * order.agreed_price).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[#737184] uppercase tracking-wider font-medium">Total Order Commitment</p>
        </div>
      </div>

      {/* 3-Column Detailed Fulfillment Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Origin Farm */}
        <div className="rounded-[20px] bg-[#F6F5F1] p-4 border border-[#E4E2DD] space-y-1.5 text-xs">
          <span className="text-[10px] uppercase font-semibold text-[#737184] tracking-wider flex items-center gap-1.5">
            <Sprout className="h-3.5 w-3.5 text-[#718A68]" />
            <span>Origin Farm / Kisan</span>
          </span>
          <p className="font-medium text-[#262238] text-sm">
            {order.farmer_name || order.lot_detail?.created_by_name || "Vikas Yadav"}
          </p>
          <p className="text-[#737184] flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-[#718A68]" />
            <span>{order.farmer_village || order.lot_detail?.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
          </p>
          <p className="text-[#737184] flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-[#718A68]" />
            <span>{order.farmer_phone || "+91-9876543211"}</span>
          </p>
        </div>

        {/* Assigned Logistics Fleet & Driver */}
        <div className="rounded-[20px] bg-[#F6F5F1] p-4 border border-[#E4E2DD] space-y-1.5 text-xs">
          <span className="text-[10px] uppercase font-semibold text-[#737184] tracking-wider flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[#262238]" />
            <span>Logistics Dispatch</span>
          </span>
          <p className="font-medium text-[#262238] text-sm">
            {order.driver_name || "Suresh Chauhan"}
          </p>
          <p className="text-[#737184]">
            {order.vehicle_info || "Tata Ace (UP 32 TA 4092)"}
          </p>
          <p className="text-[#737184] flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-[#718A68]" />
            <span>{order.driver_phone || "+91-9876543212"}</span>
          </p>
        </div>

        {/* Delivery OTP & Destination */}
        <div className="rounded-[20px] bg-[#E8E4F2]/50 p-4 border border-[#262238]/10 space-y-1.5 text-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#262238] tracking-wider flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-[#718A68]" />
              <span>Buyer Delivery OTP</span>
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold text-[#262238] tracking-wider">
                {order.delivery_otp || "8842"}
              </span>
              <span className="text-[10px] text-[#737184]">(Share with driver)</span>
            </div>
          </div>
          <p className="text-[11px] text-[#737184] truncate">
            Dest: {order.delivery_address || "Hazratganj Central Receiving Station, Lucknow"}
          </p>
        </div>
      </div>

      {/* Horizontal Process Stepper */}
      <div className="py-3">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-[#E4E2DD]" />
          <div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#262238] transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(
                0,
                (currentStepIndex / (ORDER_STEPS.length - 1)) * 100
              )}%`,
            }}
          />

          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={step.status} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                    isCurrent
                      ? "bg-[#262238] text-white ring-4 ring-[#E8E4F2] scale-105"
                      : isCompleted
                      ? "bg-[#262238] text-white"
                      : "bg-white text-[#737184] border border-[#E4E2DD]"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-[10px] transition text-center max-w-[65px] leading-tight ${
                    isCurrent
                      ? "text-[#262238] font-bold"
                      : isCompleted
                      ? "text-[#262238] font-medium"
                      : "text-[#737184]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log */}
      <div className="pt-4 border-t border-[#E4E2DD] space-y-3">
        <h5 className="text-[11px] font-medium uppercase tracking-wider text-[#737184] flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#718A68]" />
          <span>Immutable Audit Event Trail</span>
        </h5>

        {loading ? (
          <div className="space-y-2">
            <div className="h-12 bg-[#F6F5F1] rounded-[16px] animate-pulse" />
          </div>
        ) : timeline && timeline.timeline.length > 0 ? (
          <div className="space-y-2">
            {timeline.timeline.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start justify-between rounded-[18px] bg-[#F6F5F1] p-3.5 border border-[#E4E2DD] text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#262238] text-white shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#262238] capitalize">
                        {evt.event_display}
                      </span>
                      {evt.has_otp && (
                        <span className="flex items-center gap-1 rounded-full bg-[#E8E4F2] border border-[#262238]/10 px-2 py-0.5 text-[10px] font-medium text-[#262238]">
                          <KeyRound className="h-2.5 w-2.5 text-[#718A68]" /> OTP Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#737184] mt-0.5 font-normal">
                      {evt.note || "Handoff recorded successfully"}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-[#737184]">
                  <p className="font-medium text-[#262238]">{evt.actor}</p>
                  <p>{formatDateTime(evt.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#737184]">No events recorded yet.</p>
        )}
      </div>
    </div>
  );
}
