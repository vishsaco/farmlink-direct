"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Lot, Order, Commodity, Grade } from "@/lib/types";
import { translations, Language } from "@/lib/translations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { PriceGuidanceCard } from "@/components/PriceGuidanceCard";
import { VoiceListingModal } from "@/components/VoiceListingModal";
import { OrderTimelineCard } from "@/components/OrderTimelineCard";
import { SettlementCard } from "@/components/SettlementCard";
import { AuthModal } from "@/components/AuthModal";
import {
  Sprout,
  Mic,
  Plus,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Receipt,
  Building,
  Truck,
  Phone,
  User,
  ShoppingBag,
} from "lucide-react";
import confetti from "canvas-confetti";

const COMMODITY_OPTIONS: { id: Commodity; label: string; icon: string; image: string; defaultPrice: number }[] = [
  { id: "tomato", label: "Tomato (Tamatar)", icon: "🍅", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80", defaultPrice: 38 },
  { id: "onion", label: "Onion (Pyaaz)", icon: "🧅", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80", defaultPrice: 30 },
  { id: "potato", label: "Potato (Aaloo)", icon: "🥔", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80", defaultPrice: 24 },
  { id: "mango", label: "Mango (Dussehri)", icon: "🥭", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80", defaultPrice: 65 },
  { id: "chilli", label: "Green Chilli (Mirch)", icon: "🌶️", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80", defaultPrice: 48 },
  { id: "garlic", label: "Garlic (Lahsun)", icon: "🧄", image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&auto=format&fit=crop&q=80", defaultPrice: 140 },
  { id: "ginger", label: "Ginger (Adrak)", icon: "🫚", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80", defaultPrice: 95 },
  { id: "spinach", label: "Spinach (Palak)", icon: "🥬", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80", defaultPrice: 22 },
  { id: "cauliflower", label: "Cauliflower (Gobhi)", icon: "🥦", image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&auto=format&fit=crop&q=80", defaultPrice: 28 },
  { id: "wheat", label: "Wheat (Gehu)", icon: "🌾", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80", defaultPrice: 26 },
];

export default function FarmerDashboardPage() {
  const [lang, setLang] = useState<Language>("en");
  const { user } = useAuth();
  const t = translations[lang];

  const [lots, setLots] = useState<Lot[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "list" | "orders" | "farms" | "wallet">("overview");

  // Listing Form State
  const [commodity, setCommodity] = useState<Commodity>("tomato");
  const [grade, setGrade] = useState<Grade>("A");
  const [availableQty, setAvailableQty] = useState<number>(500);
  const [askingPrice, setAskingPrice] = useState<number>(38);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);
  const [qualityNotes, setQualityNotes] = useState<string>("Farm harvested, graded & sorted");
  const [photoUrl, setPhotoUrl] = useState<string>("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80");
  
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // New Farm Form State
  const [farmName, setFarmName] = useState("");
  const [farmVillage, setFarmVillage] = useState("Bakshi Ka Talab");
  const [farmDistrict, setFarmDistrict] = useState("Lucknow");
  const [farmAcres, setFarmAcres] = useState(3.5);
  const [farmLat, setFarmLat] = useState<number>(26.9124);
  const [farmLng, setFarmLng] = useState<number>(80.8947);
  const [capturingGps, setCapturingGps] = useState(false);
  const [creatingFarm, setCreatingFarm] = useState(false);
  const [farmCreatedMsg, setFarmCreatedMsg] = useState<string | null>(null);

  const selectCommodity = (c: Commodity) => {
    setCommodity(c);
    const found = COMMODITY_OPTIONS.find((item) => item.id === c);
    if (found) {
      setPhotoUrl(found.image);
      setAskingPrice(found.defaultPrice);
    }
  };

  const handleGetGpsLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setCapturingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCapturingGps(false);
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          setFarmLat(lat);
          setFarmLng(lng);
          setFarmCreatedMsg(`Captured Real GPS: ${lat}° N, ${lng}° E`);
          setTimeout(() => setFarmCreatedMsg(null), 4000);
        },
        (err) => {
          setCapturingGps(false);
          alert("GPS permission was denied. Using Lucknow regional cluster coordinates.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSelectVillagePreset = (villageName: string, lat: number, lng: number) => {
    setFarmVillage(villageName);
    setFarmLat(lat);
    setFarmLng(lng);
  };

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [lotsData, ordersData, farmsData] = await Promise.all([
        api.getMyLots().catch(() => ({ results: [] })),
        api.getOrders().catch(() => []),
        api.getMyFarms().catch(() => []),
      ]);
      setLots(lotsData.results || []);
      setOrders(ordersData || []);
      setFarms(Array.isArray(farmsData) ? farmsData : []);
      if (Array.isArray(farmsData) && farmsData.length > 0 && !selectedFarmId) {
        setSelectedFarmId(farmsData[0].id);
      }
      if (ordersData && ordersData.length > 0) {
        setSelectedOrder(ordersData[0]);
      }
    } catch (err) {
      console.error("Failed to load farmer data", err);
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

  const handleVoiceApply = (data: any) => {
    if (data.commodity) {
      selectCommodity(data.commodity);
    }
    if (data.grade) setGrade(data.grade);
    if (data.available_qty) setAvailableQty(data.available_qty);
    if (data.asking_price) setAskingPrice(data.asking_price);
    if (data.quality_notes) setQualityNotes(data.quality_notes);
    setActiveTab("list");
  };

  const handlePublishLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setPublishing(true);
    try {
      const now = new Date();
      const harvestDate = new Date(now.setDate(now.getDate() + 1))
        .toISOString()
        .split("T")[0];
      const pickupStart = new Date(Date.now() + 6 * 3600 * 1000).toISOString();
      const pickupEnd = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

      await api.createLot({
        farm: selectedFarmId || undefined,
        commodity,
        grade,
        available_qty: availableQty,
        unit: "kg",
        asking_price: askingPrice,
        harvest_at: harvestDate,
        pickup_window_start: pickupStart,
        pickup_window_end: pickupEnd,
        quality_notes: qualityNotes,
        photo_url: photoUrl,
      });

      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {}

      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        setActiveTab("overview");
        loadData();
      }, 1200);
    } catch (err: any) {
      console.error("Publish lot failed", err);
      alert(err.message || "Failed to publish lot");
    } finally {
      setPublishing(false);
    }
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setCreatingFarm(true);
    try {
      await api.createFarm({
        name: farmName || `${user.first_name || "Kisan"}'s Farm`,
        village: farmVillage,
        district: farmDistrict,
        latitude: farmLat,
        longitude: farmLng,
        total_area_acres: farmAcres,
      });
      setFarmCreatedMsg(`Farm '${farmName || "New Farm"}' registered at [${farmLat}, ${farmLng}]!`);
      setFarmName("");
      loadData();
      setTimeout(() => setFarmCreatedMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to create farm");
    } finally {
      setCreatingFarm(false);
    }
  };

  // Calculations
  const totalInventoryKg = lots.reduce((sum, l) => sum + l.remaining_qty, 0);
  const totalInventoryVal = lots.reduce((sum, l) => sum + l.remaining_qty * l.asking_price, 0);
  const readySettlementVal = orders
    .filter((o) => ["delivered", "settlement_ready", "settled"].includes(o.status))
    .reduce((sum, o) => sum + o.requested_qty * o.agreed_price * 0.93, 0);

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col">
      <Navbar lang={lang} onLanguageChange={setLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
        {/* TOP HERO SUMMARY PANEL (Deep Forest Green) */}
        <div className="forest-panel p-6 sm:p-10 relative overflow-hidden shadow-xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Greeting & Value */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#DCE8DD]">
                Farmer & FPO Producer Portal • Lucknow Cluster
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white">
                Welcome, {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Kisan"}.
              </h1>
              <p className="text-sm text-[#DCE8DD]/90 font-light max-w-lg">
                Your harvest is connected directly with bulk institutional buyers in Lucknow. Track who purchased your crops, driver pickup schedules, and automated settlements.
              </p>

              <div className="pt-2 flex flex-wrap items-baseline gap-4">
                <div>
                  <span className="text-xs font-medium text-[#DCE8DD] block">
                    Total Estimated Realization
                  </span>
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-[#C99B43]">
                    {formatCurrency(totalInventoryVal)}
                  </span>
                </div>
                <span className="text-xs text-[#DCE8DD]/70 border-l border-white/20 pl-4">
                  Across {lots.length} active lots ({totalInventoryKg} kg in stock)
                </span>
              </div>
            </div>

            {/* Right: Quick Action CTAs */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="flex items-center justify-center gap-2.5 rounded-full bg-[#C99B43] px-6 py-3.5 text-xs font-bold text-[#17201D] hover:bg-[#d8a94d] transition-all shadow-md hover:scale-[1.02]"
              >
                <Mic className="h-4 w-4" />
                <span>Voice-Assisted Listing (आवाज से लिस्ट करें)</span>
              </button>

              <button
                onClick={() => setActiveTab("list")}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-semibold text-white hover:bg-white/20 backdrop-blur-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>List Produce Manually</span>
              </button>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b border-[#E9E7E1] pb-3 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === "overview"
                  ? "bg-[#173D32] text-white"
                  : "text-[#17201D]/70 hover:text-[#173D32]"
              }`}
            >
              My Produce Lots ({lots.length})
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === "list"
                  ? "bg-[#173D32] text-white"
                  : "text-[#17201D]/70 hover:text-[#173D32]"
              }`}
            >
              + List Harvest Batch
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === "orders"
                  ? "bg-[#173D32] text-white"
                  : "text-[#17201D]/70 hover:text-[#173D32]"
              }`}
            >
              Who Bought My Produce ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("farms")}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === "farms"
                  ? "bg-[#173D32] text-white"
                  : "text-[#17201D]/70 hover:text-[#173D32]"
              }`}
            >
              My Farms ({farms.length})
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === "wallet"
                  ? "bg-[#173D32] text-white"
                  : "text-[#17201D]/70 hover:text-[#173D32]"
              }`}
            >
              Payouts & Settlements
            </button>
          </div>

          <span className="hidden sm:inline text-xs text-[#7D8A65] font-medium">
            Cluster: Lucknow, Uttar Pradesh
          </span>
        </div>

        {/* TAB 1: MY ACTIVE PRODUCE LOTS */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 cols: Produce Lots */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                  Active Crop Lots in Lucknow
                </h3>
                <span className="text-xs text-[#7D8A65]">
                  {lots.length} active listings
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-white border border-[#E9E7E1] animate-pulse" />
                  ))}
                </div>
              ) : lots.length === 0 ? (
                <div className="rounded-2xl border border-[#E9E7E1] bg-white p-12 text-center text-xs text-[#7D8A65]">
                  <Sprout className="h-8 w-8 text-[#173D32] mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-sm text-[#17201D]">No produce lots listed yet</p>
                  <p className="mt-1">Tap &ldquo;List Harvest Batch&rdquo; or use the microphone to speak and list your harvest.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lots.map((lot) => (
                    <div
                      key={lot.id}
                      className="agri-card p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-lg font-bold text-[#17201D] capitalize">
                            {lot.commodity}
                          </h4>
                          <span className="rounded-full bg-[#173D32] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                            Grade {lot.grade}
                          </span>
                        </div>

                        <p className="text-xs text-[#7D8A65] flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-[#C99B43]" />
                          <span>{lot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-[#F7F5EF] p-2.5 rounded-xl border border-[#E9E7E1]">
                          <div>
                            <span className="text-[10px] text-[#7D8A65] block">Available</span>
                            <span className="font-semibold text-[#17201D]">{lot.remaining_qty} kg</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#7D8A65] block">Asking Rate</span>
                            <span className="font-semibold text-[#173D32]">₹{lot.asking_price}/kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#E9E7E1] flex items-center justify-between text-xs text-[#7D8A65]">
                        <span className="font-semibold text-[#173D32]">
                          ● {lot.status.replace("_", " ")}
                        </span>
                        <span>{formatDate(lot.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 cols: Live Agmarknet Price Guidance */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-[#C99B43]/30 bg-[#FFFDF7] p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C99B43] flex items-center gap-1.5 mb-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Live Agmarknet Price Intel</span>
                </span>
                <p className="text-xs text-[#17201D] leading-relaxed font-medium">
                  Direct price synchronization with Lucknow APMC Mandis (Dubagga & Naveen Mandi).
                </p>
              </div>

              <PriceGuidanceCard
                commodity={commodity}
                cluster="Lucknow"
                onSelectPrice={(p) => setAskingPrice(p)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: LIST NEW PRODUCE FORM */}
        {activeTab === "list" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-7 agri-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E9E7E1] pb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                    List Produce Batch
                  </h3>
                  <p className="text-xs text-[#7D8A65] mt-0.5">
                    Speak naturally in Hindi or English, or fill manually below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173D32] bg-[#DCE8DD] px-3.5 py-1.5 rounded-full hover:bg-[#c9dbc9] transition"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Voice Auto-Fill (आवाज से भरें)</span>
                </button>
              </div>

              {publishSuccess ? (
                <div className="rounded-2xl bg-[#DCE8DD]/40 p-8 text-center border border-[#173D32]/20">
                  <CheckCircle2 className="h-10 w-10 text-[#173D32] mx-auto mb-2" />
                  <h4 className="font-serif text-xl font-bold text-[#173D32]">
                    Produce Lot Published!
                  </h4>
                  <p className="text-xs text-[#17201D]/70 mt-1">
                    Your {availableQty} kg {commodity} batch is now live and searchable by verified buyers in Lucknow.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePublishLot} className="space-y-4">
                  {/* Commodity */}
                  <div>
                    <label className="block text-xs font-semibold text-[#17201D] mb-1.5">
                      Produce Commodity
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {COMMODITY_OPTIONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectCommodity(item.id)}
                          className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-start gap-2 ${
                            commodity === item.id
                              ? "border-[#173D32] bg-[#173D32] text-white shadow-sm"
                              : "border-[#E9E7E1] bg-[#F7F5EF] text-[#17201D] hover:border-[#173D32]/40"
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Farm Selection */}
                  {farms.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-[#17201D] mb-1">
                        Select Origin Farm
                      </label>
                      <select
                        value={selectedFarmId}
                        onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                        className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-xs font-semibold text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                      >
                        {farms.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.village}, {f.district})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Grade */}
                  <div>
                    <label className="block text-xs font-semibold text-[#17201D] mb-1.5">
                      Quality Sorting & Grade
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["A", "B", "C"] as Grade[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(g)}
                          className={`rounded-xl border p-2.5 text-xs font-semibold transition ${
                            grade === g
                              ? "border-[#173D32] bg-[#173D32] text-white"
                              : "border-[#E9E7E1] bg-[#F7F5EF] text-[#17201D] hover:border-[#173D32]/40"
                          }`}
                        >
                          Grade {g} {g === "A" ? "(Premium)" : g === "B" ? "(Standard)" : "(Bulk)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#17201D] mb-1">
                        Batch Quantity (kg)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={50000}
                        value={availableQty}
                        onChange={(e) => setAvailableQty(Number(e.target.value))}
                        className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-sm font-bold text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#17201D] mb-1">
                        Asking Price (₹/kg)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-sm font-bold text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quality Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-[#17201D] mb-1">
                      Quality Notes & Harvest Details
                    </label>
                    <input
                      type="text"
                      value={qualityNotes}
                      onChange={(e) => setQualityNotes(e.target.value)}
                      className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={publishing}
                      className="w-full rounded-full bg-[#173D32] py-3.5 text-xs font-bold text-white hover:bg-[#215445] transition-all shadow-md disabled:opacity-50"
                    >
                      {publishing ? "Publishing Lot..." : "Publish Produce Lot"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Price Card Context */}
            <div className="lg:col-span-5 space-y-6">
              <PriceGuidanceCard
                commodity={commodity}
                cluster="Lucknow"
                onSelectPrice={(p) => setAskingPrice(p)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: WHO BOUGHT MY PRODUCE & DRIVER DETAILS */}
        {activeTab === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                  Buyer Commitments ({orders.length})
                </h3>
                <span className="text-xs text-[#7D8A65]">Real-time match</span>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-[#E9E7E1] bg-white p-8 text-center text-xs text-[#7D8A65]">
                  No buyer orders received yet. Once an institutional buyer reserves your produce, their procurement details, logistics vehicle, and driver contact will appear here.
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`agri-card cursor-pointer p-5 space-y-3 transition ${
                      selectedOrder?.id === ord.id
                        ? "border-[#173D32] bg-[#DCE8DD]/30 ring-2 ring-[#173D32]/20"
                        : "hover:border-[#173D32]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17201D] text-xs">
                        Order #{ord.id} • {ord.lot_detail?.commodity?.toUpperCase()} (Grade {ord.lot_detail?.grade})
                      </span>
                      <span className="rounded-full bg-[#173D32] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                        {ord.status_display}
                      </span>
                    </div>

                    {/* Buyer Organization Details */}
                    <div className="rounded-xl bg-white p-3 border border-[#E9E7E1] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#17201D] flex items-center gap-1.5">
                          <ShoppingBag className="h-3.5 w-3.5 text-[#173D32]" />
                          <span>Buyer: {ord.buyer_org || "Fresh Mart Procurement Kitchen"}</span>
                        </span>
                        <span className="text-[10px] text-[#7D8A65]">{ord.buyer_name || "Ankit Sharma"}</span>
                      </div>
                      <p className="text-[11px] text-[#7D8A65] flex items-center gap-1">
                        <Phone className="h-3 w-3 text-[#C99B43]" />
                        <span>{ord.buyer_phone || "+91-9876543210"}</span>
                      </p>
                    </div>

                    {/* Assigned Logistics Fleet & Driver */}
                    <div className="rounded-xl bg-[#F7F5EF] p-3 border border-[#E9E7E1] text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#7D8A65] flex items-center gap-1">
                        <Truck className="h-3 w-3 text-[#173D32]" />
                        <span>Assigned Fleet Logistics</span>
                      </span>
                      <p className="font-semibold text-[#17201D]">
                        Driver: {ord.driver_name || "Suresh Chauhan"} ({ord.driver_phone || "+91-9876543212"})
                      </p>
                      <p className="text-[10px] text-[#7D8A65]">
                        Vehicle: {ord.vehicle_info || "Tata Ace Gold (UP 32 TA 4092)"}
                      </p>
                    </div>

                    {/* Order Financials */}
                    <div className="pt-2 border-t border-[#E9E7E1] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#7D8A65] block">Quantity</span>
                        <span className="font-bold text-[#17201D]">{ord.requested_qty} kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#7D8A65] block">Net Realization</span>
                        <span className="font-bold text-[#173D32]">
                          ₹{Math.round(ord.requested_qty * ord.agreed_price * 0.93).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Order Detailed Tracking & Settlement */}
            <div className="lg:col-span-7 space-y-6">
              {selectedOrder ? (
                <>
                  <OrderTimelineCard
                    order={selectedOrder}
                    onRefresh={loadData}
                  />
                  {["delivered", "settlement_ready", "settled"].includes(
                    selectedOrder.status
                  ) && (
                    <SettlementCard orderId={selectedOrder.id} />
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-[#E9E7E1] bg-white p-12 text-center text-xs text-[#7D8A65]">
                  Select a buyer commitment order on the left to track its fulfillment state and driver location.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MY FARMS MANAGEMENT */}
        {activeTab === "farms" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 agri-card p-6 sm:p-8 space-y-4">
              <div className="border-b border-[#E9E7E1] pb-3">
                <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                  Register Real Farm / प्लॉट जोड़ें
                </h3>
                <p className="text-xs text-[#7D8A65]">
                  Add your agricultural land coordinates in Lucknow to enable nearby buyer routing.
                </p>
              </div>

              {farmCreatedMsg && (
                <div className="rounded-xl bg-[#DCE8DD] p-3 text-xs font-bold text-[#173D32] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{farmCreatedMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateFarm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">
                    Farm / Land Name
                  </label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Vikas Organic Produce Farm"
                    className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs font-medium focus:bg-white focus:border-[#173D32] focus:outline-none"
                  />
                </div>

                {/* GPS Capture & Village Presets */}
                <div className="rounded-2xl bg-[#F7F5EF] p-3.5 border border-[#E9E7E1] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17201D] flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#C99B43]" />
                      <span>Farm Geo-Coordinates</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleGetGpsLocation}
                      disabled={capturingGps}
                      className="rounded-full bg-[#173D32] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#215445] transition flex items-center gap-1 shadow-2xs"
                    >
                      <MapPin className="h-3 w-3" />
                      <span>{capturingGps ? "Acquiring GPS..." : "📍 Use Current GPS"}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#7D8A65] mb-1">
                      Quick Select Lucknow Agricultural Hub / गाँव चुनें:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { name: "Bakshi Ka Talab", lat: 26.9124, lng: 80.8947 },
                        { name: "Malihabad", lat: 26.9200, lng: 80.7100 },
                        { name: "Chinhat", lat: 26.8700, lng: 81.0200 },
                        { name: "Mohanlalganj", lat: 26.6800, lng: 80.9800 },
                        { name: "Kakori", lat: 26.8800, lng: 80.7900 },
                        { name: "Gosainganj", lat: 26.7700, lng: 81.1200 },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleSelectVillagePreset(preset.name, preset.lat, preset.lng)}
                          className={`rounded-lg p-1.5 text-[11px] font-semibold border transition text-center truncate ${
                            farmVillage === preset.name
                              ? "border-[#173D32] bg-[#173D32] text-white"
                              : "border-[#E9E7E1] bg-white text-[#17201D] hover:border-[#173D32]/40"
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#7D8A65]">Latitude:</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={farmLat}
                        onChange={(e) => setFarmLat(Number(e.target.value))}
                        className="w-full rounded-lg border border-[#E9E7E1] bg-white px-2.5 py-1.5 font-mono font-bold text-[#17201D]"
                      />
                    </div>
                    <div>
                      <span className="text-[#7D8A65]">Longitude:</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={farmLng}
                        onChange={(e) => setFarmLng(Number(e.target.value))}
                        className="w-full rounded-lg border border-[#E9E7E1] bg-white px-2.5 py-1.5 font-mono font-bold text-[#17201D]"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${farmLat},${farmLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#173D32] font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Verify on Google Maps &rarr;</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#17201D] mb-1">
                      Village / Tehsil
                    </label>
                    <input
                      type="text"
                      required
                      value={farmVillage}
                      onChange={(e) => setFarmVillage(e.target.value)}
                      placeholder="e.g. Bakshi Ka Talab"
                      className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs font-medium focus:bg-white focus:border-[#173D32] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#17201D] mb-1">
                      Farm Area (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={farmAcres}
                      onChange={(e) => setFarmAcres(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs font-medium focus:bg-white focus:border-[#173D32] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creatingFarm}
                    className="w-full rounded-full bg-[#173D32] py-3 text-xs font-bold text-white hover:bg-[#215445] transition shadow-md"
                  >
                    {creatingFarm ? "Registering Farm..." : "+ Save Farm Gate Location"}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Registered Farms */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#17201D]">
                Your Registered Farms ({farms.length})
              </h3>

              {farms.length === 0 ? (
                <div className="rounded-2xl border border-[#E9E7E1] bg-white p-8 text-center text-xs text-[#7D8A65]">
                  No farms registered yet. Use the form on the left to add your first land plot.
                </div>
              ) : (
                <div className="space-y-3">
                  {farms.map((f: any) => (
                    <div key={f.id} className="agri-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-[#17201D] text-sm flex items-center gap-1.5">
                          <Sprout className="h-4 w-4 text-[#173D32]" />
                          <span>{f.name}</span>
                        </h4>
                        <span className="rounded bg-[#DCE8DD] px-2 py-0.5 text-[10px] font-bold text-[#173D32]">
                          {f.total_area_acres} Acres
                        </span>
                      </div>
                      <p className="text-xs text-[#7D8A65] flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#C99B43]" />
                        <span>{f.village}, {f.district}</span>
                        <span className="text-[10px] text-slate-400">({f.latitude?.toFixed(4)}°N, {f.longitude?.toFixed(4)}°E)</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PAYOUTS & SETTLEMENTS */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E9E7E1] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9E7E1] pb-6">
                <div>
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#7D8A65]">
                    Farmer Settlement Ledger
                  </span>
                  <h2 className="font-serif text-3xl font-normal text-[#17201D] mt-1">
                    {formatCurrency(readySettlementVal)} ready for payout
                  </h2>
                  <p className="text-xs text-[#7D8A65] mt-1">
                    Direct automated disbursal to Bank Account / UPI within 24 hours of delivery proof.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert("Statement downloaded (simulated PDF export).")}
                    className="rounded-full border border-[#173D32] bg-white px-5 py-2 text-xs font-bold text-[#173D32] hover:bg-[#F7F5EF] transition"
                  >
                    Download Statement (PDF)
                  </button>
                </div>
              </div>

              {/* Settlement History Cards */}
              <div className="mt-6 space-y-4">
                <h4 className="font-serif text-lg font-bold text-[#17201D]">
                  Order Payout Invoices
                </h4>

                {orders.length === 0 ? (
                  <p className="text-xs text-[#7D8A65]">No completed deliveries yet.</p>
                ) : (
                  orders.map((ord) => (
                    <div key={ord.id} className="pt-2">
                      <SettlementCard orderId={ord.id} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Voice Modal */}
      <VoiceListingModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onApply={handleVoiceApply}
        lang={lang}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="register"
        defaultRole="farmer"
      />
    </div>
  );
}
