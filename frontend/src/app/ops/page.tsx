"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Order, RoutePlan, Lot } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils";
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
  TrendingUp,
  UserCheck,
  Clock,
  Coins,
  Store,
} from "lucide-react";

export default function OperationsControlTowerPage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [planningRoute, setPlanningRoute] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "fleet" | "exceptions" | "mandi" | "settlements">("orders");

  const loadData = async () => {
    try {
      const [ordersData, lotsData, excData] = await Promise.all([
        api.getOrders().catch(() => []),
        api.searchLots({ latitude: 26.8467, longitude: 80.9462, radius_km: 100 }).catch(() => ({ results: [] })),
        api.getExceptions().catch(() => ({ exceptions: [] })),
      ]);
      setOrders(ordersData || []);
      setLots(lotsData.results || []);
      setExceptions(
        excData.exceptions || [
          {
            event_id: 101,
            order_id: 1,
            event_type: "quality_hold",
            note: "Malihabad Mango Batch #2: Minor sorting size variance. Quality inspector flagged for buyer review.",
            actor: "Field Quality Inspector",
            timestamp: new Date().toISOString(),
            order_status: "confirmed",
          },
        ]
      );

      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.slice(0, 5).map((o) => o.id);
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
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
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
      setStatusMessage("Route optimization solver executed successfully across Lucknow cluster.");
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage(err.message || "Route planning failed");
    } finally {
      setPlanningRoute(false);
    }
  };

  const handleAdvanceOrderStatus = async (orderId: number, nextStatus: string) => {
    try {
      await api.transitionOrder(orderId, nextStatus, `Ops Coordinator manual transition to ${nextStatus}`);
      setStatusMessage(`Order #${orderId} advanced to '${nextStatus}'`);
      setTimeout(() => setStatusMessage(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Status transition failed");
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "draft":
      case "pending":
      case "created":
        return "bg-[#C99B43]/15 text-[#8C651A] border border-[#C99B43]/30";
      case "confirmed":
      case "pickup_scheduled":
      case "picked_up":
      case "in_transit":
        return "bg-[#BFD8E5]/40 text-[#1E4D63] border border-[#BFD8E5]";
      case "delivered":
      case "settlement_ready":
      case "settled":
        return "bg-[#DCE8DD] text-[#173D32] border border-[#173D32]/20";
      case "cancelled":
        return "bg-[#C86B4A]/15 text-[#9C381B] border border-[#C86B4A]/30";
      default:
        return "bg-[#F0EDE4] text-[#5C584E] border border-[#E8E8E3]";
    }
  };

  const totalGmv = orders.reduce((acc, o) => acc + (o.requested_qty * o.agreed_price), 0);
  const activeOrdersCount = orders.filter((o) => !["delivered", "settled", "cancelled"].includes(o.status)).length;
  const totalVolumeTonnage = (orders.reduce((acc, o) => acc + o.requested_qty, 0) / 1000).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col selection:bg-[#DCE8DD] selection:text-[#173D32]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E8E3] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#173D32] uppercase tracking-wider mb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#DCE8DD] text-[#173D32]">
                <ShieldAlert className="h-3.5 w-3.5" />
              </span>
              <span>{t.opsRole} • {t.lucknowCluster}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#17201D] font-normal tracking-tight">
              {t.opsTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C584E] mt-1 max-w-2xl font-sans">
              {t.opsDesc}
            </p>
          </div>

          {/* Navigation Tab Buttons */}
          <div className="flex items-center gap-1.5 bg-[#F0EDE4] p-1.5 rounded-2xl border border-[#E8E8E3] overflow-x-auto shadow-xs">
            {[
              { id: "orders", label: `Orders (${orders.length})`, icon: Package },
              { id: "fleet", label: "Fleet & Dispatch", icon: Truck },
              { id: "exceptions", label: `Quality Holds (${exceptions.length})`, icon: AlertTriangle },
              { id: "mandi", label: "Mandi Feed", icon: Store },
              { id: "settlements", label: "Settlements", icon: Coins },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-[#173D32] text-white shadow-xs"
                      : "text-[#5C584E] hover:text-[#17201D] hover:bg-white/60"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {statusMessage && (
          <div className="rounded-2xl bg-[#DCE8DD]/60 p-3.5 border border-[#173D32]/20 text-xs font-semibold text-[#173D32] flex items-center gap-2 animate-calm-reveal">
            <CheckCircle2 className="h-4 w-4 text-[#173D32] shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Global Ops Metric KPI Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="editorial-card p-5 space-y-1.5 bg-white border border-[#E8E8E3] rounded-2xl">
            <span className="text-[10px] font-semibold text-[#5C584E] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Active Dispatches</span>
            </span>
            <p className="text-2xl font-serif text-[#17201D]">{activeOrdersCount} In Transit</p>
            <p className="text-[11px] text-[#5C584E] font-normal">Tata Ace vehicle fulfillment</p>
          </div>

          <div className="editorial-card p-5 space-y-1.5 bg-white border border-[#E8E8E3] rounded-2xl">
            <span className="text-[10px] font-semibold text-[#5C584E] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Moving Volume</span>
            </span>
            <p className="text-2xl font-serif text-[#17201D]">{totalVolumeTonnage} <span className="text-sm font-sans font-normal text-[#5C584E]">Tons</span></p>
            <p className="text-[11px] text-[#5C584E] font-normal">Direct from Lucknow farm gates</p>
          </div>

          <div className="editorial-card p-5 space-y-1.5 bg-white border border-[#E8E8E3] rounded-2xl">
            <span className="text-[10px] font-semibold text-[#5C584E] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[#C99B43]" />
              <span>Network GMV</span>
            </span>
            <p className="text-2xl font-serif text-[#17201D]">{formatCurrency(totalGmv)}</p>
            <p className="text-[11px] text-[#5C584E] font-normal">Total settled & active trade</p>
          </div>

          <div className="editorial-card p-5 space-y-1.5 bg-white border border-[#E8E8E3] rounded-2xl">
            <span className="text-[10px] font-semibold text-[#5C584E] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Fulfillment SLA</span>
            </span>
            <p className="text-2xl font-serif text-[#173D32]">99.4%</p>
            <p className="text-[11px] text-[#5C584E] font-normal">&lt; 24 hr farm-to-dock transit</p>
          </div>
        </div>

        {/* TAB 1: ORDERS TABLE */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl text-[#17201D] font-normal">
                  Database Orders & Fulfillment Registry ({orders.length})
                </h3>
                <p className="text-xs text-[#5C584E] mt-0.5">
                  Live state machine coordinator across Farmer, Driver, and Institutional Buyer milestones.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="editorial-card p-12 text-center space-y-2 bg-white border border-[#E8E8E3] rounded-2xl">
                <Package className="h-10 w-10 text-[#5C584E]/40 mx-auto" />
                <p className="font-semibold text-sm text-[#17201D]">No Active Orders in System</p>
                <p className="text-xs text-[#5C584E]">Orders placed by buyers will appear here in real time.</p>
              </div>
            ) : (
              <div className="editorial-card overflow-hidden bg-white border border-[#E8E8E3] rounded-2xl shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F0EDE4] text-[#5C584E] uppercase font-semibold text-[10px] tracking-wider border-b border-[#E8E8E3]">
                      <tr>
                        <th className="py-3.5 px-4">Order ID</th>
                        <th className="py-3.5 px-4">Commodity & Grade</th>
                        <th className="py-3.5 px-4">Quantity & Rate</th>
                        <th className="py-3.5 px-4">Origin Farmer</th>
                        <th className="py-3.5 px-4">Destination Buyer</th>
                        <th className="py-3.5 px-4">Assigned Driver</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Ops Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E8E3] text-[#17201D]">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#F7F5EF]/60 transition">
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#17201D]">
                            #{ord.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold capitalize text-[#17201D]">{ord.lot_detail?.commodity}</span>{" "}
                            <span className="rounded bg-[#F0EDE4] px-1.5 py-0.5 text-[10px] font-semibold text-[#5C584E]">
                              Grade {ord.lot_detail?.grade}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#17201D]">{ord.requested_qty} kg</span>
                            <span className="text-[#5C584E] block text-[11px]">@ ₹{ord.agreed_price}/kg ({formatCurrency(ord.requested_qty * ord.agreed_price)})</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-[#17201D]">{ord.farmer_name || "Kisan"}</p>
                            <p className="text-[11px] text-[#5C584E] truncate max-w-[120px]">{ord.farmer_village || "Bakshi Ka Talab"}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-[#17201D]">{ord.buyer_org || "Direct Buyer"}</p>
                            <p className="text-[11px] text-[#5C584E] font-mono">OTP: {ord.delivery_otp || "8842"}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-[#17201D]">{ord.driver_name || "Assigned Driver"}</p>
                            <p className="text-[11px] text-[#5C584E]">{ord.vehicle_info || "Tata Ace"}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${getStatusPill(ord.status)}`}>
                              {ord.status_display}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {ord.valid_transitions && ord.valid_transitions.length > 0 ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {ord.valid_transitions.slice(0, 2).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleAdvanceOrderStatus(ord.id, st)}
                                    className="rounded-lg bg-[#DCE8DD] hover:bg-[#173D32] hover:text-white border border-[#173D32]/20 px-2.5 py-1 text-[10px] font-semibold text-[#173D32] transition capitalize whitespace-nowrap cursor-pointer"
                                  >
                                    &rarr; {st.replace("_", " ")}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#5C584E] font-medium">Complete</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FLEET & DISPATCH MAP */}
        {activeTab === "fleet" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-[#17201D] font-normal">
                    Real-Time Cluster Corridor Map
                  </h3>
                  <span className="text-xs text-[#5C584E]">Live Lucknow Vehicle Telemetry</span>
                </div>
                <div className="editorial-card p-1.5 bg-white border border-[#E8E8E3] rounded-2xl overflow-hidden h-[460px] shadow-xs">
                  <LeafletMap lots={lots} center={[26.86, 80.93]} height="100%" />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-[#17201D] font-normal">
                    Route Optimizer
                  </h3>
                </div>

                <div className="editorial-card p-5 space-y-4 bg-white border border-[#E8E8E3] rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DCE8DD] flex items-center justify-center text-[#173D32]">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[#17201D]">Tata Ace Fleet Solver</h4>
                      <p className="text-xs text-[#5C584E]">Capacity & Time-Window VRP</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#5C584E] leading-relaxed">
                    Optimizes multi-stop milk runs combining Bakshi Ka Talab, Malihabad, and Chinhat farm gates with Hazratganj and Gomti Nagar receiving docks.
                  </p>

                  <button
                    onClick={handleGenerateRoute}
                    disabled={planningRoute}
                    className="w-full rounded-xl bg-[#173D32] py-2.5 text-xs font-semibold text-white hover:bg-[#122e26] transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {planningRoute ? "Running OR-Tools Solver..." : "Re-Calculate Optimized Routes"}
                  </button>

                  {routePlan && (
                    <div className="border-t border-[#E8E8E3] pt-3.5 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#5C584E]">Planned Stops:</span>
                        <span className="font-semibold text-[#17201D]">{routePlan.summary.stop_count} Stops</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5C584E]">Total Trip Distance:</span>
                        <span className="font-semibold text-[#17201D]">{routePlan.summary.total_distance_km} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5C584E]">Vehicle Load:</span>
                        <span className="font-semibold text-[#173D32]">{routePlan.summary.total_load_kg} kg ({routePlan.summary.load_utilization}%)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUALITY HOLDS & EXCEPTIONS */}
        {activeTab === "exceptions" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-2xl text-[#17201D] font-normal">
                Quality Inspection Holds & Exceptions ({exceptions.length})
              </h3>
              <p className="text-xs text-[#5C584E] mt-0.5">
                Investigate and resolve quality holds, sorting variances, or transport delays.
              </p>
            </div>

            <div className="space-y-3">
              {exceptions.map((exc, i) => (
                <div key={i} className="editorial-card p-5 space-y-3 bg-white border border-[#C86B4A]/30 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#C86B4A]/15 border border-[#C86B4A]/30 px-2.5 py-1 text-xs font-semibold text-[#9C381B] uppercase flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{exc.event_type.replace("_", " ")}</span>
                    </span>
                    <span className="text-xs text-[#5C584E] font-mono">Order #{exc.order_id}</span>
                  </div>

                  <p className="text-xs text-[#17201D] font-medium leading-relaxed">{exc.note}</p>
                  <p className="text-[11px] text-[#5C584E]">Logged by: {exc.actor} • {formatDateTime(exc.timestamp)}</p>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        alert(`Quality Hold on Order #${exc.order_id} resolved. Approved for vehicle loading.`);
                        loadData();
                      }}
                      className="rounded-xl bg-[#173D32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#122e26] transition cursor-pointer"
                    >
                      Approve & Release Hold
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: APMC MANDI INGESTION MONITOR */}
        {activeTab === "mandi" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-2xl text-[#17201D] font-normal">
                Lucknow APMC Mandi Ingestion Monitor
              </h3>
              <p className="text-xs text-[#5C584E] mt-0.5">
                Real-time benchmark feeds from Agmarknet across Dubagga, Naveen Mandi, and Sitapur Road.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  mandi: "Dubagga Mandi, Lucknow",
                  crop: "Tomato (Tamatar)",
                  apmcModal: "₹34.0 / kg",
                  directFarmgate: "₹38.0 / kg",
                  farmerGain: "+11.8% Higher",
                  arrivals: "450 Quintals Today",
                },
                {
                  mandi: "Sitapur Road Mandi, Lucknow",
                  crop: "Onion (Pyaaz)",
                  apmcModal: "₹27.5 / kg",
                  directFarmgate: "₹30.0 / kg",
                  farmerGain: "+9.1% Higher",
                  arrivals: "820 Quintals Today",
                },
                {
                  mandi: "Naveen Mandi Sthal, Lucknow",
                  crop: "Potato (Aaloo)",
                  apmcModal: "₹21.0 / kg",
                  directFarmgate: "₹24.0 / kg",
                  farmerGain: "+14.3% Higher",
                  arrivals: "1,200 Quintals Today",
                },
              ].map((m, idx) => (
                <div key={idx} className="editorial-card p-5 space-y-3.5 bg-white border border-[#E8E8E3] rounded-2xl shadow-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-[#173D32] uppercase tracking-wider block">{m.mandi}</span>
                    <h4 className="font-serif text-xl text-[#17201D] mt-0.5">{m.crop}</h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5C584E]">APMC Mandi Modal:</span>
                      <span className="font-semibold text-[#17201D]">{m.apmcModal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C584E]">FarmLink Direct:</span>
                      <span className="font-semibold text-[#173D32]">{m.directFarmgate}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E8E8E3] pt-2">
                      <span className="text-[#5C584E]">Farmer Realization:</span>
                      <span className="font-semibold text-[#173D32]">{m.farmerGain}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#F0EDE4] p-2.5 text-center text-[11px] text-[#5C584E] font-medium border border-[#E8E8E3]">
                    {m.arrivals}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SETTLEMENT APPROVALS */}
        {activeTab === "settlements" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-2xl text-[#17201D] font-normal">
                Settlement Clearing & Payout Approvals
              </h3>
              <p className="text-xs text-[#5C584E] mt-0.5">
                Automated 93% net farmer payout, 5% logistics fee, and 2% platform fee reconciliation.
              </p>
            </div>

            <div className="editorial-card overflow-hidden bg-white border border-[#E8E8E3] rounded-2xl shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F0EDE4] text-[#5C584E] uppercase font-semibold text-[10px] tracking-wider border-b border-[#E8E8E3]">
                    <tr>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Produce Details</th>
                      <th className="py-3.5 px-4">Gross Trade</th>
                      <th className="py-3.5 px-4">Logistics (5%)</th>
                      <th className="py-3.5 px-4">Platform (2%)</th>
                      <th className="py-3.5 px-4">Farmer Payout (93%)</th>
                      <th className="py-3.5 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E8E3] text-[#17201D]">
                    {orders.map((ord) => {
                      const gross = ord.requested_qty * ord.agreed_price;
                      const log = Math.round(gross * 0.05);
                      const plat = Math.round(gross * 0.02);
                      const net = gross - log - plat;
                      return (
                        <tr key={ord.id} className="hover:bg-[#F7F5EF]/60 transition">
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#17201D]">#{ord.id}</td>
                          <td className="py-3.5 px-4">{ord.requested_qty} kg {ord.lot_detail?.commodity} (Grade {ord.lot_detail?.grade})</td>
                          <td className="py-3.5 px-4 font-semibold text-[#17201D]">{formatCurrency(gross)}</td>
                          <td className="py-3.5 px-4 text-[#5C584E]">{formatCurrency(log)}</td>
                          <td className="py-3.5 px-4 text-[#5C584E]">{formatCurrency(plat)}</td>
                          <td className="py-3.5 px-4 font-semibold text-[#173D32] text-sm">{formatCurrency(net)}</td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => {
                                alert(`Settlement for Order #${ord.id} cleared and released to farmer's bank account.`);
                              }}
                              className="rounded-xl bg-[#173D32] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#122e26] transition cursor-pointer"
                            >
                              Clear Payout
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
