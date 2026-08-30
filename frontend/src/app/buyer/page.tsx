"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Lot, Order, Commodity, Grade } from "@/lib/types";
import { translations, Language } from "@/lib/translations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { LeafletMap } from "@/components/LeafletMap";
import { OrderTimelineCard } from "@/components/OrderTimelineCard";
import { SettlementCard } from "@/components/SettlementCard";
import { AuthModal } from "@/components/AuthModal";
import {
  ShoppingBag,
  MapPin,
  Filter,
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
  Map,
  List,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Clock,
  Phone,
  ArrowUpRight,
  KeyRound,
  RotateCw,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function BuyerMarketplacePage() {
  const [lang, setLang] = useState<Language>("en");
  const { user } = useAuth();
  const t = translations[lang];

  const [lots, setLots] = useState<Lot[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map" | "orders">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [commodity, setCommodity] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [sortBy, setSortBy] = useState<string>("distance");

  // Lot Detail & Reservation Modal
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [orderQty, setOrderQty] = useState<number>(300);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    "Fresh Mart Central Warehouse, Hazratganj, Lucknow"
  );
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [activeOrderTracking, setActiveOrderTracking] = useState<Order | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Default image mapper for crops
  const cropImages: Record<string, string> = {
    tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
    potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
  };

  const searchLots = async () => {
    setLoading(true);
    try {
      const res = await api.searchLots({
        latitude: 26.8467,
        longitude: 80.9462,
        radius_km: radiusKm,
        commodity: commodity || undefined,
        grade: grade || undefined,
        sort_by: sortBy,
      });
      setLots(res.results || []);
    } catch (err) {
      console.error("Search lots failed", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!user) return;
    try {
      const ordersData = await api.getOrders();
      setOrders(ordersData || []);
    } catch (err) {
      console.error("Failed to load buyer orders", err);
    }
  };

  useEffect(() => {
    searchLots();
    const interval = setInterval(() => {
      api.searchLots({
        latitude: 26.8467,
        longitude: 80.9462,
        radius_km: radiusKm,
        commodity: commodity || undefined,
        grade: grade || undefined,
        sort_by: sortBy,
      }).then((res) => {
        if (res?.results) setLots(res.results);
      }).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [commodity, grade, radiusKm, sortBy]);

  useEffect(() => {
    loadOrders();
    if (user) {
      const interval = setInterval(loadOrders, 4000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleOpenDetail = (lot: Lot) => {
    setSelectedLot(lot);
    setOrderQty(Math.min(300, lot.remaining_qty));
    setReserveError("");
  };

  const handleCommitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setReserving(true);
    setReserveError("");

    try {
      const newOrder = await api.createOrder({
        lot_id: selectedLot.id,
        requested_qty: orderQty,
        agreed_price: selectedLot.asking_price,
        delivery_address: deliveryAddress,
        delivery_lat: 26.8467,
        delivery_lng: 80.9462,
        notes: `Order created by ${user.first_name || user.username}. Quality confirmed.`,
      });

      // Advance order to confirmed immediately to lock escrow
      try {
        await api.transitionOrder(newOrder.id, "confirmed", "Buyer payment held in escrow. Scheduled for logistics pickup.");
      } catch {}

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      setSelectedLot(null);
      searchLots();
      loadOrders();
      setActiveOrderTracking(newOrder);
      setViewMode("orders");
    } catch (err: any) {
      setReserveError(err.message || "Failed to commit order");
    } finally {
      setReserving(false);
    }
  };

  const filteredLots = lots.filter((lot) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lot.commodity.toLowerCase().includes(q) ||
      lot.grade.toLowerCase().includes(q) ||
      (lot.farm_detail?.village && lot.farm_detail.village.toLowerCase().includes(q)) ||
      (lot.created_by_name && lot.created_by_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col">
      <Navbar lang={lang} onLanguageChange={setLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E9E7E1] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7D8A65] uppercase tracking-wider mb-1">
              <ShoppingBag className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Direct Farm-Gate Marketplace • Lucknow Regional Cluster</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#17201D]">
              Fresh produce, ready for demand.
            </h1>
            <p className="text-sm text-[#7D8A65] mt-1 font-light max-w-xl">
              Source verified, graded produce directly from nearby farmers and FPOs with transparent pricing and 24-hour fulfillment.
            </p>
          </div>

          {/* VIEW SWITCHER */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#E9E7E1] shadow-xs shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-[#173D32] text-white"
                  : "text-[#7D8A65] hover:text-[#17201D]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                viewMode === "map"
                  ? "bg-[#173D32] text-white"
                  : "text-[#7D8A65] hover:text-[#17201D]"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>Map View ({filteredLots.length})</span>
            </button>
            <button
              onClick={() => setViewMode("orders")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                viewMode === "orders"
                  ? "bg-[#173D32] text-white"
                  : "text-[#7D8A65] hover:text-[#17201D]"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>My Orders ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LIST / MAP MARKETPLACE DISCOVERY */}
        {viewMode !== "orders" && (
          <div className="space-y-6">
            {/* SEARCH & FILTERS BAR */}
            <div className="rounded-2xl border border-[#E9E7E1] bg-white p-4 sm:p-6 shadow-xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search input */}
                <div className="md:col-span-4 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D8A65]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by crop, grade, village, or farmer..."
                    className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] pl-10 pr-4 py-2.5 text-xs text-[#17201D] placeholder:text-[#7D8A65]/70 focus:bg-white focus:border-[#173D32] focus:outline-none font-medium"
                  />
                </div>

                {/* Commodity buttons */}
                <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {[
                    { id: "", label: "All Crops" },
                    { id: "tomato", label: "🍅 Tomato" },
                    { id: "onion", label: "🧅 Onion" },
                    { id: "potato", label: "🥔 Potato" },
                    { id: "mango", label: "🥭 Mango" },
                    { id: "chilli", label: "🌶️ Chilli" },
                    { id: "garlic", label: "🧄 Garlic" },
                    { id: "ginger", label: "🫚 Ginger" },
                    { id: "spinach", label: "🥬 Spinach" },
                    { id: "cauliflower", label: "🥦 Gobhi" },
                    { id: "wheat", label: "🌾 Wheat" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCommodity(c.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                        commodity === c.id
                          ? "bg-[#173D32] text-white shadow-xs"
                          : "bg-[#F7F5EF] text-[#17201D] hover:bg-[#DCE8DD]"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Grade pills */}
                <div className="md:col-span-2 flex items-center gap-1.5">
                  {[
                    { id: "", label: "All" },
                    { id: "A", label: "Grade A" },
                    { id: "B", label: "Grade B" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGrade(g.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        grade === g.id
                          ? "border border-[#173D32] bg-[#DCE8DD] text-[#173D32] font-bold"
                          : "border border-[#E9E7E1] bg-[#F7F5EF] text-[#7D8A65] hover:text-[#17201D]"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                {/* Radius Slider */}
                <div className="md:col-span-2 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#7D8A65] mb-1">
                    <span>Radius</span>
                    <span className="text-[#173D32] font-bold">{radiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-[#173D32] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* MAP VIEW */}
            {viewMode === "map" && (
              <div className="space-y-3">
                <LeafletMap
                  center={[26.8467, 80.9462]}
                  radiusKm={radiusKm}
                  lots={filteredLots}
                  selectedLotId={selectedLot?.id}
                  onSelectLot={handleOpenDetail}
                  height="480px"
                />
                <p className="text-center text-xs text-[#7D8A65]">
                  Showing real-time farm supply plots around Lucknow within {radiusKm} km. Click any pin to inspect batch details & reserve.
                </p>
              </div>
            )}

            {/* 3-COLUMN DESKTOP GRID */}
            {viewMode === "list" && (
              <div>
                <div className="flex items-center justify-between mb-4 text-xs text-[#7D8A65]">
                  <span>
                    Showing <span className="font-bold text-[#17201D]">{filteredLots.length}</span> verified produce lots in Lucknow
                  </span>
                  <span className="font-semibold text-[#173D32]">
                    Sorted by: Nearest Distance
                  </span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-64 rounded-2xl bg-white border border-[#E9E7E1] animate-pulse" />
                    ))}
                  </div>
                ) : filteredLots.length === 0 ? (
                  <div className="rounded-2xl border border-[#E9E7E1] bg-white p-12 text-center text-xs text-[#7D8A65]">
                    No lots found matching your filter criteria. Try expanding the service radius or selecting All Crops.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLots.map((lot) => {
                      const img = lot.photo_url || cropImages[lot.commodity] || cropImages.tomato;
                      return (
                        <div
                          key={lot.id}
                          className="agri-card group flex flex-col justify-between overflow-hidden rounded-2xl cursor-pointer"
                          onClick={() => handleOpenDetail(lot)}
                        >
                          <div>
                            {/* Card Image */}
                            <div className="relative h-44 w-full overflow-hidden bg-[#E9E7E1]">
                              <img
                                src={img}
                                alt={lot.commodity}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                <span className="rounded-full bg-[#173D32] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                                  Grade {lot.grade}
                                </span>
                              </div>
                              <div className="absolute bottom-3 right-3">
                                <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                                  {lot.distance_km ? `${lot.distance_km} km away` : "Lucknow Cluster"}
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-serif text-lg font-bold text-[#17201D] capitalize group-hover:text-[#173D32] transition">
                                    {lot.commodity}
                                  </h3>
                                  <p className="text-xs text-[#7D8A65] flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3 w-3 text-[#C99B43]" />
                                    <span>{lot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className="font-serif text-xl font-bold text-[#173D32]">
                                    ₹{lot.asking_price}
                                  </span>
                                  <span className="text-[10px] text-[#7D8A65] block font-medium">/ kg</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs text-[#17201D] bg-[#F7F5EF] p-2.5 rounded-xl border border-[#E9E7E1]">
                                <div>
                                  <span className="text-[10px] text-[#7D8A65] block uppercase font-semibold">Available</span>
                                  <span className="font-bold">{lot.remaining_qty} kg</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-[#7D8A65] block uppercase font-semibold">Farmer</span>
                                  <span className="font-semibold text-xs text-[#173D32]">
                                    {lot.created_by_name || "Verified Kisan"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-5 pb-5 pt-0 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-[#7D8A65] font-light truncate max-w-[170px]">
                              {lot.quality_notes || "Uniform quality sorting"}
                            </span>
                            <span className="font-bold text-[#173D32] group-hover:underline flex items-center gap-1">
                              <span>Reserve Lot</span>
                              <span>&rarr;</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BUYER ORDERS & DELIVERIES */}
        {viewMode === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                My Procurement Orders ({orders.length})
              </h3>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-[#E9E7E1] bg-white p-8 text-center text-xs text-[#7D8A65]">
                  No orders placed yet. Browse the marketplace and reserve a produce batch.
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setActiveOrderTracking(ord)}
                    className={`agri-card cursor-pointer p-4 transition ${
                      activeOrderTracking?.id === ord.id
                        ? "border-[#173D32] bg-[#DCE8DD]/30"
                        : "hover:border-[#173D32]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17201D] text-xs">
                        Order #{ord.id} • {ord.lot_detail?.commodity?.toUpperCase()}
                      </span>
                      <span className="rounded-full bg-[#173D32] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                        {ord.status_display}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-[#17201D]">
                      <span>Supplier: {ord.lot_detail?.created_by_name || "Verified FPO"}</span>
                      <span className="font-bold text-[#173D32]">
                        {ord.requested_qty} kg @ ₹{ord.agreed_price}/kg
                      </span>
                    </div>

                    {/* Show dynamic delivery OTP and Google Maps tracking for buyer */}
                    <div className="mt-2.5 pt-2 border-t border-[#E9E7E1] flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 font-mono font-bold text-[#173D32] bg-[#DCE8DD] px-2.5 py-1 rounded-full">
                        <KeyRound className="h-3 w-3" />
                        <span>Delivery OTP: {ord.delivery_otp || "8842"}</span>
                      </span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${ord.lot_detail?.farm_detail?.latitude || 26.9124},${ord.lot_detail?.farm_detail?.longitude || 80.8947}&destination=${ord.delivery_lat || 26.8467},${ord.delivery_lng || 80.9462}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-[#173D32] hover:underline flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3 text-[#C99B43]" />
                        <span>Google Maps &rarr;</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-7 space-y-6">
              {activeOrderTracking ? (
                <>
                  <OrderTimelineCard
                    order={activeOrderTracking}
                    onRefresh={loadOrders}
                  />
                  {["delivered", "settlement_ready", "settled"].includes(
                    activeOrderTracking.status
                  ) && (
                    <SettlementCard orderId={activeOrderTracking.id} />
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-[#E9E7E1] bg-white p-12 text-center text-xs text-[#7D8A65]">
                  Select an order on the left to track state progression and delivery verification.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* LOT DETAIL & RESERVATION MODAL */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17201D]/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#E9E7E1] bg-[#FFFFFF] p-6 sm:p-8 shadow-2xl space-y-6 text-[#17201D] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLot(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#7D8A65] hover:bg-[#F7F5EF] hover:text-[#17201D] transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-[#173D32] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  Grade {selectedLot.grade}
                </span>
                <span className="text-xs text-[#7D8A65] font-semibold">
                  Lot #{selectedLot.id} • {selectedLot.distance_km || 12} km away
                </span>
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#17201D] capitalize">
                {selectedLot.commodity} Batch
              </h3>
              <p className="text-xs text-[#7D8A65] mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#C99B43]" />
                <span>{selectedLot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow Cluster</span>
              </p>
            </div>

            {/* Image Preview */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-[#E9E7E1]">
              <img
                src={selectedLot.photo_url || cropImages[selectedLot.commodity] || cropImages.tomato}
                alt={selectedLot.commodity}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Produce Specs */}
            <div className="grid grid-cols-3 gap-2 bg-[#F7F5EF] p-3 rounded-2xl border border-[#E9E7E1] text-xs">
              <div>
                <span className="text-[10px] text-[#7D8A65] block uppercase font-semibold">Total Stock</span>
                <p className="font-bold text-[#17201D] mt-0.5">{selectedLot.remaining_qty} kg</p>
              </div>
              <div>
                <span className="text-[10px] text-[#7D8A65] block uppercase font-semibold">Price Rate</span>
                <p className="font-bold text-[#173D32] mt-0.5">₹{selectedLot.asking_price}/kg</p>
              </div>
              <div>
                <span className="text-[10px] text-[#7D8A65] block uppercase font-semibold">Farmer</span>
                <p className="font-bold text-[#17201D] mt-0.5 truncate">{selectedLot.created_by_name || "Verified Kisan"}</p>
              </div>
            </div>

            {reserveError && (
              <div className="rounded-xl bg-[#C86B4A]/10 p-3 border border-[#C86B4A]/30 text-xs text-[#C86B4A] font-semibold">
                {reserveError}
              </div>
            )}

            {/* Reservation Form */}
            <form onSubmit={handleCommitOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17201D] mb-1 flex items-center justify-between">
                  <span>Order Quantity (kg)</span>
                  <span className="text-[10px] text-[#7D8A65]">
                    Max: {selectedLot.remaining_qty} kg
                  </span>
                </label>
                <input
                  type="number"
                  min={10}
                  max={selectedLot.remaining_qty}
                  value={orderQty}
                  onChange={(e) => setOrderQty(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-sm font-bold text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17201D] mb-1">
                  Delivery Destination Address (Lucknow)
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-xs font-medium text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                />
              </div>

              {/* Total Calculation */}
              <div className="rounded-2xl bg-[#DCE8DD]/40 p-4 border border-[#173D32]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#173D32] block">
                    Total Order Commitment
                  </span>
                  <p className="text-[11px] text-[#7D8A65]">
                    {orderQty} kg × ₹{selectedLot.asking_price}/kg
                  </p>
                </div>
                <span className="font-serif text-2xl font-bold text-[#173D32]">
                  {formatCurrency(orderQty * selectedLot.asking_price)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLot(null)}
                  className="rounded-full border border-[#E9E7E1] px-5 py-2.5 text-xs font-semibold text-[#17201D] hover:bg-[#F7F5EF] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reserving || orderQty <= 0 || orderQty > selectedLot.remaining_qty}
                  className="flex items-center gap-2 rounded-full bg-[#173D32] px-7 py-3 text-xs font-bold text-white hover:bg-[#215445] transition-all shadow-md disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  <span>{reserving ? "Locking Stock..." : "Confirm & Place Order"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal for Unregistered Buyers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="register"
        defaultRole="buyer"
      />
    </div>
  );
}
