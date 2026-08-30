"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Order, RoutePlan } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { LeafletMap } from "@/components/LeafletMap";
import { DriverProofModal } from "@/components/DriverProofModal";
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  Clock,
  Package,
  ShieldCheck,
  Building,
  Sprout,
  ShoppingBag,
  ExternalLink,
  Navigation2,
  Compass,
} from "lucide-react";

export default function DriverDispatchPage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Proof of Delivery Modal State
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const ordersData = await api.getOrders();
      setOrders(ordersData || []);

      if (ordersData && ordersData.length > 0) {
        const activeIds = ordersData
          .filter((o) => ["confirmed", "pickup_scheduled", "picked_up"].includes(o.status))
          .map((o) => o.id);
        if (activeIds.length > 0) {
          try {
            const plan = await api.planRoute(activeIds);
            setRoutePlan(plan);
          } catch {}
        }
      }
    } catch (err) {
      console.error("Driver data load error", err);
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

  const openGoogleMapsDirections = (
    originLat: number = 26.9124,
    originLng: number = 80.8947,
    destLat: number = 26.8467,
    destLng: number = 80.9462
  ) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const activeOrders = orders.filter((o) => o.status !== "settled" && o.status !== "cancelled");

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>
                Assigned Vehicle: Tata Ace Gold • Driver: {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Logistics Fleet Member"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              {t.driverTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
              {t.driverDesc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t.lucknowCluster}</span>
            </span>
          </div>
        </div>

        {actionSuccess && (
          <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-calm-reveal">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Route Summary & Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Turn-by-Turn Route Map
              </h3>
              <span className="text-xs text-slate-500">Farm Gates &rarr; Buyer Docks</span>
            </div>

            <div className="editorial-card p-1.5 bg-white overflow-hidden h-[400px]">
              <LeafletMap center={[26.88, 80.92]} height="100%" />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Fleet Run Summary
              </h3>
            </div>

            <div className="editorial-card p-5 space-y-3.5 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Navigation className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Optimized Milk Run</h4>
                  <p className="text-xs text-slate-500">24-Hour Farm-to-Dock Schedule</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Active Waypoints:</span>
                  <span className="font-bold text-slate-900">{activeOrders.length * 2} Stops</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Vehicle Capacity:</span>
                  <span className="font-bold text-slate-900">2,000 kg (Tata Ace Gold)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fulfillment Corridor:</span>
                  <span className="font-bold text-emerald-700">Bakshi Ka Talab &rarr; Hazratganj</span>
                </div>
              </div>

              <button
                onClick={() => openGoogleMapsDirections(26.9124, 80.8947, 26.8467, 80.9462)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
              >
                <Navigation2 className="h-4 w-4" />
                <span>Navigate Full Route in Google Maps</span>
              </button>
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Manifest List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Fulfillment Manifest ({activeOrders.length} Orders)
            </h3>
            <span className="text-xs text-slate-500">Execute in sequential order</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="editorial-card p-12 text-center space-y-2 bg-white">
              <Package className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-900">All Dispatches Completed!</p>
              <p className="text-xs text-slate-500">New buyer orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((ord, idx) => {
                const isPickedUp = ord.status === "picked_up" || ord.status === "delivered";
                const isDelivered = ord.status === "delivered" || ord.status === "settled";
                const originLat = ord.lot_detail?.farm_detail?.latitude || 26.9124;
                const originLng = ord.lot_detail?.farm_detail?.longitude || 80.8947;
                const destLat = ord.delivery_lat || 26.8467;
                const destLng = ord.delivery_lng || 80.9462;

                return (
                  <div
                    key={ord.id}
                    className="editorial-card p-5 space-y-4 bg-white"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-base text-slate-900 capitalize">
                          Order #{ord.id} • {ord.requested_qty} kg {ord.lot_detail?.commodity} (Grade {ord.lot_detail?.grade})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                          Status: {ord.status_display}
                        </span>
                        <button
                          onClick={() => openGoogleMapsDirections(originLat, originLng, destLat, destLng)}
                          className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <ExternalLink className="h-3 w-3 text-emerald-600" />
                          <span>Google Maps</span>
                        </button>
                      </div>
                    </div>

                    {/* Step 1: PICKUP ORIGIN & Step 2: DROP-OFF DESTINATION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Where to Pick Up */}
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                            <Sprout className="h-4 w-4 text-emerald-600" />
                            <span>1. Farm Gate Pickup Location</span>
                          </span>
                          <span className="text-[10px] text-slate-500">7:00 – 10:00 AM</span>
                        </div>

                        <div className="text-xs space-y-1 text-slate-800">
                          <p className="font-bold text-sm text-slate-900">
                            {ord.farmer_name || ord.lot_detail?.created_by_name || "Verified Farmer (Kisan)"}
                          </p>
                          <p className="flex items-center gap-1 text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{ord.farmer_village || ord.lot_detail?.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                          </p>
                          <p className="flex items-center gap-1 text-slate-500">
                            <Phone className="h-3.5 w-3.5 text-emerald-600" />
                            <a href={`tel:${ord.farmer_phone || "+919876543211"}`} className="font-bold text-emerald-700 hover:underline">
                              {ord.farmer_phone || "+91-9876543211"} (Tap to Call)
                            </a>
                          </p>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${originLat},${originLng}`, "_blank")}
                            className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Navigate to Farm</span>
                          </button>

                          {!isPickedUp ? (
                            <button
                              onClick={() => handleMarkPickup(ord.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Confirm Picked Up</span>
                            </button>
                          ) : (
                            <span className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 rounded-lg">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Loaded on Vehicle</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Where to Drop Off */}
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                            <ShoppingBag className="h-4 w-4 text-emerald-600" />
                            <span>2. Buyer Drop-Off Destination</span>
                          </span>
                          <span className="text-[10px] text-slate-500">ETA: ~4:30 PM</span>
                        </div>

                        <div className="text-xs space-y-1 text-slate-800">
                          <p className="font-bold text-sm text-slate-900">
                            {ord.buyer_org || "Commercial Procurement Kitchen"} ({ord.buyer_name || "Buyer"})
                          </p>
                          <p className="flex items-center gap-1 text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{ord.delivery_address || "Hazratganj Central Receiving Station, Lucknow"}</span>
                          </p>
                          <p className="flex items-center gap-1 text-slate-500">
                            <Phone className="h-3.5 w-3.5 text-emerald-600" />
                            <a href={`tel:${ord.buyer_phone || "+919876543210"}`} className="font-bold text-emerald-700 hover:underline">
                              {ord.buyer_phone || "+91-9876543210"} (Tap to Call)
                            </a>
                          </p>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`, "_blank")}
                            className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Navigate to Dock</span>
                          </button>

                          {!isDelivered ? (
                            <button
                              onClick={() => handleOpenProof(ord.id)}
                              disabled={!isPickedUp}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              <span>Verify Delivery OTP</span>
                            </button>
                          ) : (
                            <span className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 rounded-lg">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Delivered & Verified</span>
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

        {/* Proof of Delivery / OTP Verification Modal */}
        {selectedOrderId && (
          <DriverProofModal
            isOpen={proofModalOpen}
            onClose={() => {
              setProofModalOpen(false);
              setSelectedOrderId(null);
            }}
            orderId={selectedOrderId}
            onSuccess={() => {
              setActionSuccess(`Order #${selectedOrderId} successfully delivered & verified!`);
              setTimeout(() => setActionSuccess(null), 3500);
              loadData();
            }}
          />
        )}
      </main>
    </div>
  );
}
