"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Order, RoutePlan } from "@/lib/types";
import { translations, Language } from "@/lib/translations";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { DriverProofModal } from "@/components/DriverProofModal";
import { AuthModal } from "@/components/AuthModal";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Camera,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Clock,
  Package,
  Phone,
  User,
  ShoppingBag,
  Sprout,
  ArrowDown,
} from "lucide-react";

export default function DriverLogisticsPage() {
  const [lang, setLang] = useState<Language>("en");
  const { user } = useAuth();
  const t = translations[lang];

  const [orders, setOrders] = useState<Order[]>([]);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const ordersData = await api.getOrders();
      setOrders(ordersData || []);

      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.slice(0, 4).map((o) => o.id);
        try {
          const plan = await api.planRoute(orderIds);
          setRoutePlan(plan);
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load driver data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (user) {
      const interval = setInterval(loadData, 4000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkPickup = async (orderId: number) => {
    try {
      await api.transitionOrder(orderId, "picked_up", "Produce inspected & loaded onto vehicle");
      setActionSuccess(`Order #${orderId} marked as Picked Up from Farm Gate!`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      console.error("Failed to mark pickup", err);
      alert(err.message || "Failed to mark pickup");
    }
  };

  const handleOpenProof = (orderId: number) => {
    setSelectedOrderId(orderId);
    setProofModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col">
      <Navbar lang={lang} onLanguageChange={setLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E9E7E1] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7D8A65] uppercase tracking-wider mb-1">
              <Truck className="h-3.5 w-3.5 text-[#173D32]" />
              <span>
                Assigned Vehicle: Tata Ace Gold • Driver: {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Logistics Fleet Member"}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#17201D]">
              Pickup & Drop-Off Dispatch
            </h1>
            <p className="text-xs text-[#7D8A65] mt-1 font-light">
              Turn-by-turn farm gate pickups and buyer receiving dock drop-offs across Lucknow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#DCE8DD] px-3.5 py-1 text-xs font-bold text-[#173D32]">
              Lucknow Agri Logistics Fleet
            </span>
          </div>
        </div>

        {actionSuccess && (
          <div className="rounded-xl bg-[#DCE8DD] p-3.5 border border-[#173D32]/20 text-xs font-bold text-[#173D32] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Route Optimization Summary Card */}
        {routePlan && (
          <div className="forest-panel p-6 sm:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-[#C99B43] uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="h-4 w-4" />
                  <span>Optimized Route Sequence</span>
                </span>
                <h3 className="font-serif text-2xl font-normal text-white mt-1">
                  {routePlan.summary.stop_count} Planned Stops across Lucknow Cluster
                </h3>
                <p className="text-xs text-[#DCE8DD]/80 font-light mt-0.5">
                  Total distance: {routePlan.summary.total_distance_km} km • Estimated trip duration: ~{routePlan.summary.estimated_duration_mins} mins
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/15">
                  <span className="text-[#DCE8DD] text-[10px] uppercase font-semibold block">Vehicle Load</span>
                  <p className="font-bold text-white text-base mt-0.5">
                    {routePlan.summary.total_load_kg} / {routePlan.vehicle.max_capacity_kg} kg ({routePlan.summary.load_utilization}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dispatch Orders: Detailed Pickup -> Drop-Off Cards */}
        <div className="space-y-4">
          <h3 className="font-serif text-2xl font-bold text-[#17201D]">
            Fulfillment Manifest & Stops ({orders.length} Batches)
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-white border border-[#E9E7E1] animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-[#E9E7E1] bg-white p-12 text-center text-xs text-[#7D8A65]">
              <Truck className="h-8 w-8 text-[#173D32] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm text-[#17201D]">No active dispatch orders today</p>
              <p className="mt-1">When buyers confirm produce orders, pickup and drop-off instructions will be dispatched here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((ord, idx) => {
                const isPickedUp = ["picked_up", "delivered", "settlement_ready", "settled"].includes(ord.status);
                const isDelivered = ["delivered", "settlement_ready", "settled"].includes(ord.status);

                return (
                  <div
                    key={ord.id}
                    className="agri-card p-6 space-y-4 border border-[#E9E7E1]"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9E7E1] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#173D32] text-white font-serif font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-serif font-bold text-lg text-[#17201D] capitalize">
                          Order #{ord.id} • {ord.requested_qty} kg {ord.lot_detail?.commodity} (Grade {ord.lot_detail?.grade})
                        </span>
                      </div>

                      <span className="rounded-full bg-[#DCE8DD] px-3 py-1 text-xs font-bold text-[#173D32] uppercase w-fit">
                        Status: {ord.status_display}
                      </span>
                    </div>

                    {/* Step 1: PICKUP ORIGIN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Where to Pick Up */}
                      <div className="rounded-2xl bg-[#F7F5EF] p-4 border border-[#E9E7E1] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#173D32] flex items-center gap-1.5">
                            <Sprout className="h-3.5 w-3.5" />
                            <span>1. Farm Gate Pickup Location</span>
                          </span>
                          <span className="text-[10px] text-[#7D8A65]">Time: 7:00 – 10:00 AM</span>
                        </div>

                        <div className="text-xs space-y-1 text-[#17201D]">
                          <p className="font-bold text-sm">
                            {ord.farmer_name || ord.lot_detail?.created_by_name || "Ramesh Kumar (Kisan)"}
                          </p>
                          <p className="flex items-center gap-1 text-[#7D8A65]">
                            <MapPin className="h-3.5 w-3.5 text-[#C99B43]" />
                            <span>{ord.farmer_village || ord.lot_detail?.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                          </p>
                          <p className="flex items-center gap-1 text-[#7D8A65]">
                            <Phone className="h-3.5 w-3.5 text-[#173D32]" />
                            <span>{ord.farmer_phone || "+91-9876543211"}</span>
                          </p>
                        </div>

                        <div className="pt-2">
                          {!isPickedUp ? (
                            <button
                              onClick={() => handleMarkPickup(ord.id)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#C99B43] py-2 text-xs font-bold text-[#17201D] hover:bg-[#d8a94d] transition shadow-sm"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Confirm Produce Picked Up</span>
                            </button>
                          ) : (
                            <span className="flex items-center justify-center gap-1 text-xs font-bold text-[#173D32] bg-[#DCE8DD] py-1.5 rounded-full">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Picked Up & Loaded on Vehicle</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Where to Drop Off */}
                      <div className="rounded-2xl bg-[#F7F5EF] p-4 border border-[#E9E7E1] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#173D32] flex items-center gap-1.5">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>2. Buyer Drop-Off Destination</span>
                          </span>
                          <span className="text-[10px] text-[#7D8A65]">ETA: ~4:30 PM</span>
                        </div>

                        <div className="text-xs space-y-1 text-[#17201D]">
                          <p className="font-bold text-sm">
                            {ord.buyer_org || "Fresh Mart Procurement Hub"} ({ord.buyer_name || "Ankit Sharma"})
                          </p>
                          <p className="flex items-center gap-1 text-[#7D8A65]">
                            <MapPin className="h-3.5 w-3.5 text-[#C99B43]" />
                            <span>{ord.delivery_address || "Hazratganj Central Receiving Station, Lucknow"}</span>
                          </p>
                          <p className="flex items-center gap-1 text-[#7D8A65]">
                            <Phone className="h-3.5 w-3.5 text-[#173D32]" />
                            <span>{ord.buyer_phone || "+91-9876543210"}</span>
                          </p>
                        </div>

                        <div className="pt-2">
                          {isPickedUp && !isDelivered && (
                            <button
                              onClick={() => handleOpenProof(ord.id)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#173D32] py-2 text-xs font-bold text-white hover:bg-[#215445] transition shadow-md"
                            >
                              <Camera className="h-4 w-4 text-[#C99B43]" />
                              <span>Verify Buyer OTP & Submit POD</span>
                            </button>
                          )}

                          {isDelivered && (
                            <span className="flex items-center justify-center gap-1 text-xs font-bold text-[#173D32] bg-[#DCE8DD] py-1.5 rounded-full">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Delivery Complete & Settlement Ready</span>
                            </span>
                          )}

                          {!isPickedUp && (
                            <span className="flex items-center justify-center text-[11px] text-[#7D8A65] py-1.5">
                              Pending farm gate pickup first
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Driver Proof of Delivery Modal */}
      {selectedOrderId && (
        <DriverProofModal
          orderId={selectedOrderId}
          isOpen={proofModalOpen}
          onClose={() => setProofModalOpen(false)}
          onSuccess={() => {
            setActionSuccess("Delivery verified! Funds transitioned to Settlement Ready.");
            loadData();
          }}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
        defaultRole="driver"
      />
    </div>
  );
}
