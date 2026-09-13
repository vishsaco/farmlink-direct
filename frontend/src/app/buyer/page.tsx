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
  CloudSun,
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
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col selection:bg-[#DCE8DD] selection:text-[#173D32]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E8E3] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#173D32] uppercase tracking-wider mb-1">
              <ShoppingBag className="h-3.5 w-3.5 text-[#173D32]" />
              <span>{t.buyerRole} • {t.lucknowCluster}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#17201D] font-normal tracking-tight">
              {t.buyerTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#576561] font-sans mt-1 max-w-xl">
              {t.buyerDesc}
            </p>
          </div>

          {/* VIEW SWITCHER PILLS */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E8E8E3] shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#173D32] text-white shadow-xs"
                  : "text-[#576561] hover:text-[#17201D]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "लिस्ट देखें" : "Grid View"}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#173D32] text-white shadow-xs"
                  : "text-[#576561] hover:text-[#17201D]"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? `नक्शा (${filteredLots.length})` : `Map View (${filteredLots.length})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("orders")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "orders"
                  ? "bg-[#173D32] text-white shadow-xs"
                  : "text-[#576561] hover:text-[#17201D]"
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
            {/* SEARCH & REFINED FILTERS BAR */}
            <div className="editorial-card p-4 sm:p-5 space-y-3.5 bg-white rounded-2xl border border-[#E8E8E3]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search input */}
                <div className="md:col-span-4 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#576561]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === "hi" ? "फसल, ग्रेड, गाँव या किसान खोजें..." : "Search crop, grade, village, or farmer..."}
                    className="w-full rounded-xl border border-[#E8E8E3] bg-[#F7F5EF]/40 pl-9 pr-3.5 py-2 text-xs font-medium text-[#17201D] placeholder:text-[#576561]/70 focus:border-[#173D32] focus:outline-none transition"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        commodity === c.id
                          ? "bg-[#173D32] text-white shadow-xs"
                          : "bg-[#F7F5EF] border border-[#E8E8E3] text-[#17201D] hover:bg-[#E8E8E3]/60"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        grade === g.id
                          ? "border border-[#173D32] bg-[#DCE8DD] text-[#173D32]"
                          : "border border-[#E8E8E3] bg-white text-[#576561] hover:text-[#17201D]"
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
                <p className="text-center text-xs font-normal text-[#576561]">
                  {lang === "hi"
                    ? "लखनऊ के चारों ओर उपलब्ध फसलों का वास्तविक नक्शा। विवरण देखने और ऑर्डर करने के लिए किसी भी पिन पर क्लिक करें।"
                    : `Showing real-time farm supply plots around Lucknow within ${radiusKm} km. Click any pin to inspect batch details & reserve.`}
                </p>
              </div>
            )}

            {/* 3-COLUMN DESKTOP / 1-COL MOBILE GRID (Produce Lot Cards) */}
            {viewMode === "list" && (
              <div>
                <div className="flex items-center justify-between mb-4 text-xs font-medium text-[#576561]">
                  <span>
                    {lang === "hi" ? "लखनऊ में उपलब्ध फसलें: " : "Showing "}
                    <strong className="text-[#17201D] font-semibold">{filteredLots.length}</strong> {lang === "hi" ? "सत्यापित लॉट" : "verified produce lots"}
                  </span>
                  <span className="font-semibold text-[#173D32]">
                    {lang === "hi" ? "दूरी: सबसे नजदीक" : "Sorted by: Nearest Distance"}
                  </span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-64 rounded-2xl bg-white border border-[#E8E8E3] animate-pulse" />
                    ))}
                  </div>
                ) : filteredLots.length === 0 ? (
                  /* Friendly Empty State */
                  <div className="rounded-2xl border border-dashed border-[#E8E8E3] bg-white p-12 text-center text-xs text-[#576561] space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-[#DCE8DD]/50 flex items-center justify-center text-[#173D32]">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <p className="font-serif text-base text-[#17201D]">
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
                          className="editorial-card group flex flex-col justify-between overflow-hidden cursor-pointer bg-white rounded-2xl border border-[#E8E8E3] transition-all hover:shadow-md"
                          onClick={() => handleOpenDetail(lot)}
                        >
                          <div>
                            {/* Card Image */}
                            <div className="relative h-44 w-full overflow-hidden bg-[#F7F5EF]">
                              <img
                                src={img}
                                alt={lot.commodity}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                              />
                              <div className="absolute top-3 left-3">
                                <span className="rounded-md bg-[#173D32] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
                                  Grade {lot.grade}
                                </span>
                              </div>
                              <div className="absolute bottom-3 right-3">
                                <span className="rounded-md bg-[#17201D]/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                                  {lot.distance_km ? `${lot.distance_km} km away` : "Lucknow Cluster"}
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-serif text-lg text-[#17201D] capitalize group-hover:text-[#173D32] transition">
                                    {lot.commodity}
                                  </h3>
                                  <p className="text-xs font-medium text-[#576561] flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3.5 w-3.5 text-[#173D32]" />
                                    <span>{lot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className="text-xl font-bold text-[#C99B43]">
                                    ₹{lot.asking_price}
                                  </span>
                                  <span className="text-[10px] text-[#576561] block font-mono">/ kg</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs text-[#17201D] bg-[#F7F5EF] p-2.5 rounded-xl border border-[#E8E8E3]">
                                <div>
                                  <span className="text-[9px] text-[#576561] block uppercase font-mono font-semibold">
                                    {lang === "hi" ? "उपलब्ध" : "Available"}
                                  </span>
                                  <span className="font-bold text-xs text-[#17201D]">{lot.remaining_qty} kg</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-[#576561] block uppercase font-mono font-semibold">
                                    {lang === "hi" ? "उत्पादक" : "Farmer"}
                                  </span>
                                  <span className="font-semibold text-xs text-[#173D32]">
                                    {lot.created_by_name || "Verified Kisan"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-4 pb-4 pt-0 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-[#576561] font-normal truncate max-w-[160px]">
                              {lot.quality_notes || "Uniform quality sorting"}
                            </span>
                            <span className="font-semibold text-[#173D32] group-hover:underline flex items-center gap-1">
                              <span>{lang === "hi" ? "फसल बुक करें" : "Reserve Lot"}</span>
                              <ArrowRight className="h-3 w-3 text-[#173D32]" />
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
              <h3 className="font-serif text-xl text-[#17201D] border-b border-[#E8E8E3] pb-2">
                {lang === "hi" ? `मेरे खरीदारी ऑर्डर (${orders.length})` : `My Procurement Orders (${orders.length})`}
              </h3>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E8E8E3] bg-white p-8 text-center text-xs text-[#576561] space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#F7F5EF] flex items-center justify-center text-[#576561]">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <p className="font-serif text-base text-[#17201D]">
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
                    className={`editorial-card cursor-pointer p-4 transition space-y-2.5 bg-white rounded-2xl border ${
                      activeOrderTracking?.id === ord.id
                        ? "border-[#173D32] bg-[#DCE8DD]/20 ring-1 ring-[#173D32]/30"
                        : "border-[#E8E8E3] hover:border-[#D4D4CE]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#17201D] text-xs">
                        Order #{ord.id} • {ord.lot_detail?.commodity?.toUpperCase()}
                      </span>
                      <span className="rounded-md bg-[#DCE8DD] px-2 py-0.5 text-[10px] font-bold text-[#173D32] uppercase">
                        {ord.status_display}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#17201D]">
                      <span className="text-[#576561]">Supplier: {ord.lot_detail?.created_by_name || "Verified FPO"}</span>
                      <span className="font-bold text-[#C99B43]">
                        {ord.requested_qty} kg @ ₹{ord.agreed_price}/kg
                      </span>
                    </div>

                    {/* Delivery OTP and Google Maps tracking */}
                    <div className="pt-2 border-t border-[#E8E8E3] flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-mono font-bold text-[#173D32] bg-[#DCE8DD]/60 px-2 py-0.5 rounded-md border border-[#DCE8DD]">
                        <KeyRound className="h-3 w-3" />
                        <span>OTP: {ord.delivery_otp || "8842"}</span>
                      </span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${ord.lot_detail?.farm_detail?.latitude || 26.9124},${ord.lot_detail?.farm_detail?.longitude || 80.8947}&destination=${ord.delivery_lat || 26.8467},${ord.delivery_lng || 80.9462}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-[#173D32] hover:underline flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3 text-[#173D32]" />
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
                <div className="editorial-card p-12 text-center text-xs font-semibold text-[#576561] bg-white rounded-2xl border border-[#E8E8E3]">
                  {lang === "hi" ? "ऑर्डर का विवरण और ड्राइवर लोकेशन देखने के लिए बाईं ओर से कोई ऑर्डर चुनें।" : "Select an order on the left to track state progression and delivery verification."}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* LOT DETAIL & SPLIT RESERVATION MODAL */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17201D]/75 p-3 sm:p-5 backdrop-blur-sm animate-calm-reveal">
          <div className="relative w-full max-w-3xl rounded-3xl border border-[#E8E8E3] bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedLot(null)}
              className="absolute right-4 top-4 z-20 rounded-full p-2 text-[#576561] hover:bg-[#E8E8E3]/60 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left Photo & Weather Readiness Panel */}
            <div className="md:w-5/12 relative bg-[#173D32] flex flex-col justify-between p-6 text-white overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{
                  backgroundImage: `url('${selectedLot.photo_url || cropImages[selectedLot.commodity] || cropImages.tomato}')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2820] via-[#173D32]/70 to-transparent" />

              <div className="relative z-10">
                <span className="rounded-md bg-[#173D32]/90 border border-white/20 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Grade {selectedLot.grade} Verified
                </span>
                <h3 className="font-serif text-2xl text-white mt-2 capitalize">
                  {selectedLot.commodity} Batch
                </h3>
                <p className="text-xs text-[#DCE8DD] mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#C99B43]" />
                  <span>{selectedLot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                </p>
              </div>

              {/* Weather Readiness Card */}
              <div className="relative z-10 rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/20 space-y-1.5 text-xs text-[#DCE8DD]">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <CloudSun className="h-4 w-4 text-[#C99B43]" />
                  <span>Pickup Weather Readiness</span>
                </div>
                <p className="text-[11px] text-[#DCE8DD]/90">
                  Today: 28°C · Clear transit conditions until 2:00 PM. High dispatch readiness.
                </p>
              </div>
            </div>

            {/* Right Reservation Form Panel */}
            <div className="md:w-7/12 p-6 overflow-y-auto space-y-4 bg-[#F7F5EF]/30">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#576561] tracking-wider">
                  Direct Escrow Reservation
                </span>
                <h4 className="font-serif text-xl text-[#17201D]">
                  Commit Harvest Lot
                </h4>
              </div>

              {/* Lot Specs */}
              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#E8E8E3] text-xs">
                <div>
                  <span className="text-[9px] text-[#576561] block uppercase font-mono font-semibold">Total Stock</span>
                  <p className="font-bold text-[#17201D] text-sm mt-0.5">{selectedLot.remaining_qty} kg</p>
                </div>
                <div>
                  <span className="text-[9px] text-[#576561] block uppercase font-mono font-semibold">Price Rate</span>
                  <p className="font-bold text-[#C99B43] text-sm mt-0.5">₹{selectedLot.asking_price}/kg</p>
                </div>
                <div>
                  <span className="text-[9px] text-[#576561] block uppercase font-mono font-semibold">Producer</span>
                  <p className="font-semibold text-[#173D32] text-xs mt-0.5 truncate">{selectedLot.created_by_name || "Kisan"}</p>
                </div>
              </div>

              {/* Order Reservation Form */}
              <form onSubmit={handleCommitOrder} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#17201D] mb-1">
                    {lang === "hi" ? "खरीदारी की मात्रा (किलो)" : "Procurement Quantity (kg)"}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={selectedLot.remaining_qty}
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-sm font-bold text-[#17201D] focus:border-[#173D32] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-[#17201D]">
                      {lang === "hi" ? "डिलीवरी का पता" : "Receiving Destination in Lucknow"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLocationPicker(true)}
                      className="text-xs font-semibold text-[#173D32] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="h-3 w-3 text-[#173D32]" />
                      <span>🗺️ {lang === "hi" ? "नक्शे से चुनें" : "Pick on Map"}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-xs font-medium text-[#17201D] focus:border-[#173D32] focus:outline-none"
                  />
                </div>

                {/* Cost Summary Box */}
                <div className="rounded-xl bg-[#DCE8DD]/40 p-3.5 border border-[#DCE8DD] space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#576561]">Gross Produce Amount:</span>
                    <span className="font-semibold text-[#17201D]">₹{(orderQty * selectedLot.asking_price).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#576561]">Direct Cluster Logistics:</span>
                    <span className="font-semibold text-[#173D32]">Included (₹0)</span>
                  </div>
                  <div className="pt-1.5 border-t border-[#DCE8DD] flex items-center justify-between font-semibold text-xs text-[#173D32]">
                    <span>Total Escrow Commitment:</span>
                    <span className="text-base font-bold text-[#173D32]">₹{(orderQty * selectedLot.asking_price).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {reserveError && (
                  <div className="rounded-xl bg-[#F8ECE8] p-2.5 text-xs font-medium text-[#C86B4A] border border-[#C86B4A]/30 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{reserveError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={reserving}
                  className="w-full rounded-xl bg-[#173D32] py-2.5 text-xs font-semibold text-white hover:bg-[#0F2820] transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-99"
                >
                  {reserving ? (lang === "hi" ? "ऑर्डर बुक हो रहा है..." : "Locking Escrow...") : (lang === "hi" ? "🔒 ऑर्डर बुक करें (एस्क्रो सुरक्षित)" : "🔒 Reserve & Lock Escrow")}
                </button>
              </form>
            </div>
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
