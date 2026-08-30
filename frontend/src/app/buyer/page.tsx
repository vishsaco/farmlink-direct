"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Lot, Order, Commodity, Grade } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
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
  ExternalLink,
  Navigation,
} from "lucide-react";
import confetti from "canvas-confetti";
import { LocationPickerModal, LocationData } from "@/components/LocationPickerModal";

export default function BuyerMarketplacePage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

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
    "Hazratganj Central Receiving Station, Lucknow"
  );
  const [deliveryLat, setDeliveryLat] = useState<number>(26.8467);
  const [deliveryLng, setDeliveryLng] = useState<number>(80.9462);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [activeOrderTracking, setActiveOrderTracking] = useState<Order | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Default image mapper for crops
  const cropImages: Record<string, string> = {
    tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
    potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
    mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80",
    chilli: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80",
    garlic: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&auto=format&fit=crop&q=80",
    ginger: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
    spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80",
    cauliflower: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&auto=format&fit=crop&q=80",
    wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
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
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
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
    <div className="min-h-screen bg-[#FAFAF9] text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              <span>{t.buyerRole} • {t.lucknowCluster}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              {t.buyerTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-xl">
              {t.buyerDesc}
            </p>
          </div>

          {/* VIEW SWITCHER */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "लिस्ट देखें" : "Grid View"}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === "map"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? `नक्शा (${filteredLots.length})` : `Map View (${filteredLots.length})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("orders")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === "orders"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? `मेरे ऑर्डर (${orders.length})` : `My Orders (${orders.length})`}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LIST / MAP MARKETPLACE DISCOVERY */}
        {viewMode !== "orders" && (
          <div className="space-y-6">
            {/* SEARCH & FILTERS BAR */}
            <div className="editorial-card p-4 sm:p-5 space-y-3.5 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search input */}
                <div className="md:col-span-4 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === "hi" ? "फसल, ग्रेड, गाँव या किसान खोजें..." : "Search crop, grade, village, or farmer..."}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Commodity buttons */}
                <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {[
                    { id: "", label: lang === "hi" ? "सभी फसलें" : "All Crops" },
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
                      type="button"
                      onClick={() => setCommodity(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                        commodity === c.id
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Grade buttons */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  {[
                    { id: "", label: lang === "hi" ? "सभी ग्रेड" : "All" },
                    { id: "A", label: "Grade A" },
                    { id: "B", label: "Grade B" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGrade(g.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        grade === g.id
                          ? "border border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
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
                <p className="text-center text-xs font-normal text-slate-500">
                  {lang === "hi"
                    ? "लखनऊ के चारों ओर उपलब्ध फसलों का वास्तविक नक्शा। विवरण देखने और ऑर्डर करने के लिए किसी भी पिन पर क्लिक करें।"
                    : `Showing real-time farm supply plots around Lucknow within ${radiusKm} km. Click any pin to inspect batch details & reserve.`}
                </p>
              </div>
            )}

            {/* 3-COLUMN DESKTOP / 1-COL MOBILE GRID (Produce Lot Cards) */}
            {viewMode === "list" && (
              <div>
                <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-500">
                  <span>
                    {lang === "hi" ? "लखनऊ में उपलब्ध फसलें: " : "Showing "}
                    <strong className="text-slate-900">{filteredLots.length}</strong> {lang === "hi" ? "सत्यापित लॉट" : "verified produce lots"}
                  </span>
                  <span className="font-bold text-emerald-700">
                    {lang === "hi" ? "दूरी: सबसे नजदीक" : "Sorted by: Nearest Distance"}
                  </span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-64 rounded-xl bg-white border border-slate-200 animate-pulse" />
                    ))}
                  </div>
                ) : filteredLots.length === 0 ? (
                  /* Friendly Empty State */
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-500 space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-sm text-slate-900">
                      {lang === "hi" ? "कोई फसल नहीं मिली।" : "No lots match your filters"}
                    </p>
                    <p>
                      {lang === "hi" ? "कृपया 'सभी फसलें' चुनकर लखनऊ के सारे लॉट देखें।" : "Try selecting 'All Crops' or resetting your search term."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredLots.map((lot) => {
                      const img = lot.photo_url || cropImages[lot.commodity] || cropImages.tomato;
                      return (
                        <div
                          key={lot.id}
                          className="editorial-card group flex flex-col justify-between overflow-hidden cursor-pointer bg-white"
                          onClick={() => handleOpenDetail(lot)}
                        >
                          <div>
                            {/* Card Image */}
                            <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                              <img
                                src={img}
                                alt={lot.commodity}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                              />
                              <div className="absolute top-2.5 left-2.5">
                                <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
                                  Grade {lot.grade}
                                </span>
                              </div>
                              <div className="absolute bottom-2.5 right-2.5">
                                <span className="rounded-md bg-slate-900/75 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                                  {lot.distance_km ? `${lot.distance_km} km away` : "Lucknow Cluster"}
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="text-lg font-bold tracking-tight text-slate-900 capitalize group-hover:text-emerald-700 transition">
                                    {lot.commodity}
                                  </h3>
                                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>{lot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className="text-xl font-bold text-emerald-700">
                                    ₹{lot.asking_price}
                                  </span>
                                  <span className="text-[11px] text-slate-500 block font-semibold">/ kg</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <div>
                                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                                    {lang === "hi" ? "उपलब्ध" : "Available"}
                                  </span>
                                  <span className="font-bold text-sm text-slate-900">{lot.remaining_qty} kg</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                                    {lang === "hi" ? "उत्पादक" : "Farmer"}
                                  </span>
                                  <span className="font-bold text-xs text-emerald-800">
                                    {lot.created_by_name || "Verified Kisan"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-4 pb-4 pt-0 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500 font-normal truncate max-w-[160px]">
                              {lot.quality_notes || "Uniform quality sorting"}
                            </span>
                            <span className="font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
                              <span>{lang === "hi" ? "फसल बुक करें" : "Reserve Lot"}</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3.5">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-2">
                {lang === "hi" ? `मेरे खरीदारी ऑर्डर (${orders.length})` : `My Procurement Orders (${orders.length})`}
              </h3>

              {orders.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500 space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-sm text-slate-900">
                    {lang === "hi" ? "अभी कोई ऑर्डर नहीं है।" : "No orders placed yet"}
                  </p>
                  <p>
                    {lang === "hi" ? "मार्केटप्लेस से ताज़ी फसल बुक करें।" : "Browse the marketplace and reserve a produce batch."}
                  </p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setActiveOrderTracking(ord)}
                    className={`editorial-card cursor-pointer p-4 transition space-y-2.5 bg-white ${
                      activeOrderTracking?.id === ord.id
                        ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500"
                        : "hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        Order #{ord.id} • {ord.lot_detail?.commodity?.toUpperCase()}
                      </span>
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        {ord.status_display}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-800">
                      <span className="font-medium text-slate-500">Supplier: {ord.lot_detail?.created_by_name || "Verified FPO"}</span>
                      <span className="font-bold text-emerald-700">
                        {ord.requested_qty} kg @ ₹{ord.agreed_price}/kg
                      </span>
                    </div>

                    {/* Delivery OTP and Google Maps tracking */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <KeyRound className="h-3 w-3" />
                        <span>OTP: {ord.delivery_otp || "8842"}</span>
                      </span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${ord.lot_detail?.farm_detail?.latitude || 26.9124},${ord.lot_detail?.farm_detail?.longitude || 80.8947}&destination=${ord.delivery_lat || 26.8467},${ord.delivery_lng || 80.9462}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        <span>Google Maps &rarr;</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-7 space-y-4">
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
                <div className="editorial-card p-12 text-center text-xs font-semibold text-slate-500 bg-white">
                  {lang === "hi" ? "ऑर्डर का विवरण और ड्राइवर लोकेशन देखने के लिए बाईं ओर से कोई ऑर्डर चुनें।" : "Select an order on the left to track state progression and delivery verification."}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* LOT DETAIL & RESERVATION MODAL */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-calm-reveal">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedLot(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  Grade {selectedLot.grade}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Lot #{selectedLot.id} • {selectedLot.distance_km || 12} km away
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 capitalize">
                {selectedLot.commodity} Batch
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>{selectedLot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow Cluster</span>
              </p>
            </div>

            {/* Produce Specs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Stock</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedLot.remaining_qty} kg</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Price Rate</span>
                <p className="font-bold text-emerald-700 text-sm mt-0.5">₹{selectedLot.asking_price}/kg</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Farmer</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5 truncate">{selectedLot.created_by_name || "Kisan"}</p>
              </div>
            </div>

            {/* Order Reservation Form */}
            <form onSubmit={handleCommitOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {lang === "hi" ? "खरीदारी की मात्रा (किलो)" : "Procurement Quantity (kg)"}
                </label>
                <input
                  type="number"
                  min={10}
                  max={selectedLot.remaining_qty}
                  value={orderQty}
                  onChange={(e) => setOrderQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {lang === "hi" ? "डिलीवरी का पता" : "Receiving Destination in Lucknow"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    <span>🗺️ {lang === "hi" ? "नक्शे से चुनें" : "Pick on Map"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Cost Summary Box */}
              <div className="rounded-lg bg-emerald-50/70 p-3.5 border border-emerald-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Gross Produce Amount:</span>
                  <span className="font-bold text-slate-900">₹{(orderQty * selectedLot.asking_price).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Direct Cluster Logistics:</span>
                  <span className="font-bold text-emerald-700">Included (₹0)</span>
                </div>
                <div className="pt-1.5 border-t border-emerald-200/80 flex items-center justify-between font-bold text-xs text-emerald-900">
                  <span>Total Escrow Commitment:</span>
                  <span className="text-base font-bold text-emerald-800">₹{(orderQty * selectedLot.asking_price).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {reserveError && (
                <div className="rounded-lg bg-rose-50 p-2.5 text-xs font-bold text-rose-700 border border-rose-200 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>{reserveError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={reserving}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {reserving ? (lang === "hi" ? "ऑर्डर बुक हो रहा है..." : "Locking Escrow...") : (lang === "hi" ? "🔒 ऑर्डर बुक करें (एस्क्रो सुरक्षित)" : "🔒 Reserve & Lock Escrow")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="register"
        defaultRole="buyer"
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onConfirmLocation={(loc: LocationData) => {
          setDeliveryAddress(loc.address);
          setDeliveryLat(loc.lat);
          setDeliveryLng(loc.lng);
        }}
        initialLocation={{
          address: deliveryAddress,
          lat: deliveryLat,
          lng: deliveryLng,
        }}
        role="buyer"
        title={lang === "hi" ? "डिलीवरी का पता चुनें" : "Confirm Receiving Hub on Google Maps"}
      />
    </div>
  );
}
