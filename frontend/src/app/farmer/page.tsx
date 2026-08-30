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
    <div className="min-h-screen bg-[#FAFAF9] text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        
        {/* 1. TOP HERO SUMMARY PANEL (Forest Green Banner) */}
        <div className="rounded-2xl bg-[#064E3B] text-white p-6 sm:p-7 relative overflow-hidden shadow-md">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Greeting & Metrics */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-200">
                <Sprout className="h-3.5 w-3.5" />
                <span>
                  {lang === "hi" ? "किसान एवं उत्पादक पोर्टल • लखनऊ क्लस्टर" : "Farmer & Producer Portal • Lucknow Cluster"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                {lang === "hi"
                  ? `नमस्ते, ${user?.first_name ? `${user.first_name} जी` : "किसान भाई"}`
                  : `Welcome, ${user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Farmer Producer"}`}
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/90 font-normal leading-relaxed max-w-xl">
                {lang === "hi"
                  ? "आपकी ताज़ा उपज सीधे लखनऊ के बड़े खरीदारों और होटलों से जुड़ी है। कोई बिचौलिया नहीं, 100% पक्का डिजिटल भुगतान।"
                  : "Directly connected to verified bulk buyers across Lucknow with 0% middlemen commission and fast digital settlements."}
              </p>

              {/* Live Inventory Stats */}
              <div className="pt-2 flex flex-wrap items-baseline gap-3">
                <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/15 backdrop-blur-xs">
                  <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
                    {lang === "hi" ? "कुल अनुमानित फसल मूल्य" : "Total Crop Inventory Value"}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {formatCurrency(totalInventoryVal > 0 ? totalInventoryVal : 76000)}
                  </span>
                </div>

                <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/15 backdrop-blur-xs">
                  <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
                    {lang === "hi" ? "कुल उपलब्ध उपज" : "Active Stock"}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-300">
                    {(totalInventoryKg > 0 ? totalInventoryKg : 2000).toLocaleString()} {lang === "hi" ? "किलो" : "kg"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Tactile CTAs with Hand-Drawn Annotation */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-3 relative">
              
              {/* Hand-Drawn Arrow & Handwritten Tooltip */}
              <div className="hidden sm:flex items-center gap-2 mr-4">
                <span className="font-caveat text-emerald-300 text-lg sm:text-xl font-bold tracking-wide">
                  {lang === "hi" ? "बोलकर तुरंत लिस्ट करें ✨" : "Speak naturally to list instantly ✨"}
                </span>
                <svg className="w-8 h-8 text-emerald-300 -rotate-12 animate-hand-arrow" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 5 10 Q 25 15 30 30 M 20 28 L 30 30 L 32 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3.5 text-sm font-bold transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Mic className="h-4 w-4 animate-pulse" />
                  <span>{lang === "hi" ? "🎤 बोलकर फसल लिस्ट करें (Voice AI)" : "🎤 Voice-Assisted Listing"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-5 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-emerald-300" />
                  <span>{lang === "hi" ? "+ नई फसल लिस्ट करें (मैन्युअल)" : "+ List Harvest Manually"}</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* 2. FLAT TAB NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
              activeTab === "overview"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            🌾 {lang === "hi" ? `मेरी फसलें (${lots.length})` : `My Produce Lots (${lots.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
              activeTab === "list"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            ➕ {lang === "hi" ? "नई फसल लिस्ट करें" : "+ List Harvest Batch"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
              activeTab === "orders"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            🛒 {lang === "hi" ? `किसने फसल खरीदी (${orders.length})` : `Buyer Orders (${orders.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("farms")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
              activeTab === "farms"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            📍 {lang === "hi" ? `मेरे खेत / प्लॉट (${farms.length})` : `My Farms (${farms.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wallet")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
              activeTab === "wallet"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            💰 {lang === "hi" ? "भुगतान और बैंक खाता" : "Payouts & Ledger"}
          </button>
        </div>

        {/* TAB 1: MY ACTIVE PRODUCE LOTS */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Produce Lots */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {lang === "hi" ? "लखनऊ में आपकी सक्रिय फसलें" : "Active Crop Lots in Lucknow"}
                </h3>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {lots.length} {lang === "hi" ? "सक्रिय लिस्टिंग" : "active listings"}
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-44 rounded-xl bg-white border border-slate-200 animate-pulse" />
                  ))}
                </div>
              ) : lots.length === 0 ? (
                /* Friendly Pastel Empty State */
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Sprout className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {lang === "hi" ? "अभी तक कोई फसल लिस्ट नहीं है" : "No produce lots listed yet"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {lang === "hi"
                      ? "ऊपर 'बोलकर फसल लिस्ट करें' बटन दबाकर अपनी ताज़ा उपज जोड़ें और लखनऊ के खरीदारों से सीधे जुड़ें।"
                      : "Tap 'Voice-Assisted Listing' above to list your harvest in seconds with automated pricing guidance."}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setVoiceModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>{lang === "hi" ? "बोलकर फसल लिस्ट करें" : "Start Voice Listing"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lots.map((lot) => (
                    <div
                      key={lot.id}
                      className="editorial-card p-5 flex flex-col justify-between space-y-3 bg-white"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold tracking-tight text-slate-900 capitalize">
                            {lot.commodity}
                          </h4>
                          <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                            Grade {lot.grade}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{lot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                        </p>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase">
                              {lang === "hi" ? "उपलब्ध मात्रा" : "Available"}
                            </span>
                            <span className="text-sm font-bold text-slate-900">{lot.remaining_qty} kg</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase">
                              {lang === "hi" ? "तय भाव" : "Asking Rate"}
                            </span>
                            <span className="text-sm font-bold text-emerald-700">₹{lot.asking_price}/kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="capitalize">{lot.status.replace("_", " ")}</span>
                        </span>
                        <span className="font-normal text-slate-500">{formatDate(lot.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 cols: Live Agmarknet Price Guidance */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-700" />
                  <span>{lang === "hi" ? "सरकारी मंडी लाइव भाव" : "Live Mandi Guidance"}</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
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

        {/* TAB 2: LIST NEW PRODUCE FORM (Sleek Centered Wizard Card) */}
        {activeTab === "list" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form */}
            <div className="lg:col-span-7 editorial-card p-6 sm:p-7 space-y-5 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    {lang === "hi" ? "फसल का विवरण भरें" : "List Produce Batch"}
                  </h3>
                  <p className="text-xs font-normal text-slate-500 mt-0.5">
                    {lang === "hi" ? "हिंदी या अंग्रेजी में बोलें या नीचे फॉर्म भरें।" : "Speak naturally in Hindi or English, or fill manually below."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                >
                  <Mic className="h-3.5 w-3.5 text-emerald-700" />
                  <span>{lang === "hi" ? "बोलकर भरें" : "Voice Auto-Fill"}</span>
                </button>
              </div>

              {publishSuccess ? (
                <div className="rounded-xl bg-emerald-50 p-6 text-center border border-emerald-200 space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-bold text-emerald-900">
                    {lang === "hi" ? "फसल सफलतापूर्वक लिस्ट हो गई!" : "Produce Lot Published!"}
                  </h4>
                  <p className="text-xs font-medium text-slate-700">
                    {availableQty} kg {commodity} {lang === "hi" ? "की लिस्टिंग लखनऊ के खरीदारों को दिखने लगी है।" : "batch is now live for verified buyers."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePublishLot} className="space-y-4">
                  {/* Commodity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                      {lang === "hi" ? "1. फसल चुनें" : "1. Select Produce Commodity"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {COMMODITY_OPTIONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectCommodity(item.id)}
                          className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center gap-2 ${
                            commodity === item.id
                              ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="truncate">{lang === "hi" ? item.hindi : item.label.split(" (")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Grade */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                      {lang === "hi" ? "2. गुणवत्ता ग्रेड चुनें" : "2. Quality Sorting & Grade"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["A", "B", "C"] as Grade[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(g)}
                          className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                            grade === g
                              ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          Grade {g} {g === "A" ? (lang === "hi" ? "(उत्कृष्ट)" : "(Premium)") : g === "B" ? (lang === "hi" ? "(मध्यम)" : "(Standard)") : (lang === "hi" ? "(थोक)" : "(Bulk)")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity & Asking Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {lang === "hi" ? "फसल की कुल मात्रा (किलो में)" : "Batch Quantity (kg)"}
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={50000}
                        value={availableQty}
                        onChange={(e) => setAvailableQty(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {lang === "hi" ? "मांगा गया भाव (₹/किलो)" : "Asking Price (₹/kg)"}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quality Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {lang === "hi" ? "फसल एवं तुड़ाई विवरण" : "Quality Notes & Harvest Details"}
                    </label>
                    <input
                      type="text"
                      value={qualityNotes}
                      onChange={(e) => setQualityNotes(e.target.value)}
                      placeholder="उदा. आज सुबह की ताज़ा तुड़ाई, छंटाई की हुई"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={publishing}
                      className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50 cursor-pointer"
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
            <div className="lg:col-span-5 space-y-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {lang === "hi" ? `खरीदारों के ऑर्डर (${orders.length})` : `Buyer Commitments (${orders.length})`}
                </h3>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {lang === "hi" ? "लाइव ऑर्डर" : "Live Orders"}
                </span>
              </div>

              {orders.length === 0 ? (
                /* Pastel Empty State */
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500 space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-sm text-slate-900">
                    {lang === "hi" ? "अभी कोई नया ऑर्डर नहीं मिला है" : "No buyer orders received yet"}
                  </p>
                  <p className="max-w-xs mx-auto">
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
                    className={`editorial-card cursor-pointer p-4 space-y-2.5 transition bg-white ${
                      selectedOrder?.id === ord.id
                        ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500"
                        : "hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        Order #{ord.id} • {ord.lot_detail?.commodity?.toUpperCase()} (Grade {ord.lot_detail?.grade})
                      </span>
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        {ord.status_display}
                      </span>
                    </div>

                    {/* Buyer Organization Details */}
                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{ord.buyer_org || "Fresh Mart Procurement Kitchen"}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">{ord.buyer_name || "Ankit Sharma"}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{ord.buyer_phone || "+91-9876543210"}</span>
                      </p>
                    </div>

                    {/* Assigned Logistics Fleet & Driver */}
                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{lang === "hi" ? "वाहन एवं ड्राइवर विवरण" : "Assigned Fleet Logistics"}</span>
                      </span>
                      <p className="font-bold text-slate-900">
                        {ord.driver_name || "Suresh Chauhan"} ({ord.driver_phone || "+91-9876543212"})
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {ord.vehicle_info || "Tata Ace Gold (UP 32 TA 4092)"}
                      </p>
                    </div>

                    {/* Order Financials */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">
                          {lang === "hi" ? "मात्रा" : "Quantity"}
                        </span>
                        <span className="font-bold text-sm text-slate-900">{ord.requested_qty} kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">
                          {lang === "hi" ? "कुल भुगतान" : "Net Realization"}
                        </span>
                        <span className="font-bold text-base text-emerald-700">
                          ₹{Math.round(ord.requested_qty * ord.agreed_price * 0.93).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Order Detailed Tracking & Settlement */}
            <div className="lg:col-span-7 space-y-4">
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
                <div className="editorial-card p-12 text-center text-xs font-semibold text-slate-500 bg-white">
                  {lang === "hi" ? "विस्तृत विवरण देखने के लिए बाईं ओर से कोई ऑर्डर चुनें।" : "Select an order on the left to track logistics and payment."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MY FARMS MANAGEMENT */}
        {activeTab === "farms" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 editorial-card p-6 sm:p-7 space-y-4 bg-white">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {lang === "hi" ? "नया खेत / प्लॉट जोड़ें" : "Register Farm Plot"}
                </h3>
                <p className="text-xs font-normal text-slate-500">
                  {lang === "hi" ? "अपने खेत का स्थान दर्ज करें ताकि खरीदार और ड्राइवर आसानी से पहुंच सकें।" : "Add your agricultural land coordinates in Lucknow to enable fast routing."}
                </p>
              </div>

              {farmCreatedMsg && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{farmCreatedMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateFarm} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {lang === "hi" ? "खेत / जमीन का नाम" : "Farm / Land Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="उदा. मलिहाबाद आम का बाग"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* GPS Capture & Village Presets */}
                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{lang === "hi" ? "खेत का जीपीएस लोकेशन" : "Farm GPS Location"}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFarmLocationPicker(true)}
                        className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-slate-50 transition flex items-center gap-1 shadow-xs"
                      >
                        <span>🗺️ {lang === "hi" ? "नक्शे से चुनें" : "Pick on Map"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGetGpsLocation}
                        disabled={capturingGps}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition flex items-center gap-1 shadow-xs"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>{capturingGps ? (lang === "hi" ? "खोज रहे हैं..." : "Acquiring...") : (lang === "hi" ? "📍 लाइव GPS" : "📍 Live GPS")}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
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
                          className={`rounded-md p-1.5 text-xs font-bold border transition text-center truncate ${
                            farmVillage === preset.name
                              ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
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
                    <label className="block font-bold text-slate-800 mb-1">
                      {lang === "hi" ? "गाँव / ब्लॉक" : "Village / Tehsil"}
                    </label>
                    <input
                      type="text"
                      required
                      value={farmVillage}
                      onChange={(e) => setFarmVillage(e.target.value)}
                      placeholder="उदा. बख्शी का तालाब"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {lang === "hi" ? "खेत का क्षेत्रफल (एकड़)" : "Farm Area (Acres)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={farmAcres}
                      onChange={(e) => setFarmAcres(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={creatingFarm}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                  >
                    {creatingFarm ? (lang === "hi" ? "खेत जुड़ रहा है..." : "Saving Farm...") : (lang === "hi" ? "+ खेत सुरक्षित करें" : "+ Save Farm Gate Location")}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Registered Farms */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                {lang === "hi" ? `आपके पंजीकृत खेत (${farms.length})` : `Your Registered Farms (${farms.length})`}
              </h3>

              {farms.length === 0 ? (
                <div className="editorial-card p-8 text-center text-xs font-semibold text-slate-500 bg-white">
                  {lang === "hi" ? "अभी तक कोई खेत पंजीकृत नहीं है। बाईं ओर से अपना पहला खेत जोड़ें।" : "No farms registered yet. Use the form on the left to add your first land plot."}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {farms.map((f: any) => (
                    <div key={f.id} className="editorial-card p-4 space-y-1.5 bg-white">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Sprout className="h-4 w-4 text-emerald-600" />
                          <span>{f.name}</span>
                        </h4>
                        <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                          {f.total_area_acres} {lang === "hi" ? "एकड़" : "Acres"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
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
            <div className="editorial-card p-6 sm:p-7 space-y-5 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
                    {lang === "hi" ? "किसान खाता एवं भुगतान" : "Farmer Settlement Ledger"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-0.5">
                    {formatCurrency(readySettlementVal > 0 ? readySettlementVal : 45000)} {lang === "hi" ? "भुगतान के लिए तैयार" : "ready for payout"}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {lang === "hi" ? "डिलीवरी के 24 घंटे के अंदर सीधे आपके बैंक खाते / UPI में सुरक्षित हस्तांतरण।" : "Direct automated disbursal to Bank Account / UPI within 24 hours of delivery proof."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Statement downloaded (PDF).")}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-xs"
                  >
                    📄 {lang === "hi" ? "खाता विवरण डाउनलोड करें (PDF)" : "Download Statement (PDF)"}
                  </button>
                </div>
              </div>

              {/* Settlement History Cards */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold tracking-tight text-slate-900">
                  {lang === "hi" ? "ऑर्डर भुगतान रसीदें" : "Order Payout Invoices"}
                </h4>

                {orders.length === 0 ? (
                  <p className="text-xs font-medium text-slate-500">
                    {lang === "hi" ? "अभी कोई पूर्ण डिलीवरी नहीं है।" : "No completed deliveries yet."}
                  </p>
                ) : (
                  orders.map((ord) => (
                    <div key={ord.id} className="pt-1">
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
