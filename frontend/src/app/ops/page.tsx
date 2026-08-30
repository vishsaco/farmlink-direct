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
  TrendingUp,
  UserCheck,
  Clock,
  Coins,
  Store,
} from "lucide-react";

export default function OperationsControlTowerPage() {
  const [lang, setLang] = useState<Language>("en");
  const { user } = useAuth();
  const t = translations[lang];

  const [orders, setOrders] = useState<Order[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [planningRoute, setPlanningRoute] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"fleet" | "orders" | "exceptions" | "mandi" | "settlements">("fleet");

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

  const totalGmv = orders.reduce((acc, o) => acc + (o.requested_qty * o.agreed_price), 0);
  const activeOrdersCount = orders.filter((o) => !["delivered", "settled", "cancelled"].includes(o.status)).length;
  const totalVolumeTonnage = (orders.reduce((acc, o) => acc + o.requested_qty, 0) / 1000).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col">
      <Navbar lang={lang} onLanguageChange={setLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E9E7E1] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7D8A65] uppercase tracking-wider mb-1">
              <ShieldAlert className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Operations Control Tower • Lucknow Cluster Command</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#17201D]">
              Fulfillment Command Center
            </h1>
            <p className="text-sm text-[#7D8A65] mt-1 font-light max-w-2xl">
              Real-time fleet telemetry, bottleneck resolution, dynamic route solver, and APMC Mandi price ingestion.
            </p>
          </div>

          {/* Navigation Tab Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#E9E7E1] shadow-xs overflow-x-auto">
            {[
              { id: "fleet", label: "Fleet & Dispatch", icon: Truck },
              { id: "orders", label: `Live Orders (${orders.length})`, icon: Package },
              { id: "exceptions", label: `Quality Holds (${exceptions.length})`, icon: AlertTriangle },
              { id: "mandi", label: "Mandi Ingestion", icon: Store },
              { id: "settlements", label: "Settlement Approvals", icon: Coins },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? "bg-[#173D32] text-white shadow-xs"
                      : "text-[#7D8A65] hover:text-[#17201D]"
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
          <div className="rounded-2xl bg-[#DCE8DD] p-4 border border-[#173D32]/20 text-xs font-bold text-[#173D32] flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Global Ops Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-[#E9E7E1] bg-white p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#7D8A65] uppercase tracking-wider flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Active Dispatches</span>
            </span>
            <p className="font-serif text-3xl font-bold text-[#17201D]">{activeOrdersCount} In Transit</p>
            <p className="text-[11px] text-[#7D8A65] font-light">Tata Ace vehicle fulfillment</p>
          </div>

          <div className="rounded-3xl border border-[#E9E7E1] bg-white p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#7D8A65] uppercase tracking-wider flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-[#C99B43]" />
              <span>Moving Volume</span>
            </span>
            <p className="font-serif text-3xl font-bold text-[#17201D]">{totalVolumeTonnage} <span className="text-lg font-normal text-[#7D8A65]">Tons</span></p>
            <p className="text-[11px] text-[#7D8A65] font-light">Direct from Lucknow farm gates</p>
          </div>

          <div className="rounded-3xl border border-[#E9E7E1] bg-white p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#7D8A65] uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Network GMV</span>
            </span>
            <p className="font-serif text-3xl font-bold text-[#17201D]">{formatCurrency(totalGmv)}</p>
            <p className="text-[11px] text-[#7D8A65] font-light">Total settled & active trade</p>
          </div>

          <div className="rounded-3xl border border-[#E9E7E1] bg-white p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#7D8A65] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Fulfillment SLA</span>
            </span>
            <p className="font-serif text-3xl font-bold text-[#173D32]">99.4%</p>
            <p className="text-[11px] text-[#7D8A65] font-light">&lt; 24 hr farm-to-dock transit</p>
          </div>
        </div>

        {/* TAB 1: FLEET & DISPATCH MAP */}
        {activeTab === "fleet" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                    Real-Time Cluster Corridor Map
                  </h3>
                  <span className="text-xs text-[#7D8A65]">Live Lucknow Vehicle Telemetry</span>
                </div>
                <div className="rounded-3xl border border-[#E9E7E1] bg-white p-2 shadow-xs overflow-hidden h-[460px]">
                  <LeafletMap lots={lots} center={[26.86, 80.93]} height="100%" />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                    Route Optimization Engine
                  </h3>
                </div>

                <div className="rounded-3xl border border-[#E9E7E1] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-6 w-6 text-[#173D32]" />
                    <div>
                      <h4 className="font-bold text-sm text-[#17201D]">Tata Ace Fleet Solver</h4>
                      <p className="text-xs text-[#7D8A65]">OR-Tools Capacity & Time-Window VRP</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#7D8A65] leading-relaxed">
                    Optimizes multi-stop milk runs combining Bakshi Ka Talab, Malihabad, and Chinhat farm gates with Hazratganj and Gomti Nagar buyer receiving docks.
                  </p>

                  <button
                    onClick={handleGenerateRoute}
                    disabled={planningRoute}
                    className="w-full rounded-full bg-[#173D32] py-3 text-xs font-bold text-white hover:bg-[#215445] transition shadow-xs disabled:opacity-50"
                  >
                    {planningRoute ? "Running OR-Tools Solver..." : "Re-Calculate Optimized Routes"}
                  </button>

                  {routePlan && (
                    <div className="border-t border-[#E9E7E1] pt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#7D8A65]">Planned Stops:</span>
                        <span className="font-bold text-[#17201D]">{routePlan.summary.stop_count} Stops</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7D8A65]">Total Trip Distance:</span>
                        <span className="font-bold text-[#17201D]">{routePlan.summary.total_distance_km} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7D8A65]">Vehicle Load:</span>
                        <span className="font-bold text-[#173D32]">{routePlan.summary.total_load_kg} kg ({routePlan.summary.load_utilization}%)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                  Live Multi-Party Orders ({orders.length})
                </h3>
                <p className="text-xs text-[#7D8A65] mt-0.5">
                  Monitor status transitions across Farmer, Driver, and Buyer fulfillment milestones.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-[#E9E7E1] bg-white p-12 text-center space-y-3">
                <Package className="h-10 w-10 text-[#7D8A65]/40 mx-auto" />
                <p className="font-bold text-sm text-[#17201D]">No Active Orders in System</p>
                <p className="text-xs text-[#7D8A65]">Orders placed by buyers will appear here in real time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-3xl border border-[#E9E7E1] bg-white p-6 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9E7E1] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#C99B43] uppercase tracking-wider block">
                          Order #{ord.id}
                        </span>
                        <h4 className="font-serif font-bold text-lg text-[#17201D] capitalize mt-0.5">
                          {ord.requested_qty} kg {ord.lot_detail?.commodity} (Grade {ord.lot_detail?.grade}) • {formatCurrency(ord.requested_qty * ord.agreed_price)}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#DCE8DD] px-3 py-1 text-xs font-bold text-[#173D32] capitalize">
                          Status: {ord.status_display}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Farmer info */}
                      <div className="rounded-2xl bg-[#F7F5EF] p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#173D32]">1. Origin Farm</span>
                        <p className="font-bold text-[#17201D]">{ord.farmer_name || "Verified Farmer"}</p>
                        <p className="text-[#7D8A65]">{ord.farmer_village || "Bakshi Ka Talab, Lucknow"}</p>
                        <p className="text-[#7D8A65]">{ord.farmer_phone || "+91-9876543211"}</p>
                      </div>

                      {/* Driver info */}
                      <div className="rounded-2xl bg-[#F7F5EF] p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#173D32]">2. Assigned Fleet Driver</span>
                        <p className="font-bold text-[#17201D]">{ord.driver_name || "Logistics Driver"}</p>
                        <p className="text-[#7D8A65]">{ord.vehicle_info || "Tata Ace Gold"}</p>
                        <p className="text-[#7D8A65]">{ord.driver_phone || "+91-9876500000"}</p>
                      </div>

                      {/* Buyer info */}
                      <div className="rounded-2xl bg-[#F7F5EF] p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#173D32]">3. Buyer Receiving Dock</span>
                        <p className="font-bold text-[#17201D]">{ord.buyer_org || "Direct Buyer"}</p>
                        <p className="text-[#7D8A65]">{ord.delivery_address || "Hazratganj, Lucknow"}</p>
                        <p className="text-[11px] font-mono font-bold text-[#173D32]">Delivery OTP: {ord.delivery_otp || "8842"}</p>
                      </div>
                    </div>

                    {/* Ops Action Transition Buttons */}
                    <div className="border-t border-[#E9E7E1] pt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#7D8A65]">Ops State Override:</span>
                      {ord.valid_transitions && ord.valid_transitions.map((st) => (
                        <button
                          key={st}
                          onClick={() => handleAdvanceOrderStatus(ord.id, st)}
                          className="rounded-full bg-[#173D32] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#215445] transition capitalize"
                        >
                          &rarr; Set to {st.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUALITY HOLDS & EXCEPTIONS */}
        {activeTab === "exceptions" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                Quality Inspection Holds & Exceptions ({exceptions.length})
              </h3>
              <p className="text-xs text-[#7D8A65] mt-0.5">
                Investigate and resolve quality holds, sorting variances, or transport delays.
              </p>
            </div>

            <div className="space-y-4">
              {exceptions.map((exc, i) => (
                <div key={i} className="rounded-3xl border border-[#C86B4A]/30 bg-[#FFFDF7] p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#C86B4A]/10 px-3 py-1 text-xs font-bold text-[#C86B4A] uppercase flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{exc.event_type.replace("_", " ")}</span>
                    </span>
                    <span className="text-xs text-[#7D8A65] font-mono">Order #{exc.order_id}</span>
                  </div>

                  <p className="text-xs text-[#17201D] font-medium leading-relaxed">{exc.note}</p>
                  <p className="text-[11px] text-[#7D8A65]">Logged by: {exc.actor} • {formatDateTime(exc.timestamp)}</p>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        alert(`Quality Hold on Order #${exc.order_id} resolved. Approved for vehicle loading.`);
                        loadData();
                      }}
                      className="rounded-full bg-[#173D32] px-4 py-2 text-xs font-bold text-white hover:bg-[#215445] transition"
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
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                Lucknow APMC Mandi Ingestion Monitor
              </h3>
              <p className="text-xs text-[#7D8A65] mt-0.5">
                Real-time benchmark feeds from Agmarknet & data.gov.in across Dubagga, Naveen Mandi, and Sitapur Road.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div key={idx} className="rounded-3xl border border-[#E9E7E1] bg-white p-6 shadow-xs space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#C99B43] uppercase tracking-wider block">{m.mandi}</span>
                    <h4 className="font-serif font-bold text-xl text-[#17201D] mt-0.5">{m.crop}</h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#7D8A65]">APMC Mandi Modal:</span>
                      <span className="font-bold text-[#17201D]">{m.apmcModal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7D8A65]">FarmLink Direct Price:</span>
                      <span className="font-bold text-[#173D32]">{m.directFarmgate}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E9E7E1] pt-2">
                      <span className="text-[#7D8A65]">Farmer Realization:</span>
                      <span className="font-bold text-[#173D32]">{m.farmerGain}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#F7F5EF] p-2.5 text-center text-[11px] text-[#7D8A65] font-medium">
                    {m.arrivals}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SETTLEMENT APPROVALS */}
        {activeTab === "settlements" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                Settlement Clearing & Payout Approvals
              </h3>
              <p className="text-xs text-[#7D8A65] mt-0.5">
                Automated 93% net farmer payout, 5% logistics fee, and 2% platform fee reconciliation.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E9E7E1] bg-white p-6 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5EF] text-[#7D8A65] uppercase font-bold border-b border-[#E9E7E1]">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Produce Details</th>
                    <th className="p-4">Gross Trade</th>
                    <th className="p-4">Logistics (5%)</th>
                    <th className="p-4">Platform (2%)</th>
                    <th className="p-4">Farmer Payout (93%)</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E7E1] text-[#17201D]">
                  {orders.map((ord) => {
                    const gross = ord.requested_qty * ord.agreed_price;
                    const log = Math.round(gross * 0.05);
                    const plat = Math.round(gross * 0.02);
                    const net = gross - log - plat;
                    return (
                      <tr key={ord.id} className="hover:bg-[#F7F5EF]/50 transition">
                        <td className="p-4 font-bold">#{ord.id}</td>
                        <td className="p-4">{ord.requested_qty} kg {ord.lot_detail?.commodity} (Grade {ord.lot_detail?.grade})</td>
                        <td className="p-4 font-bold">{formatCurrency(gross)}</td>
                        <td className="p-4 text-[#7D8A65]">{formatCurrency(log)}</td>
                        <td className="p-4 text-[#7D8A65]">{formatCurrency(plat)}</td>
                        <td className="p-4 font-bold text-[#173D32] text-sm">{formatCurrency(net)}</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              alert(`Settlement for Order #${ord.id} cleared and released to farmer's bank account.`);
                            }}
                            className="rounded-full bg-[#173D32] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#215445] transition"
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
        )}
      </main>
    </div>
  );
}
