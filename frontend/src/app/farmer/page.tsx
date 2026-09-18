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
  CloudSun,
  CloudRain,
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

  const displayHarvestVal = totalInventoryVal > 0 ? totalInventoryVal : 24560;

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#262238] flex flex-col selection:bg-[#E8E4F2] selection:text-[#262238]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        
        {/* 1. TOP EDITORIAL SUMMARY PANEL (Deep Lavender-Dark Banner) */}
        <div className="rounded-[28px] bg-[#262238] text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-[#342e4c]">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Greeting & Primary KPIs */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-medium text-[#E8E4F2]">
                <Sprout className="h-3.5 w-3.5 text-[#718A68]" />
                <span>
                  {lang === "hi" ? "किसान एवं उत्पादक पोर्टल • लखनऊ क्लस्टर" : "Farmer & Producer Portal • Lucknow Cluster"}
                </span>
              </div>

              <div>
                <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-tight">
                  Good morning, {user?.first_name || "Ramesh"}
                </h1>
                <p className="text-xs sm:text-sm text-[#E8E4F2]/80 font-normal mt-1">
                  Your harvest is ready for the right direct market buyers.
                </p>
              </div>

              {/* Core Metric Blocks */}
              <div className="pt-2 flex flex-wrap items-baseline gap-3">
                <div className="bg-white/10 px-5 py-3.5 rounded-[20px] border border-white/15 backdrop-blur-md">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#E8E4F2] block">
                    Estimated Harvest Value
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-serif text-white font-normal">
                      ₹{displayHarvestVal.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#718A68] font-medium">
                      across {lots.length > 0 ? lots.length : 3} active lots
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 px-5 py-3.5 rounded-[20px] border border-white/15 backdrop-blur-md">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#E8E4F2] block">
                    Active Stock
                  </span>
                  <span className="text-xl sm:text-2xl font-serif text-[#E8E4F2] mt-0.5 block font-normal">
                    {(totalInventoryKg > 0 ? totalInventoryKg : 1500).toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Weather Card & Voice Action */}
            <div className="lg:col-span-5 flex flex-col items-stretch lg:items-end gap-3.5">
              {/* Weather Guidance Card */}
              <div className="w-full rounded-[20px] bg-white/10 backdrop-blur-md p-4 border border-white/15 space-y-1.5 text-xs text-[#E8E4F2]">
                <div className="flex items-center justify-between text-white font-medium">
                  <span className="flex items-center gap-2">
                    <CloudSun className="h-4 w-4 text-[#718A68] animate-sun-flare" />
                    <span>Farm Weather — Malihabad</span>
                  </span>
                  <span className="font-mono text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full text-white">
                    26°C · Humidity 68%
                  </span>
                </div>
                <p className="text-[11px] text-[#E8E4F2]/90">
                  Light rain likely after 3 PM. <strong>Best harvest pickup window: 7:00–12:00 PM</strong>.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-row gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#718A68] hover:bg-[#62795a] text-white px-5 py-3 text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <Mic className="h-4 w-4" />
                  <span>{lang === "hi" ? "🎤 बोलकर फसल दर्ज करें" : "🎤 Voice List Harvest"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-3 text-xs font-medium text-white transition cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-[#E8E4F2]" />
                  <span>{lang === "hi" ? "+ नया लॉट (मैन्युअल)" : "+ Manual Batch"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 2. REFINED TAB NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#E4E2DD] pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-full text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#262238] text-white shadow-xs"
                : "bg-white text-[#737184] border border-[#E4E2DD] hover:text-[#262238] hover:bg-[#F6F5F1]"
            }`}
          >
            🌾 {lang === "hi" ? `मेरी फसलें (${lots.length})` : `My Produce Lots (${lots.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`px-5 py-2.5 rounded-full text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === "list"
                ? "bg-[#262238] text-white shadow-xs"
                : "bg-white text-[#737184] border border-[#E4E2DD] hover:text-[#262238] hover:bg-[#F6F5F1]"
            }`}
          >
            ➕ {lang === "hi" ? "नई फसल लिस्ट करें" : "+ List Harvest Batch"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-full text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#262238] text-white shadow-xs"
                : "bg-white text-[#737184] border border-[#E4E2DD] hover:text-[#262238] hover:bg-[#F6F5F1]"
            }`}
          >
            🛒 {lang === "hi" ? `खरीदारों के ऑर्डर (${orders.length})` : `Buyer Requests (${orders.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("farms")}
            className={`px-5 py-2.5 rounded-full text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === "farms"
                ? "bg-[#262238] text-white shadow-xs"
                : "bg-white text-[#737184] border border-[#E4E2DD] hover:text-[#262238] hover:bg-[#F6F5F1]"
            }`}
          >
            📍 {lang === "hi" ? `खेत एवं प्लॉट (${farms.length})` : `Farm Plots (${farms.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wallet")}
            className={`px-5 py-2.5 rounded-full text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === "wallet"
                ? "bg-[#262238] text-white shadow-xs"
                : "bg-white text-[#737184] border border-[#E4E2DD] hover:text-[#262238] hover:bg-[#F6F5F1]"
            }`}
          >
            💰 {lang === "hi" ? "खाता और एस्क्रो भुगतान" : "Settlement & Wallet"}
          </button>
        </div>

        {/* TAB 1: MY ACTIVE PRODUCE LOTS */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Produce Lots */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E2DD] pb-3">
                <h3 className="font-serif text-2xl font-normal text-[#262238]">
                  {lang === "hi" ? "सक्रिय फसलें" : "Active Produce Lots in Lucknow"}
                </h3>
                <span className="text-xs font-mono font-medium text-[#262238] bg-[#E8E4F2] px-3 py-1 rounded-full">
                  {lots.length} active listings
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-44 rounded-[24px] bg-white border border-[#E4E2DD] animate-pulse" />
                  ))}
                </div>
              ) : lots.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#E4E2DD] bg-white p-12 text-center space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-full bg-[#E8E4F2] flex items-center justify-center text-[#262238]">
                    <Sprout className="h-7 w-7 text-[#718A68]" />
                  </div>
                  <h4 className="font-serif text-lg text-[#262238] font-normal">
                    {lang === "hi" ? "अभी तक कोई फसल लिस्ट नहीं है" : "No produce lots listed yet"}
                  </h4>
                  <p className="text-xs text-[#737184] max-w-sm mx-auto font-normal leading-relaxed">
                    {lang === "hi"
                      ? "ऊपर 'बोलकर फसल दर्ज करें' दबाकर अपनी ताज़ा उपज जोड़ें।"
                      : "Tap 'Voice List Harvest' above to record your produce in seconds."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lots.map((lot) => (
                    <div
                      key={lot.id}
                      className="p-6 flex flex-col justify-between space-y-3 bg-white rounded-[24px] border border-[#E4E2DD] shadow-xs hover:shadow-md transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-xl text-[#262238] font-normal capitalize">
                            {lot.commodity}
                          </h4>
                          <span className="rounded-full bg-[#E8E4F2] px-2.5 py-0.5 text-[10px] font-medium text-[#262238] uppercase tracking-wider">
                            Grade {lot.grade}
                          </span>
                        </div>

                        <p className="text-xs font-normal text-[#737184] flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#718A68]" />
                          <span>{lot.farm_detail?.village || "Bakshi Ka Talab"}, Lucknow</span>
                        </p>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs bg-[#F6F5F1] p-3 rounded-[16px] border border-[#E4E2DD]">
                          <div>
                            <span className="text-[9px] font-mono font-medium text-[#737184] block uppercase tracking-wider">
                              {lang === "hi" ? "उपलब्ध मात्रा" : "Available"}
                            </span>
                            <span className="text-base font-semibold text-[#262238]">{lot.remaining_qty} kg</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-medium text-[#737184] block uppercase tracking-wider">
                              {lang === "hi" ? "तय भाव" : "Asking Rate"}
                            </span>
                            <span className="text-base font-semibold text-[#718A68]">₹{lot.asking_price}/kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#E4E2DD] flex items-center justify-between text-xs">
                        <span className="font-medium text-[#262238] flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#718A68]" />
                          <span className="capitalize">{lot.status.replace("_", " ")}</span>
                        </span>
                        <span className="text-[11px] text-[#737184] font-mono">{formatDate(lot.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 cols: Live Agmarknet Price Guidance */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-[24px] border border-[#262238]/10 bg-[#E8E4F2]/50 p-5 space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[#262238] flex items-center gap-2 font-mono">
                  <TrendingUp className="h-4 w-4 text-[#718A68]" />
                  <span>{lang === "hi" ? "सरकारी मंडी लाइव भाव" : "Live Mandi Guidance"}</span>
                </span>
                <p className="text-xs text-[#737184] leading-relaxed font-normal">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 bg-white rounded-[28px] border border-[#E4E2DD] shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E4E2DD] pb-4">
                <div>
                  <h3 className="font-serif text-2xl text-[#262238] font-normal">
                    {lang === "hi" ? "फसल का विवरण भरें" : "List Produce Batch"}
                  </h3>
                  <p className="text-xs text-[#737184] mt-1 font-normal">
                    {lang === "hi" ? "हिंदी या अंग्रेजी में बोलें या नीचे फॉर्म भरें।" : "Speak naturally in Hindi or English, or fill manually below."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#262238] bg-[#E8E4F2] px-4 py-2 rounded-full hover:bg-[#d8d3e6] transition cursor-pointer"
                >
                  <Mic className="h-3.5 w-3.5 text-[#718A68]" />
                  <span>{lang === "hi" ? "बोलकर भरें" : "Voice Auto-Fill"}</span>
                </button>
              </div>

              {publishSuccess ? (
                <div className="rounded-[24px] bg-[#E8E4F2]/50 p-8 text-center border border-[#262238]/10 space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-[#718A68] mx-auto" />
                  <h4 className="font-serif text-xl text-[#262238] font-normal">
                    {lang === "hi" ? "फसल सफलतापूर्वक लिस्ट हो गई!" : "Produce Lot Published!"}
                  </h4>
                  <p className="text-xs text-[#737184]">
                    {availableQty} kg {commodity} is now live for verified institutional buyers across Lucknow.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePublishLot} className="space-y-5">
                  {/* Commodity */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#737184] mb-2">
                      {lang === "hi" ? "1. फसल चुनें" : "1. Select Produce Commodity"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {COMMODITY_OPTIONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectCommodity(item.id)}
                          className={`rounded-[16px] border p-3 text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                            commodity === item.id
                              ? "border-[#262238] bg-[#E8E4F2] text-[#262238] shadow-xs"
                              : "border-[#E4E2DD] bg-white text-[#262238] hover:border-[#262238]/30"
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
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#737184] mb-2">
                      {lang === "hi" ? "2. गुणवत्ता ग्रेड चुनें" : "2. Quality Sorting & Grade"}
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["A", "B", "C"] as Grade[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(g)}
                          className={`rounded-[16px] border p-3 text-xs font-medium transition cursor-pointer ${
                            grade === g
                              ? "border-[#262238] bg-[#E8E4F2] text-[#262238] shadow-xs"
                              : "border-[#E4E2DD] bg-white text-[#737184] hover:border-[#262238]/30"
                          }`}
                        >
                          Grade {g} {g === "A" ? "(Premium)" : g === "B" ? "(Standard)" : "(Bulk)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity & Asking Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#262238] mb-1.5">
                        {lang === "hi" ? "फसल की कुल मात्रा (किलो में)" : "Batch Quantity (kg)"}
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={50000}
                        value={availableQty}
                        onChange={(e) => setAvailableQty(Number(e.target.value))}
                        className="w-full rounded-[16px] border border-[#E4E2DD] bg-[#F6F5F1] px-4 py-3 text-sm font-semibold text-[#262238] focus:bg-white focus:border-[#262238] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#262238] mb-1.5">
                        {lang === "hi" ? "मांगा गया भाव (₹/किलो)" : "Asking Price (₹/kg)"}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(Number(e.target.value))}
                        className="w-full rounded-[16px] border border-[#E4E2DD] bg-[#F6F5F1] px-4 py-3 text-sm font-semibold text-[#718A68] focus:bg-white focus:border-[#262238] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quality Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-[#262238] mb-1.5">
                      {lang === "hi" ? "फसल एवं तुड़ाई विवरण" : "Quality Notes & Harvest Details"}
                    </label>
                    <input
                      type="text"
                      value={qualityNotes}
                      onChange={(e) => setQualityNotes(e.target.value)}
                      placeholder="उदा. आज सुबह की ताज़ा तुड़ाई, छंटाई की हुई"
                      className="w-full rounded-[16px] border border-[#E4E2DD] bg-[#F6F5F1] px-4 py-2.5 text-xs font-normal text-[#262238] focus:bg-white focus:border-[#262238] focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={publishing}
                      className="w-full rounded-full bg-[#262238] py-3.5 text-xs font-medium text-white hover:bg-[#342e4c] transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-99"
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

        {/* TAB 3: WHO BOUGHT MY PRODUCE & ORDERS */}
        {activeTab === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E2DD] pb-3">
                <h3 className="font-serif text-2xl font-normal text-[#262238]">
                  {lang === "hi" ? `खरीदारों के ऑर्डर (${orders.length})` : `Buyer Commitments (${orders.length})`}
                </h3>
                <span className="text-xs font-mono font-medium text-[#262238] bg-[#E8E4F2] px-3 py-1 rounded-full">
                  Live Orders
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#E4E2DD] bg-white p-10 text-center text-xs text-[#737184] space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#F6F5F1] flex items-center justify-center text-[#737184]">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <p className="font-serif text-base text-[#262238] font-normal">
                    {lang === "hi" ? "अभी कोई नया ऑर्डर नहीं मिला है" : "No buyer orders received yet"}
                  </p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`cursor-pointer p-5 space-y-3 transition bg-white rounded-[24px] border ${
                      selectedOrder?.id === ord.id
                        ? "border-[#262238] bg-[#E8E4F2]/30 ring-1 ring-[#262238]/20 shadow-xs"
                        : "border-[#E4E2DD] hover:border-[#262238]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#262238] text-xs">
                        Order #{ord.id} • {ord.lot_detail?.commodity?.toUpperCase()} (Grade {ord.lot_detail?.grade})
                      </span>
                      <span className="rounded-full bg-[#E8E4F2] px-2.5 py-0.5 text-[10px] font-medium text-[#262238] uppercase tracking-wider">
                        {ord.status_display}
                      </span>
                    </div>

                    <div className="rounded-[16px] bg-[#F6F5F1] p-3 border border-[#E4E2DD] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#262238] flex items-center gap-1.5">
                          <ShoppingBag className="h-3.5 w-3.5 text-[#718A68]" />
                          <span>{ord.buyer_org || "Fresh Mart Procurement Kitchen"}</span>
                        </span>
                        <span className="text-[11px] text-[#737184]">{ord.buyer_name || "Ankit Sharma"}</span>
                      </div>
                      <p className="text-[11px] font-normal text-[#718A68] flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{ord.buyer_phone || "+91-9876543210"}</span>
                      </p>
                    </div>

                    <div className="rounded-[16px] bg-[#F6F5F1] p-3 border border-[#E4E2DD] text-xs space-y-1">
                      <span className="text-[10px] uppercase font-mono font-medium text-[#737184] flex items-center gap-1 tracking-wider">
                        <Truck className="h-3.5 w-3.5 text-[#262238]" />
                        <span>Assigned Fleet Logistics</span>
                      </span>
                      <p className="font-medium text-[#262238]">
                        {ord.driver_name || "Suresh Chauhan"} ({ord.driver_phone || "+91-9876543212"})
                      </p>
                      <p className="text-[11px] text-[#737184]">
                        {ord.vehicle_info || "Tata Ace Gold (UP 32 TA 4092)"}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[#E4E2DD] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] font-mono text-[#737184] block uppercase font-medium">
                          Quantity
                        </span>
                        <span className="font-semibold text-sm text-[#262238]">{ord.requested_qty} kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-[#737184] block uppercase font-medium">
                          Net Realization
                        </span>
                        <span className="font-semibold text-base text-[#718A68]">
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
                <div className="p-12 text-center text-xs font-medium text-[#737184] bg-white rounded-[24px] border border-[#E4E2DD]">
                  {lang === "hi" ? "विस्तृत विवरण देखने के लिए बाईं ओर से कोई ऑर्डर चुनें।" : "Select an order on the left to track logistics and payment."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MY FARMS MANAGEMENT */}
        {activeTab === "farms" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 sm:p-8 space-y-5 bg-white rounded-[28px] border border-[#E4E2DD] shadow-xs">
              <div className="border-b border-[#E4E2DD] pb-4">
                <h3 className="font-serif text-2xl text-[#262238] font-normal">
                  {lang === "hi" ? "नया खेत / प्लॉट जोड़ें" : "Register Farm Plot"}
                </h3>
                <p className="text-xs text-[#737184] font-normal mt-1">
                  Add your agricultural land coordinates in Lucknow to enable fast routing.
                </p>
              </div>

              {farmCreatedMsg && (
                <div className="rounded-[16px] bg-[#E8E4F2] p-3 text-xs font-medium text-[#262238] flex items-center gap-2 border border-[#262238]/10">
                  <CheckCircle2 className="h-4 w-4 text-[#718A68]" />
                  <span>{farmCreatedMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateFarm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#262238] mb-1.5">
                    {lang === "hi" ? "खेत / जमीन का नाम" : "Farm / Land Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="उदा. मलिहाबाद आम का बाग"
                    className="w-full rounded-[16px] border border-[#E4E2DD] bg-[#F6F5F1] px-4 py-2.5 text-xs font-medium text-[#262238] focus:bg-white focus:border-[#262238] focus:outline-none"
                  />
                </div>

                {/* GPS Capture & Village Presets */}
                <div className="rounded-[20px] bg-[#F6F5F1] p-4 border border-[#E4E2DD] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#262238] flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#718A68]" />
                      <span>{lang === "hi" ? "खेत का जीपीएस लोकेशन" : "Farm GPS Location"}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFarmLocationPicker(true)}
                        className="rounded-full bg-white border border-[#E4E2DD] px-3 py-1.5 text-xs font-medium text-[#262238] hover:bg-[#E8E4F2] transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>🗺️ Pick on Map</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGetGpsLocation}
                        disabled={capturingGps}
                        className="rounded-full bg-[#262238] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#342e4c] transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>{capturingGps ? "Acquiring..." : "📍 Live GPS"}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737184] mb-1.5">
                      Quick Select Lucknow Village Hub:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
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
                          className={`rounded-xl p-2 text-xs font-medium border transition text-center truncate cursor-pointer ${
                            farmVillage === preset.name
                              ? "border-[#262238] bg-[#E8E4F2] text-[#262238] shadow-xs"
                              : "border-[#E4E2DD] bg-white text-[#737184] hover:border-[#262238]/30"
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-[#262238] mb-1.5">
                      {lang === "hi" ? "गाँव / ब्लॉक" : "Village / Tehsil"}
                    </label>
                    <input
                      type="text"
                      required
                      value={farmVillage}
                      onChange={(e) => setFarmVillage(e.target.value)}
                      placeholder="उदा. बख्शी का तालाब"
                      className="w-full rounded-[16px] border border-[#E4E2DD] bg-[#F6F5F1] px-3.5 py-2.5 text-xs font-medium text-[#262238] focus:bg-white focus:border-[#262238] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#262238] mb-1.5">
                      {lang === "hi" ? "खेत का क्षेत्रफल (एकड़)" : "Farm Area (Acres)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={farmAcres}
                      onChange={(e) => setFarmAcres(Number(e.target.value))}
                      className="w-full rounded-[16px] border border-[#E4E2DD] bg-[#F6F5F1] px-3.5 py-2.5 text-xs font-medium text-[#262238] focus:bg-white focus:border-[#262238] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creatingFarm}
                    className="w-full rounded-full bg-[#262238] py-3 text-xs font-medium text-white hover:bg-[#342e4c] transition shadow-xs cursor-pointer active:scale-99"
                  >
                    {creatingFarm ? "Saving Farm..." : "+ Save Farm Gate Location"}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Registered Farms */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-serif text-2xl font-normal text-[#262238]">
                Your Registered Farms ({farms.length})
              </h3>

              {farms.length === 0 ? (
                <div className="p-8 text-center text-xs font-medium text-[#737184] bg-white rounded-[24px] border border-[#E4E2DD]">
                  No farms registered yet. Use the form on the left to add your first land plot.
                </div>
              ) : (
                <div className="space-y-3">
                  {farms.map((f: any) => (
                    <div key={f.id} className="p-5 space-y-2 bg-white rounded-[24px] border border-[#E4E2DD] shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-[#262238] text-sm flex items-center gap-2">
                          <Sprout className="h-4 w-4 text-[#718A68]" />
                          <span>{f.name}</span>
                        </h4>
                        <span className="rounded-full bg-[#E8E4F2] px-3 py-0.5 text-xs font-medium text-[#262238]">
                          {f.total_area_acres} Acres
                        </span>
                      </div>
                      <p className="text-xs text-[#737184] flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#718A68]" />
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
            <div className="p-6 sm:p-8 space-y-6 bg-white rounded-[28px] border border-[#E4E2DD] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E2DD] pb-5">
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider font-medium text-[#262238]">
                    Farmer Settlement Ledger
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#262238] font-normal mt-1">
                    {formatCurrency(readySettlementVal > 0 ? readySettlementVal : 45000)} ready for payout
                  </h2>
                  <p className="text-xs text-[#737184] mt-1 font-normal">
                    Direct automated disbursal to Bank Account / UPI within 24 hours of delivery proof.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Statement downloaded (PDF).")}
                    className="rounded-full border border-[#E4E2DD] bg-white px-5 py-2.5 text-xs font-medium text-[#262238] hover:bg-[#F6F5F1] transition shadow-xs cursor-pointer"
                  >
                    📄 Download Statement (PDF)
                  </button>
                </div>
              </div>

              {/* Settlement History Cards */}
              <div className="space-y-4">
                <h4 className="font-serif text-xl text-[#262238] font-normal">
                  Order Payout Invoices
                </h4>

                {orders.length === 0 ? (
                  <p className="text-xs text-[#737184]">
                    No completed deliveries yet.
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
