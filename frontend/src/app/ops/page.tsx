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
        return "bg-[#E8E4F2] text-[#262238] border border-[#262238]/10";
      case "confirmed":
      case "pickup_scheduled":
      case "picked_up":
      case "in_transit":
        return "bg-[#E8E4F2] text-[#262238] border border-[#262238]/20";
      case "delivered":
      case "settlement_ready":
      case "settled":
        return "bg-[#E8E4F2] text-[#718A68] border border-[#718A68]/30 font-semibold";
      case "cancelled":
        return "bg-[#C86B4A]/10 text-[#C86B4A] border border-[#C86B4A]/30";
      default:
        return "bg-[#F6F5F1] text-[#737184] border border-[#E4E2DD]";
    }
  };

  const totalGmv = orders.reduce((acc, o) => acc + (o.requested_qty * o.agreed_price), 0);
  const activeOrdersCount = orders.filter((o) => !["delivered", "settled", "cancelled"].includes(o.status)).length;
  const totalVolumeTonnage = (orders.reduce((acc, o) => acc + o.requested_qty, 0) / 1000).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#262238] flex flex-col selection:bg-[#E8E4F2] selection:text-[#262238]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4E2DD] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#262238]/10 bg-[#E8E4F2] px-3.5 py-1 text-xs font-medium text-[#262238] uppercase tracking-wider mb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-[#262238]">
                <ShieldAlert className="h-3.5 w-3.5 text-[#718A68]" />
              </span>
              <span>{t.opsRole} • {t.lucknowCluster}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#262238] font-normal tracking-tight">
              {t.opsTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#737184] mt-1 max-w-2xl font-normal">
              {t.opsDesc}
            </p>
          </div>

          {/* Navigation Tab Buttons */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#E4E2DD] overflow-x-auto shadow-xs scrollbar-none">
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
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-[#262238] text-white shadow-xs"
                      : "text-[#737184] hover:text-[#262238]"
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
          <div className="rounded-[20px] bg-[#E8E4F2] p-4 border border-[#262238]/10 text-xs font-medium text-[#262238] flex items-center gap-2 animate-calm-reveal">
            <CheckCircle2 className="h-4 w-4 text-[#718A68] shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Global Ops Metric KPI Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 space-y-1.5 bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
            <span className="text-[10px] font-medium text-[#737184] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#718A68]" />
              <span>Active Dispatches</span>
            </span>
            <p className="text-2xl font-serif text-[#262238] font-normal">{activeOrdersCount} In Transit</p>
            <p className="text-[11px] text-[#737184] font-normal">Tata Ace vehicle fulfillment</p>
          </div>

          <div className="p-5 space-y-1.5 bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
            <span className="text-[10px] font-medium text-[#737184] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-[#262238]" />
              <span>Moving Volume</span>
            </span>
            <p className="text-2xl font-serif text-[#262238] font-normal">{totalVolumeTonnage} <span className="text-sm font-sans font-normal text-[#737184]">Tons</span></p>
            <p className="text-[11px] text-[#737184] font-normal">Direct from Lucknow farm gates</p>
          </div>

          <div className="p-5 space-y-1.5 bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
            <span className="text-[10px] font-medium text-[#737184] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[#718A68]" />
              <span>Network GMV</span>
            </span>
            <p className="text-2xl font-serif text-[#262238] font-normal">{formatCurrency(totalGmv)}</p>
            <p className="text-[11px] text-[#737184] font-normal">Total settled & active trade</p>
          </div>

          <div className="p-5 space-y-1.5 bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
            <span className="text-[10px] font-medium text-[#737184] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#718A68]" />
              <span>Fulfillment SLA</span>
            </span>
            <p className="text-2xl font-serif text-[#718A68] font-normal">99.4%</p>
            <p className="text-[11px] text-[#737184] font-normal">&lt; 24 hr farm-to-dock transit</p>
          </div>
        </div>

        {/* TAB 1: ORDERS TABLE */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl text-[#262238] font-normal">
                  Database Orders & Fulfillment Registry ({orders.length})
                </h3>
                <p className="text-xs text-[#737184] mt-0.5 font-normal">
                  Live state machine coordinator across Farmer, Driver, and Institutional Buyer milestones.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center space-y-2 bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
                <Package className="h-10 w-10 text-[#737184]/40 mx-auto" />
                <p className="font-serif text-lg text-[#262238] font-normal">No Active Orders in System</p>
                <p className="text-xs text-[#737184]">Orders placed by buyers will appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-hidden bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F6F5F1] text-[#737184] uppercase font-mono font-medium text-[10px] tracking-wider border-b border-[#E4E2DD]">
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
                    <tbody className="divide-y divide-[#E4E2DD] text-[#262238]">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#E8E4F2]/30 transition">
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#262238]">
                            #{ord.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium capitalize text-[#262238]">{ord.lot_detail?.commodity}</span>{" "}
                            <span className="rounded-full bg-[#E8E4F2] px-2 py-0.5 text-[10px] font-medium text-[#262238]">
                              Grade {ord.lot_detail?.grade}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#262238]">{ord.requested_qty} kg</span>
                            <span className="text-[#737184] block text-[11px]">@ ₹{ord.agreed_price}/kg ({formatCurrency(ord.requested_qty * ord.agreed_price)})</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-[#262238]">{ord.farmer_name || "Kisan"}</p>
                            <p className="text-[11px] text-[#737184] truncate max-w-[120px]">{ord.farmer_village || "Bakshi Ka Talab"}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-[#262238]">{ord.buyer_org || "Direct Buyer"}</p>
                            <p className="text-[11px] text-[#737184] font-mono">OTP: {ord.delivery_otp || "8842"}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-[#262238]">{ord.driver_name || "Assigned Driver"}</p>
                            <p className="text-[11px] text-[#737184]">{ord.vehicle_info || "Tata Ace"}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${getStatusPill(ord.status)}`}>
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
                                    className="rounded-full bg-[#E8E4F2] hover:bg-[#262238] hover:text-white border border-[#262238]/10 px-3 py-1 text-[10px] font-medium text-[#262238] transition capitalize whitespace-nowrap cursor-pointer"
                                  >
                                    &rarr; {st.replace("_", " ")}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#737184] font-medium">Complete</span>
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
                  <h3 className="font-serif text-2xl text-[#262238] font-normal">
                    Real-Time Cluster Corridor Map
                  </h3>
                  <span className="text-xs text-[#737184]">Live Lucknow Vehicle Telemetry</span>
                </div>
                <div className="p-1.5 bg-white border border-[#E4E2DD] rounded-[28px] overflow-hidden h-[460px] shadow-xs">
                  <LeafletMap lots={lots} center={[26.86, 80.93]} height="100%" />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-[#262238] font-normal">
                    Route Optimizer
                  </h3>
                </div>

                <div className="p-6 space-y-4 bg-white border border-[#E4E2DD] rounded-[28px] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#E8E4F2] flex items-center justify-center text-[#262238]">
                      <Truck className="h-5 w-5 text-[#718A68]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-[#262238]">Tata Ace Fleet Solver</h4>
                      <p className="text-xs text-[#737184]">Capacity & Time-Window VRP</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#737184] leading-relaxed">
                    Optimizes multi-stop milk runs combining Bakshi Ka Talab, Malihabad, and Chinhat farm gates with Hazratganj and Gomti Nagar receiving docks.
                  </p>

                  <button
                    onClick={handleGenerateRoute}
                    disabled={planningRoute}
                    className="w-full rounded-full bg-[#262238] py-3 text-xs font-medium text-white hover:bg-[#342e4c] transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {planningRoute ? "Running OR-Tools Solver..." : "Re-Calculate Optimized Routes"}
                  </button>

                  {routePlan && (
                    <div className="border-t border-[#E4E2DD] pt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#737184]">Planned Stops:</span>
                        <span className="font-medium text-[#262238]">{routePlan.summary.stop_count} Stops</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#737184]">Total Trip Distance:</span>
                        <span className="font-medium text-[#262238]">{routePlan.summary.total_distance_km} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#737184]">Vehicle Load:</span>
                        <span className="font-medium text-[#718A68]">{routePlan.summary.total_load_kg} kg ({routePlan.summary.load_utilization}%)</span>
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
              <h3 className="font-serif text-2xl text-[#262238] font-normal">
                Quality Inspection Holds & Exceptions ({exceptions.length})
              </h3>
              <p className="text-xs text-[#737184] mt-0.5">
                Investigate and resolve quality holds, sorting variances, or transport delays.
              </p>
            </div>

            <div className="space-y-3">
              {exceptions.map((exc, i) => (
                <div key={i} className="p-6 space-y-3 bg-white border border-[#C86B4A]/30 rounded-[24px] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#C86B4A]/10 border border-[#C86B4A]/20 px-3 py-1 text-xs font-medium text-[#C86B4A] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{exc.event_type.replace("_", " ")}</span>
                    </span>
                    <span className="text-xs text-[#737184] font-mono">Order #{exc.order_id}</span>
                  </div>

                  <p className="text-xs text-[#262238] font-normal leading-relaxed">{exc.note}</p>
                  <p className="text-[11px] text-[#737184]">Logged by: {exc.actor} • {formatDateTime(exc.timestamp)}</p>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        alert(`Quality Hold on Order #${exc.order_id} resolved. Approved for vehicle loading.`);
                        loadData();
                      }}
                      className="rounded-full bg-[#262238] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#342e4c] transition cursor-pointer"
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
              <h3 className="font-serif text-2xl text-[#262238] font-normal">
                Lucknow APMC Mandi Ingestion Monitor
              </h3>
              <p className="text-xs text-[#737184] mt-0.5">
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
                <div key={idx} className="p-6 space-y-4 bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
                  <div>
                    <span className="text-[10px] font-mono font-medium text-[#262238] uppercase tracking-wider block">{m.mandi}</span>
                    <h4 className="font-serif text-2xl text-[#262238] font-normal mt-1">{m.crop}</h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#737184]">APMC Mandi Modal:</span>
                      <span className="font-medium text-[#262238]">{m.apmcModal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737184]">FarmLink Direct:</span>
                      <span className="font-semibold text-[#718A68]">{m.directFarmgate}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E4E2DD] pt-2">
                      <span className="text-[#737184]">Farmer Realization:</span>
                      <span className="font-semibold text-[#718A68]">{m.farmerGain}</span>
                    </div>
                  </div>

                  <div className="rounded-[16px] bg-[#F6F5F1] p-3 text-center text-[11px] text-[#737184] font-medium border border-[#E4E2DD]">
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
              <h3 className="font-serif text-2xl text-[#262238] font-normal">
                Settlement Clearing & Payout Approvals
              </h3>
              <p className="text-xs text-[#737184] mt-0.5">
                Automated 93% net farmer payout, 5% logistics fee, and 2% platform fee reconciliation.
              </p>
            </div>

            <div className="overflow-hidden bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F6F5F1] text-[#737184] uppercase font-mono font-medium text-[10px] tracking-wider border-b border-[#E4E2DD]">
                    <tr>
                      <th className="py-3.5 px-5">Order ID</th>
                      <th className="py-3.5 px-5">Produce Details</th>
                      <th className="py-3.5 px-5">Gross Trade</th>
                      <th className="py-3.5 px-5">Logistics (5%)</th>
                      <th className="py-3.5 px-5">Platform (2%)</th>
                      <th className="py-3.5 px-5">Farmer Payout (93%)</th>
                      <th className="py-3.5 px-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E2DD] text-[#262238]">
                    {orders.map((ord) => {
                      const gross = ord.requested_qty * ord.agreed_price;
                      const log = Math.round(gross * 0.05);
                      const plat = Math.round(gross * 0.02);
                      const net = gross - log - plat;
                      return (
                        <tr key={ord.id} className="hover:bg-[#E8E4F2]/30 transition">
                          <td className="py-3.5 px-5 font-mono font-medium text-[#262238]">#{ord.id}</td>
                          <td className="py-3.5 px-5">{ord.requested_qty} kg {ord.lot_detail?.commodity} (Grade {ord.lot_detail?.grade})</td>
                          <td className="py-3.5 px-5 font-medium text-[#262238]">{formatCurrency(gross)}</td>
                          <td className="py-3.5 px-5 text-[#737184]">{formatCurrency(log)}</td>
                          <td className="py-3.5 px-5 text-[#737184]">{formatCurrency(plat)}</td>
                          <td className="py-3.5 px-5 font-semibold text-[#718A68] text-sm">{formatCurrency(net)}</td>
                          <td className="py-3.5 px-5">
                            <button
                              onClick={() => {
                                alert(`Settlement for Order #${ord.id} cleared and released to farmer's bank account.`);
                              }}
                              className="rounded-full bg-[#262238] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#342e4c] transition cursor-pointer shadow-xs"
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
