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
  CloudRain,
  AlertTriangle,
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
    <div className="min-h-screen bg-[#F6F5F1] text-[#262238] flex flex-col selection:bg-[#E8E4F2] selection:text-[#262238]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4E2DD] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#262238]/10 bg-[#E8E4F2] px-3.5 py-1 text-xs font-medium text-[#262238] uppercase tracking-wider mb-2">
              <Truck className="h-3.5 w-3.5 text-[#718A68]" />
              <span>
                Assigned Vehicle: Tata Ace Gold • Driver: {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Logistics Fleet Member"}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#262238] font-normal tracking-tight">
              {t.driverTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#737184] font-normal mt-1 max-w-2xl">
              {t.driverDesc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white border border-[#E4E2DD] px-4 py-2 text-xs font-mono font-medium text-[#262238] flex items-center gap-2 shadow-xs">
              <Compass className="h-3.5 w-3.5 text-[#718A68]" />
              <span>{t.lucknowCluster}</span>
            </span>
          </div>
        </div>

        {actionSuccess && (
          <div className="rounded-[20px] bg-[#E8E4F2] p-4 border border-[#262238]/10 text-xs font-medium text-[#262238] flex items-center gap-2 animate-calm-reveal">
            <CheckCircle2 className="h-4 w-4 text-[#718A68]" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Route Summary & Weather-Aware Route Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-normal text-[#262238]">
                Turn-by-Turn Route Map
              </h3>
              <span className="text-xs text-[#737184] font-mono">Farm Gates &rarr; Buyer Docks</span>
            </div>

            <div className="p-1.5 bg-white overflow-hidden h-[400px] rounded-[28px] border border-[#E4E2DD] shadow-xs">
              <LeafletMap center={[26.88, 80.92]} height="100%" />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-normal text-[#262238]">
                Fleet Run Summary
              </h3>
            </div>

            <div className="p-6 space-y-4 bg-white rounded-[28px] border border-[#E4E2DD] shadow-xs">
              {/* Weather-Aware Route Guidance Card */}
              <div className="rounded-[20px] bg-[#E8E4F2]/50 p-4 border border-[#262238]/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-medium text-[#262238]">
                  <span className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-[#718A68]" />
                    <span>Route 07 — Malihabad to Hazratganj</span>
                  </span>
                  <span className="font-mono text-[10px] bg-white px-2.5 py-0.5 rounded-full text-[#262238]">
                    ETA: 1 hr 20 min
                  </span>
                </div>
                <p className="text-[11px] text-[#737184]">
                  Rain expected near city entry after 2:30 PM. <strong>Recommended dispatch: 11:40 AM</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-[14px] bg-[#E8E4F2] flex items-center justify-center text-[#262238]">
                  <Navigation className="h-4.5 w-4.5 text-[#718A68]" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-normal text-[#262238]">Optimized Milk Run</h4>
                  <p className="text-xs text-[#737184] font-normal">24-Hour Farm-to-Dock Schedule</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#E4E2DD] pb-2">
                  <span className="text-[#737184]">Active Waypoints:</span>
                  <span className="font-medium text-[#262238]">{activeOrders.length * 2} Stops</span>
                </div>
                <div className="flex justify-between border-b border-[#E4E2DD] pb-2">
                  <span className="text-[#737184]">Vehicle Capacity:</span>
                  <span className="font-medium text-[#262238]">2,000 kg (Tata Ace Gold)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737184]">Fulfillment Corridor:</span>
                  <span className="font-medium text-[#718A68]">Bakshi Ka Talab &rarr; Hazratganj</span>
                </div>
              </div>

              <button
                onClick={() => openGoogleMapsDirections(26.9124, 80.8947, 26.8467, 80.9462)}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#262238] py-3 text-xs font-medium text-white hover:bg-[#342e4c] transition shadow-xs cursor-pointer active:scale-98"
              >
                <Navigation2 className="h-4 w-4 text-[#718A68]" />
                <span>Navigate Full Route in Google Maps</span>
              </button>
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Manifest List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-normal text-[#262238]">
              Fulfillment Manifest ({activeOrders.length} Orders)
            </h3>
            <span className="text-xs text-[#737184] font-mono">Execute in sequential order</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white rounded-[28px] border border-[#E4E2DD] shadow-xs">
              <Package className="h-10 w-10 text-[#737184]/40 mx-auto" />
              <p className="font-serif text-lg text-[#262238] font-normal">All Dispatches Completed!</p>
              <p className="text-xs text-[#737184]">New buyer orders will appear here automatically.</p>
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
                    className="p-6 space-y-5 bg-white rounded-[28px] border border-[#E4E2DD] shadow-xs hover:shadow-md transition"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E2DD] pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#262238] text-white font-medium text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-serif text-lg text-[#262238] font-normal capitalize">
                          Order #{ord.id} • {ord.requested_qty} kg {ord.lot_detail?.commodity} (Grade {ord.lot_detail?.grade})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#E8E4F2] px-3 py-1 text-[10px] font-medium text-[#262238] uppercase tracking-wider">
                          Status: {ord.status_display}
                        </span>
                        <button
                          onClick={() => openGoogleMapsDirections(originLat, originLng, destLat, destLng)}
                          className="flex items-center gap-1.5 rounded-full border border-[#E4E2DD] bg-[#F6F5F1] px-3 py-1 text-xs font-medium text-[#262238] hover:bg-[#E8E4F2] transition cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3 text-[#718A68]" />
                          <span>Google Maps</span>
                        </button>
                      </div>
                    </div>

                    {/* Step 1: PICKUP ORIGIN & Step 2: DROP-OFF DESTINATION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Where to Pick Up */}
                      <div className="rounded-[20px] bg-[#F6F5F1] p-5 border border-[#E4E2DD] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#262238] flex items-center gap-1.5">
                            <Sprout className="h-4 w-4 text-[#718A68]" />
                            <span>1. Farm Gate Pickup Location</span>
                          </span>
                          <span className="text-[10px] text-[#737184] font-mono">7:00 – 10:00 AM</span>
                        </div>

                        <div className="text-xs space-y-1.5 text-[#262238]">
                          <p className="font-medium text-sm text-[#262238]">
                            {ord.farmer_name || ord.lot_detail?.created_by_name || "Verified Farmer (Kisan)"}
                          </p>
                          <p className="flex items-center gap-1.5 text-[#737184]">
                            <MapPin className="h-3.5 w-3.5 text-[#718A68]" />
                            <span>{ord.farmer_village || ord.lot_detail?.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[#737184]">
                            <Phone className="h-3.5 w-3.5 text-[#718A68]" />
                            <a href={`tel:${ord.farmer_phone || "+919876543211"}`} className="font-medium text-[#262238] hover:underline">
                              {ord.farmer_phone || "+91-9876543211"} (Tap to Call)
                            </a>
                          </p>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${originLat},${originLng}`, "_blank")}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[#E4E2DD] bg-white py-2 text-xs font-medium text-[#262238] hover:bg-[#F6F5F1] cursor-pointer"
                          >
                            <MapPin className="h-3.5 w-3.5 text-[#718A68]" />
                            <span>Navigate to Farm</span>
                          </button>

                          {!isPickedUp ? (
                            <button
                              onClick={() => handleMarkPickup(ord.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[#262238] py-2 text-xs font-medium text-white hover:bg-[#342e4c] transition shadow-xs cursor-pointer active:scale-98"
                            >
                              <CheckCircle2 className="h-4 w-4 text-[#718A68]" />
                              <span>Confirm Picked Up</span>
                            </button>
                          ) : (
                            <span className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[#262238] bg-[#E8E4F2] border border-[#262238]/10 py-2 rounded-full">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#718A68]" />
                              <span>Loaded on Vehicle</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Where to Drop Off */}
                      <div className="rounded-[20px] bg-[#F6F5F1] p-5 border border-[#E4E2DD] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#262238] flex items-center gap-1.5">
                            <ShoppingBag className="h-4 w-4 text-[#718A68]" />
                            <span>2. Buyer Drop-Off Destination</span>
                          </span>
                          <span className="text-[10px] text-[#737184] font-mono">ETA: ~4:30 PM</span>
                        </div>

                        <div className="text-xs space-y-1.5 text-[#262238]">
                          <p className="font-medium text-sm text-[#262238]">
                            {ord.buyer_org || "Commercial Procurement Kitchen"} ({ord.buyer_name || "Buyer"})
                          </p>
                          <p className="flex items-center gap-1.5 text-[#737184]">
                            <MapPin className="h-3.5 w-3.5 text-[#718A68]" />
                            <span>{ord.delivery_address || "Hazratganj Central Receiving Station, Lucknow"}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[#737184]">
                            <Phone className="h-3.5 w-3.5 text-[#718A68]" />
                            <a href={`tel:${ord.buyer_phone || "+919876543210"}`} className="font-medium text-[#262238] hover:underline">
                              {ord.buyer_phone || "+91-9876543210"} (Tap to Call)
                            </a>
                          </p>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`, "_blank")}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[#E4E2DD] bg-white py-2 text-xs font-medium text-[#262238] hover:bg-[#F6F5F1] cursor-pointer"
                          >
                            <MapPin className="h-3.5 w-3.5 text-[#718A68]" />
                            <span>Navigate to Dock</span>
                          </button>

                          {!isDelivered ? (
                            <button
                              onClick={() => handleOpenProof(ord.id)}
                              disabled={!isPickedUp}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[#718A68] py-2 text-xs font-medium text-white hover:bg-[#62795a] transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              <span>Verify Delivery OTP</span>
                            </button>
                          ) : (
                            <span className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[#262238] bg-[#E8E4F2] border border-[#262238]/10 py-2 rounded-full">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#718A68]" />
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
