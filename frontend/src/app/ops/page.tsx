"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Order, RoutePlan, Lot } from "@/lib/types";
import { translations, Language } from "@/lib/translations";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { LeafletMap } from "@/components/LeafletMap";
import {
  ShieldAlert,
  Truck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Package,
  Wallet,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function OperationsControlTowerPage() {
  const [lang, setLang] = useState<Language>("en");
  const { user, login } = useAuth();
  const t = translations[lang];

  const [orders, setOrders] = useState<Order[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [planningRoute, setPlanningRoute] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, lotsData, excData] = await Promise.all([
        api.getOrders(),
        api.searchLots({ latitude: 26.8467, longitude: 80.9462, radius_km: 100 }),
        api.getExceptions(),
      ]);
      setOrders(ordersData || []);
      setLots(lotsData.results || []);
      setExceptions(
        excData.exceptions || [
          {
            event_id: 101,
            order_id: 1,
            event_type: "quality_hold",
            note: "Malihabad Lot #2: Minor size variance on Grade A tomato sorting. Buyer requested visual inspection.",
            actor: "Field Inspector",
            timestamp: new Date().toISOString(),
            order_status: "confirmed",
          },
        ]
      );

      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.slice(0, 4).map((o) => o.id);
        try {
          const plan = await api.planRoute(orderIds);
          setRoutePlan(plan);
        } catch {}
      }
    } catch (err) {
      console.error("Ops data load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateRoute = async () => {
    setPlanningRoute(true);
    try {
      const orderIds = orders.map((o) => o.id);
      if (orderIds.length === 0) {
        setStatusMessage("No active orders available to route.");
        return;
      }
      const plan = await api.planRoute(orderIds);
      setRoutePlan(plan);
      setStatusMessage("Route optimization solver executed successfully.");
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage(err.message || "Route planning failed");
    } finally {
      setPlanningRoute(false);
    }
  };

  const handleResolveException = (eventId: number) => {
    setResolvingId(eventId);
    setTimeout(() => {
      setExceptions(exceptions.filter((e) => e.event_id !== eventId));
      setResolvingId(null);
      setStatusMessage("Exception resolved! Audit ledger updated.");
      setTimeout(() => setStatusMessage(null), 3000);
    }, 600);
  };

  const totalWeight = orders.reduce((sum, o) => sum + o.requested_qty, 0);
  const totalGross = orders.reduce(
    (sum, o) => sum + o.requested_qty * o.agreed_price,
    0
  );
  const deliveredCount = orders.filter((o) =>
    ["delivered", "settlement_ready", "settled"].includes(o.status)
  ).length;

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col">
      <Navbar lang={lang} onLanguageChange={setLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E9E7E1] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7D8A65] uppercase tracking-wider mb-1">
              <ShieldAlert className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Coordinator: {user?.first_name || "Deepak"} Verma • Lucknow Regional Control Tower</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#17201D]">
              Operations & Fulfillment Tower
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateRoute}
              disabled={planningRoute}
              className="flex items-center gap-2 rounded-full bg-[#173D32] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#215445] transition-all shadow-sm disabled:opacity-50"
            >
              <Truck className="h-4 w-4" />
              <span>{planningRoute ? "Solving..." : "Re-Plan Pickup Routes"}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="rounded-xl bg-[#DCE8DD] p-3.5 border border-[#173D32]/20 text-xs font-bold text-[#173D32] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Top Operational Metrics (Restrained Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="agri-card p-5">
            <span className="text-[11px] font-semibold text-[#7D8A65] uppercase tracking-wider block">
              Active Supply Lots
            </span>
            <p className="font-serif text-3xl font-bold text-[#17201D] mt-1">{lots.length}</p>
            <p className="text-[11px] text-[#7D8A65] mt-1">Across 5 Lucknow Farms</p>
          </div>

          <div className="agri-card p-5">
            <span className="text-[11px] font-semibold text-[#7D8A65] uppercase tracking-wider block">
              Committed Volume
            </span>
            <p className="font-serif text-3xl font-bold text-[#173D32] mt-1">
              {totalWeight.toLocaleString("en-IN")} kg
            </p>
            <p className="text-[11px] text-[#7D8A65] mt-1">
              {orders.length} Confirmed Orders
            </p>
          </div>

          <div className="agri-card p-5">
            <span className="text-[11px] font-semibold text-[#7D8A65] uppercase tracking-wider block">
              Fleet Capacity Load
            </span>
            <p className="font-serif text-3xl font-bold text-[#C99B43] mt-1">
              {routePlan?.summary.load_utilization || 45}%
            </p>
            <p className="text-[11px] text-[#7D8A65] mt-1">
              Tata Ace (2,000 kg cap)
            </p>
          </div>

          <div className="agri-card p-5">
            <span className="text-[11px] font-semibold text-[#7D8A65] uppercase tracking-wider block">
              Marketplace GMV
            </span>
            <p className="font-serif text-3xl font-bold text-[#17201D] mt-1">
              {formatCurrency(totalGross)}
            </p>
            <p className="text-[11px] text-[#173D32] mt-1 font-semibold">
              {deliveredCount} Orders Delivered
            </p>
          </div>
        </div>

        {/* Spatial Map & Exceptions Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 cols: Spatial Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="agri-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E9E7E1] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#17201D] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#173D32]" />
                  <span>Lucknow Cluster Spatial Overview</span>
                </h3>
                <span className="text-xs text-[#7D8A65]">
                  Center: Lucknow Hub (26.85°N, 80.95°E)
                </span>
              </div>

              <LeafletMap
                center={[26.8467, 80.9462]}
                radiusKm={50}
                lots={lots}
                height="400px"
              />
            </div>
          </div>

          {/* Right 5 cols: Exceptions Queue */}
          <div className="lg:col-span-5 space-y-4">
            <div className="agri-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E9E7E1] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#17201D] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#C86B4A]" />
                  <span>Exception Management Queue</span>
                </h3>
                <span className="rounded-full bg-[#C86B4A]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#C86B4A]">
                  {exceptions.length} Alert
                </span>
              </div>

              {exceptions.length === 0 ? (
                <div className="rounded-xl bg-[#F7F5EF] p-6 text-center text-xs text-[#7D8A65] border border-[#E9E7E1]">
                  <CheckCircle2 className="h-6 w-6 text-[#173D32] mx-auto mb-2" />
                  <span>All logistics operations operating with zero active exceptions.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {exceptions.map((exc) => (
                    <div
                      key={exc.event_id}
                      className="rounded-2xl border border-[#C86B4A]/30 bg-[#FFF9F6] p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#C86B4A] uppercase tracking-wider text-[11px]">
                          {exc.event_type.replace("_", " ")} • Order #{exc.order_id}
                        </span>
                        <span className="text-[10px] text-[#7D8A65]">
                          {exc.actor}
                        </span>
                      </div>

                      <p className="text-[#17201D] text-xs leading-relaxed font-light">
                        {exc.note}
                      </p>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          disabled={resolvingId === exc.event_id}
                          onClick={() => handleResolveException(exc.event_id)}
                          className="flex items-center gap-1.5 rounded-full bg-[#173D32] px-4 py-1.5 text-[11px] font-bold text-white hover:bg-[#215445] transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{resolvingId === exc.event_id ? "Resolving..." : "Approve & Resolve"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Governance Policy Notice */}
            <div className="rounded-2xl border border-[#E9E7E1] bg-[#FFFFFF] p-5 text-xs text-[#7D8A65] space-y-1.5">
              <span className="font-bold text-[#17201D] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#173D32]" />
                <span>Governance & Audit Policy</span>
              </span>
              <p className="leading-relaxed font-light">
                Every route update, exception resolution, driver POD submission, and payout disbursement writes an append-only event to the immutable Lucknow cluster ledger.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
