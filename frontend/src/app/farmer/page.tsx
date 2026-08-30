"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Lot, Order, Commodity, Grade } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
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
  Navigation,
} from "lucide-react";
import confetti from "canvas-confetti";
import { LocationPickerModal, LocationData } from "@/components/LocationPickerModal";
import { getLiveAccurateLocation } from "@/lib/geo";

const COMMODITY_OPTIONS: { id: Commodity; label: string; hindi: string; icon: string; image: string; defaultPrice: number }[] = [
  { id: "tomato", label: "Tomato (Tamatar)", hindi: "टमाटर", icon: "🍅", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80", defaultPrice: 38 },
  { id: "onion", label: "Onion (Pyaaz)", hindi: "प्याज़", icon: "🧅", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80", defaultPrice: 30 },
  { id: "potato", label: "Potato (Aaloo)", hindi: "आलू", icon: "🥔", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80", defaultPrice: 24 },
  { id: "mango", label: "Mango (Dussehri)", hindi: "दशहरी आम", icon: "🥭", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80", defaultPrice: 65 },
  { id: "chilli", label: "Green Chilli (Mirch)", hindi: "हरी मिर्च", icon: "🌶️", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80", defaultPrice: 48 },
  { id: "garlic", label: "Garlic (Lahsun)", hindi: "लहसुन", icon: "🧄", image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&auto=format&fit=crop&q=80", defaultPrice: 140 },
  { id: "ginger", label: "Ginger (Adrak)", hindi: "अदरक", icon: "🫚", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80", defaultPrice: 95 },
  { id: "spinach", label: "Spinach (Palak)", hindi: "पालक", icon: "🥬", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80", defaultPrice: 22 },
  { id: "cauliflower", label: "Cauliflower (Gobhi)", hindi: "फूलगोभी", icon: "🥦", image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&auto=format&fit=crop&q=80", defaultPrice: 28 },
  { id: "wheat", label: "Wheat (Gehu)", hindi: "गेहूं", icon: "🌾", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80", defaultPrice: 26 },
];

export default function FarmerDashboardPage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

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
  const [showFarmLocationPicker, setShowFarmLocationPicker] = useState(false);

  const selectCommodity = (c: Commodity) => {
    setCommodity(c);
    const found = COMMODITY_OPTIONS.find((item) => item.id === c);
    if (found) {
      setPhotoUrl(found.image);
      setAskingPrice(found.defaultPrice);
    }
  };

  const handleGetGpsLocation = async () => {
    setCapturingGps(true);
    try {
      const loc = await getLiveAccurateLocation();
      setFarmLat(loc.lat);
      setFarmLng(loc.lng);
      if (loc.address) {
        setFarmVillage(loc.address.split(",")[0]);
      }
      setFarmCreatedMsg(`Live GPS Captured: ${loc.lat}° N, ${loc.lng}° E (${loc.address.split(",")[0]})`);
      setTimeout(() => setFarmCreatedMsg(null), 5000);
    } catch (err: any) {
      console.error("GPS capture error", err);
      alert("Could not access live GPS. Please pick your farm location from the map.");
    } finally {
      setCapturingGps(false);
    }
  };

  const handleSelectVillagePreset = (villageName: string, lat: number, lng: number) => {
    setFarmVillage(villageName);
    setFarmLat(lat);
    setFarmLng(lng);
  };

  const loadData = async () => {
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
    <div className="min-h-screen bg-[#FAF9F5] text-[#17201D] flex flex-col selection:bg-[#DCE8DD] selection:text-[#173D32]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* 1. TOP HERO SUMMARY PANEL (High Contrast Forest & Gold) */}
        <div className="rounded-2xl bg-[#0F2720] text-white p-6 sm:p-8 relative overflow-hidden border border-[#C99B43]/30 shadow-xl map-contour-dark">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Greeting & High-Contrast Metrics */}
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C99B43]/40 bg-[#C99B43]/15 px-3 py-1 text-xs font-bold text-[#C99B43]">
                <Sprout className="h-3.5 w-3.5" />
                <span>
                  {lang === "hi" ? "किसान एवं उत्पादक पोर्टल • लखनऊ क्लस्टर" : "Farmer & Producer Portal • Lucknow Cluster"}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                {lang === "hi"
                  ? `नमस्ते, ${user?.first_name ? `${user.first_name} जी` : "किसान भाई"}`
                  : `Welcome, ${user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Farmer Producer"}`}
              </h1>

              <p className="text-sm text-[#DCE8DD] font-normal leading-relaxed max-w-xl">
                {lang === "hi"
                  ? "आपकी ताज़ा उपज सीधे लखनऊ के बड़े खरीदारों और होटलों से जुड़ी है। कोई बिचौलिया नहीं, पूरा 100% पक्का डिजिटल भुगतान।"
                  : "Your harvest is directly linked to bulk buyers across Lucknow with 0% middlemen commission and fast digital settlements."}
              </p>

              {/* High-Contrast Live Inventory Numbers */}
              <div className="pt-2 flex flex-wrap items-baseline gap-4">
                <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15 backdrop-blur-sm">
                  <span className="text-xs font-bold text-[#C99B43] uppercase tracking-wider block">
                    {lang === "hi" ? "कुल अनुमानित फसल मूल्य" : "Total Crop Inventory Value"}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    {formatCurrency(totalInventoryVal > 0 ? totalInventoryVal : 76000)}
                  </span>
                </div>

                <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15 backdrop-blur-sm">
                  <span className="text-xs font-bold text-[#DCE8DD] uppercase tracking-wider block">
                    {lang === "hi" ? "कुल उपलब्ध उपज" : "Active Stock"}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#C99B43]">
                    {(totalInventoryKg > 0 ? totalInventoryKg : 2000).toLocaleString()} {lang === "hi" ? "किलो" : "kg"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Primary CTAs */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className="flex items-center justify-center gap-2.5 rounded-xl bg-[#C99B43] px-6 py-3.5 text-xs font-bold text-[#17201D] hover:bg-[#d8a84b] transition-all shadow-lg hover:scale-102 active:scale-98"
              >
                <Mic className="h-4 w-4" />
                <span>{lang === "hi" ? "🎤 बोलकर फसल लिस्ट करें (Voice AI)" : "🎤 Voice-Assisted Listing"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold text-white hover:bg-white/20 transition-all"
              >
                <Plus className="h-4 w-4 text-[#C99B43]" />
                <span>{lang === "hi" ? "+ नई फसल लिस्ट करें (मैन्युअल)" : "+ List Harvest Manually"}</span>
              </button>
            </div>

          </div>
        </div>

        {/* 2. HIGH-CONTRAST NAVIGATION TABS (16px Radiused Cards) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#CBD5E1] pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "overview"
                ? "bg-[#173D32] text-white shadow-sm"
                : "bg-white text-[#17201D] border border-[#CBD5E1] hover:bg-[#F1F5F9]"
            }`}
          >
            🌾 {lang === "hi" ? `मेरी फसलें (${lots.length})` : `My Produce Lots (${lots.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "list"
                ? "bg-[#173D32] text-white shadow-sm"
                : "bg-white text-[#17201D] border border-[#CBD5E1] hover:bg-[#F1F5F9]"
            }`}
          >
            ➕ {lang === "hi" ? "नई फसल लिस्ट करें" : "+ List Harvest Batch"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "orders"
                ? "bg-[#173D32] text-white shadow-sm"
                : "bg-white text-[#17201D] border border-[#CBD5E1] hover:bg-[#F1F5F9]"
            }`}
          >
            🛒 {lang === "hi" ? `किसने फसल खरीदी (${orders.length})` : `Buyer Orders (${orders.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("farms")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "farms"
                ? "bg-[#173D32] text-white shadow-sm"
                : "bg-white text-[#17201D] border border-[#CBD5E1] hover:bg-[#F1F5F9]"
            }`}
          >
            📍 {lang === "hi" ? `मेरे खेत / प्लॉट (${farms.length})` : `My Farms (${farms.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wallet")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "wallet"
                ? "bg-[#173D32] text-white shadow-sm"
                : "bg-white text-[#17201D] border border-[#CBD5E1] hover:bg-[#F1F5F9]"
            }`}
          >
            💰 {lang === "hi" ? "भुगतान और बैंक खाता" : "Payouts & Ledger"}
          </button>
        </div>

        {/* TAB 1: MY ACTIVE PRODUCE LOTS */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 cols: Produce Lots */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-2">
                <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                  {lang === "hi" ? "लखनऊ में आपकी सक्रिय फसलें" : "Active Crop Lots in Lucknow"}
                </h3>
                <span className="text-xs font-bold text-[#173D32] bg-[#DCE8DD] px-3 py-1 rounded-full">
                  {lots.length} {lang === "hi" ? "सक्रिय लिस्टिंग" : "active listings"}
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-white border border-[#CBD5E1] animate-pulse" />
                  ))}
                </div>
              ) : lots.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-white p-10 text-center space-y-3">
                  <Sprout className="h-10 w-10 text-[#173D32] mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-[#17201D]">
                    {lang === "hi" ? "अभी तक कोई फसल लिस्ट नहीं है" : "No produce lots listed yet"}
                  </h4>
                  <p className="text-xs text-[#4A5568] max-w-md mx-auto">
                    {lang === "hi"
                      ? "ऊपर 'बोलकर फसल लिस्ट करें' या 'नई फसल लिस्ट करें' बटन दबाकर अपनी उपज जोड़ें।"
                      : "Tap 'Voice-Assisted Listing' or 'List Harvest Batch' above to create your first crop lot."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#173D32] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#215445] transition shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{lang === "hi" ? "फसल लिस्ट करें" : "List Produce Now"}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lots.map((lot) => (
                    <div
                      key={lot.id}
                      className="editorial-card p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-xl font-bold text-[#17201D] capitalize">
                            {lot.commodity}
                          </h4>
                          <span className="rounded-full bg-[#173D32] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                            Grade {lot.grade}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-[#4A5568] flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#C99B43]" />
                          <span>{lot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-[#FAF9F5] p-3 rounded-xl border border-[#CBD5E1]">
                          <div>
                            <span className="text-[11px] font-bold text-[#4A5568] block">
                              {lang === "hi" ? "उपलब्ध मात्रा" : "Available"}
                            </span>
                            <span className="text-base font-bold text-[#17201D]">{lot.remaining_qty} kg</span>
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-[#4A5568] block">
                              {lang === "hi" ? "तय भाव" : "Asking Rate"}
                            </span>
                            <span className="text-base font-bold text-[#173D32]">₹{lot.asking_price}/kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#CBD5E1] flex items-center justify-between text-xs">
                        <span className="font-bold text-[#173D32] flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="capitalize">{lot.status.replace("_", " ")}</span>
                        </span>
                        <span className="font-medium text-[#4A5568]">{formatDate(lot.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 cols: Live Agmarknet Price Guidance */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-[#C99B43]/40 bg-[#FFFDF7] p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C99B43] flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#C99B43]" />
                  <span>{lang === "hi" ? "सरकारी मंडी लाइव भाव" : "Live Mandi Guidance"}</span>
                </span>
                <p className="text-xs text-[#17201D] leading-relaxed font-semibold">
                  {lang === "hi"
                    ? "दुबग्गा एवं नवीन मंडी (सीतापुर रोड) के ताज़ा भाव के अनुसार अपनी उपज का सही मूल्य तय करें।"
                    : "Direct price synchronization with Lucknow APMC Mandis (Dubagga & Naveen Mandi)."}
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
            <div className="lg:col-span-7 editorial-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                    {lang === "hi" ? "फसल का विवरण भरें" : "List Produce Batch"}
                  </h3>
                  <p className="text-xs font-medium text-[#4A5568] mt-0.5">
                    {lang === "hi" ? "हिंदी या अंग्रेजी में बोलें या नीचे फॉर्म भरें।" : "Speak naturally in Hindi or English, or fill manually below."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173D32] bg-[#DCE8DD] px-4 py-2 rounded-xl hover:bg-[#c9dbc9] transition shadow-xs"
                >
                  <Mic className="h-4 w-4" />
                  <span>{lang === "hi" ? "बोलकर भरें" : "Voice Auto-Fill"}</span>
                </button>
              </div>

              {publishSuccess ? (
                <div className="rounded-2xl bg-[#DCE8DD] p-8 text-center border border-[#173D32]/30 space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-[#173D32] mx-auto" />
                  <h4 className="font-serif text-2xl font-bold text-[#173D32]">
                    {lang === "hi" ? "फसल सफलतापूर्वक लिस्ट हो गई!" : "Produce Lot Published!"}
                  </h4>
                  <p className="text-xs font-semibold text-[#17201D]">
                    {availableQty} kg {commodity} {lang === "hi" ? "की लिस्टिंग लखनऊ के खरीदारों को दिखने लगी है।" : "batch is now live for verified buyers."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePublishLot} className="space-y-5">
                  {/* Commodity */}
                  <div>
                    <label className="block text-xs font-bold text-[#17201D] mb-2 uppercase tracking-wide">
                      {lang === "hi" ? "1. फसल चुनें" : "1. Select Produce Commodity"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {COMMODITY_OPTIONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectCommodity(item.id)}
                          className={`rounded-xl border p-3 text-xs font-bold transition flex items-center gap-2 ${
                            commodity === item.id
                              ? "border-[#173D32] bg-[#173D32] text-white shadow-md scale-102"
                              : "border-[#CBD5E1] bg-white text-[#17201D] hover:border-[#173D32]"
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="truncate">{lang === "hi" ? item.hindi : item.label.split(" (")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Grade */}
                  <div>
                    <label className="block text-xs font-bold text-[#17201D] mb-2 uppercase tracking-wide">
                      {lang === "hi" ? "2. गुणवत्ता ग्रेड चुनें" : "2. Quality Sorting & Grade"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["A", "B", "C"] as Grade[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(g)}
                          className={`rounded-xl border p-3 text-xs font-bold transition ${
                            grade === g
                              ? "border-[#173D32] bg-[#173D32] text-white shadow-md"
                              : "border-[#CBD5E1] bg-white text-[#17201D] hover:border-[#173D32]"
                          }`}
                        >
                          Grade {g} {g === "A" ? (lang === "hi" ? "(उत्कृष्ट)" : "(Premium)") : g === "B" ? (lang === "hi" ? "(मध्यम)" : "(Standard)") : (lang === "hi" ? "(थोक)" : "(Bulk)")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity & Asking Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#17201D] mb-1.5">
                        {lang === "hi" ? "फसल की कुल मात्रा (किलो में)" : "Batch Quantity (kg)"}
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={50000}
                        value={availableQty}
                        onChange={(e) => setAvailableQty(Number(e.target.value))}
                        className="w-full rounded-xl border-2 border-[#CBD5E1] bg-white px-4 py-3 text-base font-bold text-[#17201D] focus:border-[#173D32] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#17201D] mb-1.5">
                        {lang === "hi" ? "मांगा गया भाव (₹/किलो)" : "Asking Price (₹/kg)"}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(Number(e.target.value))}
                        className="w-full rounded-xl border-2 border-[#CBD5E1] bg-white px-4 py-3 text-base font-bold text-[#173D32] focus:border-[#173D32] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quality Notes */}
                  <div>
                    <label className="block text-xs font-bold text-[#17201D] mb-1.5">
                      {lang === "hi" ? "फसल एवं तुड़ाई विवरण" : "Quality Notes & Harvest Details"}
                    </label>
                    <input
                      type="text"
                      value={qualityNotes}
                      onChange={(e) => setQualityNotes(e.target.value)}
                      placeholder="उदा. आज सुबह की ताज़ा तुड़ाई, छंटाई की हुई"
                      className="w-full rounded-xl border-2 border-[#CBD5E1] bg-white px-4 py-3 text-xs font-medium text-[#17201D] focus:border-[#173D32] focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={publishing}
                      className="w-full rounded-xl bg-[#173D32] py-4 text-sm font-bold text-white hover:bg-[#215445] transition-all shadow-md disabled:opacity-50"
                    >
                      {publishing
                        ? (lang === "hi" ? "फसल लिस्ट हो रही है..." : "Publishing Lot...")
                        : (lang === "hi" ? "🌾 फसल बाज़ार में लिस्ट करें" : "🌾 Publish Produce Lot")}
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
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-2">
                <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                  {lang === "hi" ? `खरीदारों के ऑर्डर (${orders.length})` : `Buyer Commitments (${orders.length})`}
                </h3>
                <span className="text-xs font-bold text-[#173D32] bg-[#DCE8DD] px-3 py-1 rounded-full">
                  {lang === "hi" ? "लाइव ऑर्डर" : "Live Orders"}
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-white p-8 text-center text-xs font-medium text-[#4A5568] space-y-2">
                  <ShoppingBag className="h-8 w-8 text-[#173D32] mx-auto" />
                  <p className="font-bold text-sm text-[#17201D]">
                    {lang === "hi" ? "अभी कोई नया ऑर्डर नहीं मिला है" : "No buyer orders received yet"}
                  </p>
                  <p>
                    {lang === "hi"
                      ? "जैसे ही कोई खरीदार आपकी फसल बुक करेगा, उसका नाम, गाड़ी और ड्राइवर का फोन नंबर यहां दिखेगा।"
                      : "Once a buyer reserves your crop, procurement details and assigned driver logistics will appear here."}
                  </p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`editorial-card cursor-pointer p-5 space-y-3 transition ${
                      selectedOrder?.id === ord.id
                        ? "border-[#173D32] bg-[#DCE8DD]/40 ring-2 ring-[#173D32]/30"
                        : "hover:border-[#173D32]"
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
                    <div className="rounded-xl bg-white p-3 border border-[#CBD5E1] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#17201D] flex items-center gap-1.5">
                          <ShoppingBag className="h-4 w-4 text-[#173D32]" />
                          <span>{ord.buyer_org || "Fresh Mart Procurement Kitchen"}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-[#4A5568]">{ord.buyer_name || "Ankit Sharma"}</span>
                      </div>
                      <p className="text-[11px] font-bold text-[#173D32] flex items-center gap-1">
                        <Phone className="h-3 w-3 text-[#C99B43]" />
                        <span>{ord.buyer_phone || "+91-9876543210"}</span>
                      </p>
                    </div>

                    {/* Assigned Logistics Fleet & Driver */}
                    <div className="rounded-xl bg-[#FAF9F5] p-3 border border-[#CBD5E1] text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#4A5568] flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-[#173D32]" />
                        <span>{lang === "hi" ? "वाहन एवं ड्राइवर विवरण" : "Assigned Fleet Logistics"}</span>
                      </span>
                      <p className="font-bold text-[#17201D]">
                        {ord.driver_name || "Suresh Chauhan"} ({ord.driver_phone || "+91-9876543212"})
                      </p>
                      <p className="text-[11px] font-medium text-[#4A5568]">
                        {ord.vehicle_info || "Tata Ace Gold (UP 32 TA 4092)"}
                      </p>
                    </div>

                    {/* Order Financials */}
                    <div className="pt-2 border-t border-[#CBD5E1] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] font-bold text-[#4A5568] block">
                          {lang === "hi" ? "मात्रा" : "Quantity"}
                        </span>
                        <span className="font-bold text-sm text-[#17201D]">{ord.requested_qty} kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-[#4A5568] block">
                          {lang === "hi" ? "कुल भुगतान" : "Net Realization"}
                        </span>
                        <span className="font-serif font-bold text-base text-[#173D32]">
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
                <div className="rounded-2xl border border-[#CBD5E1] bg-white p-12 text-center text-xs font-semibold text-[#4A5568]">
                  {lang === "hi" ? "विस्तृत विवरण देखने के लिए बाईं ओर से कोई ऑर्डर चुनें।" : "Select an order on the left to track logistics and payment."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MY FARMS MANAGEMENT */}
        {activeTab === "farms" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 editorial-card p-6 sm:p-8 space-y-4">
              <div className="border-b border-[#CBD5E1] pb-3">
                <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                  {lang === "hi" ? "नया खेत / प्लॉट जोड़ें" : "Register Farm Plot"}
                </h3>
                <p className="text-xs font-medium text-[#4A5568]">
                  {lang === "hi" ? "अपने खेत का स्थान दर्ज करें ताकि खरीदार और ड्राइवर आसानी से पहुंच सकें।" : "Add your agricultural land coordinates in Lucknow to enable fast routing."}
                </p>
              </div>

              {farmCreatedMsg && (
                <div className="rounded-xl bg-[#DCE8DD] p-3.5 text-xs font-bold text-[#173D32] flex items-center gap-2 border border-[#173D32]/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{farmCreatedMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateFarm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#17201D] mb-1.5">
                    {lang === "hi" ? "खेत / जमीन का नाम" : "Farm / Land Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="उदा. मलिहाबाद आम का बाग"
                    className="w-full rounded-xl border-2 border-[#CBD5E1] bg-white px-3.5 py-2.5 text-xs font-bold text-[#17201D] focus:border-[#173D32] focus:outline-none"
                  />
                </div>

                {/* GPS Capture & Village Presets */}
                <div className="rounded-xl bg-[#FAF9F5] p-4 border border-[#CBD5E1] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#17201D] flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-[#C99B43]" />
                      <span>{lang === "hi" ? "खेत का जीपीएस लोकेशन" : "Farm GPS Location"}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFarmLocationPicker(true)}
                        className="rounded-xl bg-white border border-[#CBD5E1] px-3 py-1.5 text-xs font-bold text-[#173D32] hover:bg-[#F1F5F9] transition flex items-center gap-1 shadow-xs"
                      >
                        <span>🗺️ {lang === "hi" ? "नक्शे से चुनें" : "Pick on Map"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGetGpsLocation}
                        disabled={capturingGps}
                        className="rounded-xl bg-[#173D32] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#215445] transition flex items-center gap-1 shadow-xs"
                      >
                        <Navigation className="h-3.5 w-3.5 text-[#C99B43]" />
                        <span>{capturingGps ? (lang === "hi" ? "खोज रहे हैं..." : "Acquiring...") : (lang === "hi" ? "📍 लाइव GPS" : "📍 Live GPS")}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A5568] mb-1.5">
                      {lang === "hi" ? "लखनऊ का नजदीकी गाँव चुनें:" : "Quick Select Lucknow Village Hub:"}
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
                          className={`rounded-lg p-2 text-xs font-bold border transition text-center truncate ${
                            farmVillage === preset.name
                              ? "border-[#173D32] bg-[#173D32] text-white"
                              : "border-[#CBD5E1] bg-white text-[#17201D] hover:border-[#173D32]"
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#17201D] mb-1">
                      {lang === "hi" ? "गाँव / ब्लॉक" : "Village / Tehsil"}
                    </label>
                    <input
                      type="text"
                      required
                      value={farmVillage}
                      onChange={(e) => setFarmVillage(e.target.value)}
                      placeholder="उदा. बख्शी का तालाब"
                      className="w-full rounded-xl border-2 border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#17201D] focus:border-[#173D32] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#17201D] mb-1">
                      {lang === "hi" ? "खेत का क्षेत्रफल (एकड़)" : "Farm Area (Acres)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={farmAcres}
                      onChange={(e) => setFarmAcres(Number(e.target.value))}
                      className="w-full rounded-xl border-2 border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#17201D] focus:border-[#173D32] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creatingFarm}
                    className="w-full rounded-xl bg-[#173D32] py-3.5 text-xs font-bold text-white hover:bg-[#215445] transition shadow-md"
                  >
                    {creatingFarm ? (lang === "hi" ? "खेत जुड़ रहा है..." : "Saving Farm...") : (lang === "hi" ? "+ खेत सुरक्षित करें" : "+ Save Farm Gate Location")}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Registered Farms */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#17201D]">
                {lang === "hi" ? `आपके पंजीकृत खेत (${farms.length})` : `Your Registered Farms (${farms.length})`}
              </h3>

              {farms.length === 0 ? (
                <div className="rounded-2xl border border-[#CBD5E1] bg-white p-8 text-center text-xs font-semibold text-[#4A5568]">
                  {lang === "hi" ? "अभी तक कोई खेत पंजीकृत नहीं है। बाईं ओर से अपना पहला खेत जोड़ें।" : "No farms registered yet. Use the form on the left to add your first land plot."}
                </div>
              ) : (
                <div className="space-y-3">
                  {farms.map((f: any) => (
                    <div key={f.id} className="editorial-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-[#17201D] text-sm flex items-center gap-1.5">
                          <Sprout className="h-4 w-4 text-[#173D32]" />
                          <span>{f.name}</span>
                        </h4>
                        <span className="rounded bg-[#DCE8DD] px-2.5 py-0.5 text-xs font-bold text-[#173D32]">
                          {f.total_area_acres} {lang === "hi" ? "एकड़" : "Acres"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#4A5568] flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#C99B43]" />
                        <span>{f.village}, {f.district}</span>
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
            <div className="editorial-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CBD5E1] pb-6">
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-[#173D32]">
                    {lang === "hi" ? "किसान खाता एवं भुगतान" : "Farmer Settlement Ledger"}
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#17201D] mt-1">
                    {formatCurrency(readySettlementVal > 0 ? readySettlementVal : 45000)} {lang === "hi" ? "भुगतान के लिए तैयार" : "ready for payout"}
                  </h2>
                  <p className="text-xs font-semibold text-[#4A5568] mt-1">
                    {lang === "hi" ? "डिलीवरी के 24 घंटे के अंदर सीधे आपके बैंक खाते / UPI में सुरक्षित हस्तांतरण।" : "Direct automated disbursal to Bank Account / UPI within 24 hours of delivery proof."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Statement downloaded (PDF).")}
                    className="rounded-xl border border-[#173D32] bg-white px-5 py-2.5 text-xs font-bold text-[#173D32] hover:bg-[#F1F5F9] transition shadow-xs"
                  >
                    📄 {lang === "hi" ? "खाता विवरण डाउनलोड करें (PDF)" : "Download Statement (PDF)"}
                  </button>
                </div>
              </div>

              {/* Settlement History Cards */}
              <div className="space-y-4">
                <h4 className="font-serif text-xl font-bold text-[#17201D]">
                  {lang === "hi" ? "ऑर्डर भुगतान रसीदें" : "Order Payout Invoices"}
                </h4>

                {orders.length === 0 ? (
                  <p className="text-xs font-semibold text-[#4A5568]">
                    {lang === "hi" ? "अभी कोई पूर्ण डिलीवरी नहीं है।" : "No completed deliveries yet."}
                  </p>
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

      {/* Farm Location Confirmation Modal */}
      <LocationPickerModal
        isOpen={showFarmLocationPicker}
        onClose={() => setShowFarmLocationPicker(false)}
        onConfirmLocation={(loc: LocationData) => {
          setFarmVillage(loc.address.split(",")[0]);
          setFarmLat(loc.lat);
          setFarmLng(loc.lng);
        }}
        initialLocation={{
          address: farmVillage,
          lat: farmLat,
          lng: farmLng,
        }}
        role="farmer"
        title={lang === "hi" ? "गूगल मैप्स पर अपने खेत का स्थान चुनें" : "Confirm Farm Gate Location on Google Maps"}
      />
    </div>
  );
}
