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
    <div className="editorial-card p-5 space-y-5 bg-white border border-[#E8E8E3] rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E8E3] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl text-[#17201D]">
              Order #{order.id}
            </span>
            <span className="rounded-md bg-[#DCE8DD] border border-[#173D32]/20 px-2.5 py-0.5 text-[10px] font-semibold text-[#173D32] uppercase">
              {order.status_display}
            </span>
          </div>
          <p className="text-xs text-[#5C584E] mt-0.5">
            {order.requested_qty} kg {order.lot_detail?.commodity} (Grade {order.lot_detail?.grade}) @ ₹{order.agreed_price}/kg
          </p>
        </div>

        <div className="sm:text-right">
          <p className="font-serif text-2xl text-[#173D32]">
            ₹{(order.requested_qty * order.agreed_price).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[#5C584E] uppercase font-semibold">Total Order Commitment</p>
        </div>
      </div>

      {/* 3-Column Detailed Fulfillment Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Origin Farm */}
        <div className="rounded-2xl bg-[#F7F5EF] p-4 border border-[#E8E8E3] space-y-1 text-xs">
          <span className="text-[10px] uppercase font-semibold text-[#5C584E] flex items-center gap-1">
            <Sprout className="h-3.5 w-3.5 text-[#173D32]" />
            <span>Origin Farm / Kisan</span>
          </span>
          <p className="font-semibold text-[#17201D] text-sm">
            {order.farmer_name || order.lot_detail?.created_by_name || "Vikas Yadav"}
          </p>
          <p className="text-[#5C584E] flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#173D32]" />
            <span>{order.farmer_village || order.lot_detail?.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
          </p>
          <p className="text-[#5C584E] flex items-center gap-1">
            <Phone className="h-3 w-3 text-[#173D32]" />
            <span>{order.farmer_phone || "+91-9876543211"}</span>
          </p>
        </div>

        {/* Assigned Logistics Fleet & Driver */}
        <div className="rounded-2xl bg-[#F7F5EF] p-4 border border-[#E8E8E3] space-y-1 text-xs">
          <span className="text-[10px] uppercase font-semibold text-[#5C584E] flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-[#173D32]" />
            <span>Logistics Dispatch</span>
          </span>
          <p className="font-semibold text-[#17201D] text-sm">
            {order.driver_name || "Suresh Chauhan"}
          </p>
          <p className="text-[#5C584E]">
            {order.vehicle_info || "Tata Ace (UP 32 TA 4092)"}
          </p>
          <p className="text-[#5C584E] flex items-center gap-1">
            <Phone className="h-3 w-3 text-[#173D32]" />
            <span>{order.driver_phone || "+91-9876543212"}</span>
          </p>
        </div>

        {/* Delivery OTP & Destination */}
        <div className="rounded-2xl bg-[#DCE8DD]/40 p-4 border border-[#173D32]/20 space-y-1 text-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#173D32] flex items-center gap-1">
              <KeyRound className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Buyer Delivery OTP</span>
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-[#173D32] tracking-wider">
                {order.delivery_otp || "8842"}
              </span>
              <span className="text-[10px] text-[#5C584E]">(Share with driver)</span>
            </div>
          </div>
          <p className="text-[11px] text-[#5C584E] truncate">
            Dest: {order.delivery_address || "Hazratganj Central Receiving Station, Lucknow"}
          </p>
        </div>
      </div>

      {/* Horizontal Process Stepper */}
      <div className="py-2">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-[#E8E8E3]" />
          <div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#173D32] transition-all duration-700 ease-out"
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
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                    isCurrent
                      ? "bg-[#173D32] text-white ring-4 ring-[#DCE8DD] animate-active-halo scale-105"
                      : isCompleted
                      ? "bg-[#173D32] text-white"
                      : "bg-white text-[#5C584E] border border-[#E8E8E3]"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4 animate-line-draw" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-[10px] font-semibold transition text-center max-w-[65px] leading-tight ${
                    isCurrent
                      ? "text-[#173D32] font-bold"
                      : isCompleted
                      ? "text-[#17201D]"
                      : "text-[#5C584E]"
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
      <div className="pt-3.5 border-t border-[#E8E8E3] space-y-2.5">
        <h5 className="text-[10px] font-semibold uppercase tracking-wider text-[#5C584E] flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#173D32]" />
          <span>Immutable Audit Event Trail</span>
        </h5>

        {loading ? (
          <div className="space-y-2">
            <div className="h-10 bg-[#F0EDE4] rounded-xl animate-pulse" />
          </div>
        ) : timeline && timeline.timeline.length > 0 ? (
          <div className="space-y-2">
            {timeline.timeline.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start justify-between rounded-2xl bg-[#F7F5EF] p-3 border border-[#E8E8E3] text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#173D32] text-white shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#17201D] capitalize">
                        {evt.event_display}
                      </span>
                      {evt.has_otp && (
                        <span className="flex items-center gap-1 rounded bg-[#DCE8DD] border border-[#173D32]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#173D32]">
                          <KeyRound className="h-2.5 w-2.5" /> OTP Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5C584E] mt-0.5 font-normal">
                      {evt.note || "Handoff recorded successfully"}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-[#5C584E]">
                  <p className="font-semibold text-[#17201D]">{evt.actor}</p>
                  <p>{formatDateTime(evt.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#5C584E]">No events recorded yet.</p>
        )}
      </div>
    </div>
  );
}
