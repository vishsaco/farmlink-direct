"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/LanguageContext";
import { api } from "@/lib/api";
import { Commodity, PriceGuidance, RevenueSimulationResult } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Calendar,
  ShieldCheck,
  RotateCw,
  ArrowRight,
  Info,
  DollarSign,
  Truck,
  Scale,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Calculator,
  Sliders,
  ExternalLink,
  Store,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import confetti from "canvas-confetti";

const COMMODITIES: { id: Commodity; label: string; hindi: string; icon: string; defaultQty: number }[] = [
  { id: "tomato", label: "Tomato (Tamatar)", hindi: "टमाटर", icon: "🍅", defaultQty: 2000 },
  { id: "onion", label: "Onion (Pyaaz)", hindi: "प्याज़", icon: "🧅", defaultQty: 3500 },
  { id: "potato", label: "Potato (Aaloo)", hindi: "आलू", icon: "🥔", defaultQty: 5000 },
  { id: "mango", label: "Mango (Dussehri)", hindi: "दशहरी आम", icon: "🥭", defaultQty: 1500 },
  { id: "chilli", label: "Green Chilli (Mirch)", hindi: "हरी मिर्च", icon: "🌶️", defaultQty: 800 },
  { id: "garlic", label: "Garlic (Lahsun)", hindi: "लहसुन", icon: "🧄", defaultQty: 600 },
  { id: "ginger", label: "Ginger (Adrak)", hindi: "अदरक", icon: "🫚", defaultQty: 500 },
  { id: "spinach", label: "Spinach (Palak)", hindi: "पालक", icon: "🥬", defaultQty: 400 },
  { id: "cauliflower", label: "Cauliflower (Gobhi)", hindi: "फूलगोभी", icon: "🥦", defaultQty: 1200 },
  { id: "wheat", label: "Wheat (Gehoon)", hindi: "गेहूं", icon: "🌾", defaultQty: 8000 },
];

export default function MarketPredictorPage() {
  const { lang, t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<Commodity>("tomato");
  const [perspective, setPerspective] = useState<"farmer" | "buyer">("farmer");
  const [guidance, setGuidance] = useState<PriceGuidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecastHorizon, setForecastHorizon] = useState<"7day" | "14day">("7day");
  const [syncing, setSyncing] = useState(false);

  // Revenue Simulator States
  const [batchQty, setBatchQty] = useState<number>(2000);
  const [storageType, setStorageType] = useState<"ambient" | "cold">("ambient");
  const [simResult, setSimResult] = useState<RevenueSimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Fetch Forecast Guidance
  const loadForecast = async (crop: Commodity) => {
    setLoading(true);
    try {
      const data = await api.getForecast(crop, "Lucknow");
      setGuidance(data);
      runSimulation(crop, batchQty, storageType);
    } catch (err) {
      console.error("Forecast fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // Run Revenue & Spoilage Simulator
  const runSimulation = async (crop: Commodity, qty: number, storage: "ambient" | "cold") => {
    setSimLoading(true);
    try {
      const res = await api.simulateRevenue(crop, qty, storage);
      setSimResult(res);
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    loadForecast(selectedCrop);
  }, [selectedCrop]);

  const handleCropChange = (c: Commodity) => {
    setSelectedCrop(c);
    const found = COMMODITIES.find((item) => item.id === c);
    if (found) {
      setBatchQty(found.defaultQty);
    }
  };

  const handleSyncAgmarknet = async () => {
    setSyncing(true);
    try {
      await api.syncMandi(selectedCrop);
      await loadForecast(selectedCrop);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (err) {
      console.warn("Sync error", err);
    } finally {
      setSyncing(false);
    }
  };

  const activeChartData =
    forecastHorizon === "14day" && guidance?.fourteen_day && guidance.fourteen_day.length > 0
      ? guidance.fourteen_day
      : guidance?.seven_day || [];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#17201D]">
      <Navbar />

      {/* HERO BANNER */}
      <section className="border-b border-[#E9E7E1] bg-gradient-to-b from-[#DCE8DD]/50 via-[#FAF9F5] to-[#FAF9F5] pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#173D32]/20 bg-[#DCE8DD] px-3.5 py-1 text-xs font-bold text-[#173D32]">
                <Sparkles className="h-3.5 w-3.5 text-[#C99B43]" />
                <span>AI Produce Predictive Intelligence • Lucknow Regional Cluster</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17201D]">
                {lang === "hi" ? "कृषि उपज बाज़ार पूर्वानुमान एवं कार्य योजना" : "Produce Market Predictor & Action Advisory"}
              </h1>
              <p className="text-sm text-[#7D8A65] max-w-2xl">
                {lang === "hi"
                  ? "ऐतिहासिक एवं लाइव लखनऊ मंडी डेटा को उपयोगी पूर्वानुमान में बदलें — फसल बेचने का सही समय और अधिकतम लाभ जानें।"
                  : "Turn historical and real-time Agmarknet mandi data into actionable revenue-maximizing decisions for farmers and cost-minimizing timing for buyers."}
              </p>
            </div>

            {/* Persona Switcher & Live Sync Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-full border border-[#E9E7E1] bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setPerspective("farmer")}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    perspective === "farmer"
                      ? "bg-[#173D32] text-white shadow-xs"
                      : "text-[#7D8A65] hover:text-[#17201D]"
                  }`}
                >
                  🌾 Farmer / FPO View
                </button>
                <button
                  type="button"
                  onClick={() => setPerspective("buyer")}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    perspective === "buyer"
                      ? "bg-[#173D32] text-white shadow-xs"
                      : "text-[#7D8A65] hover:text-[#17201D]"
                  }`}
                >
                  🛒 Buyer View
                </button>
              </div>

              <button
                type="button"
                onClick={handleSyncAgmarknet}
                disabled={syncing}
                className="flex items-center gap-1.5 rounded-full border border-[#173D32] bg-white px-4 py-2 text-xs font-bold text-[#173D32] hover:bg-[#DCE8DD]/40 transition shadow-xs disabled:opacity-50"
              >
                <RotateCw className={`h-3.5 w-3.5 text-[#C99B43] ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? "Syncing Mandi..." : "Sync Agmarknet"}</span>
              </button>
            </div>
          </div>

          {/* CROP SELECTOR RIBBON */}
          <div className="mt-8 flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {COMMODITIES.map((c) => {
              const isSelected = selectedCrop === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCropChange(c.id)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition shrink-0 border ${
                    isSelected
                      ? "border-[#173D32] bg-[#173D32] text-white shadow-md scale-102"
                      : "border-[#E9E7E1] bg-white text-[#17201D] hover:border-[#173D32]/40"
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span>{lang === "hi" ? c.hindi : c.label.split(" (")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN ADVISORY CONTENT */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="rounded-3xl border border-[#E9E7E1] bg-white p-12 text-center space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-[#173D32] border-t-transparent" />
            <p className="text-xs font-bold text-[#7D8A65]">Computing AI Price Predictions & Agmarknet Baseline...</p>
          </div>
        ) : guidance ? (
          <>
            {/* 1. PRIMARY ACTIONABLE DECISION CARD */}
            <div className="rounded-3xl border border-[#173D32]/30 bg-white p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#DCE8DD]/40 blur-2xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-[#E9E7E1] pb-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-[#173D32] px-3.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                      {perspective === "farmer"
                        ? guidance.action_recommendation?.seller_badge || "🟢 HOLD (Recommended)"
                        : guidance.action_recommendation?.buyer_badge || "🛒 BUY TODAY"}
                    </span>
                    <span className="text-xs font-semibold text-[#7D8A65]">
                      Cluster: {guidance.market_cluster} • Confidence:{" "}
                      <strong className="text-[#17201D] capitalize">{guidance.today.confidence}</strong>
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#17201D] capitalize">
                    {perspective === "farmer"
                      ? `${selectedCrop} Timing Advisory: Maximize Harvest Profit`
                      : `${selectedCrop} Procurement Advisory: Cost Minimizer`}
                  </h2>
                  <p className="text-sm font-medium text-[#17201D] max-w-3xl leading-relaxed">
                    {perspective === "farmer"
                      ? guidance.action_recommendation?.seller_advice || guidance.explanation
                      : guidance.action_recommendation?.buyer_advice || guidance.explanation}
                  </p>
                </div>

                {/* Key Numbers Highlight */}
                <div className="flex items-center gap-4 bg-[#F7F5EF] p-4 rounded-2xl border border-[#E9E7E1] shrink-0">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#7D8A65] block">Today's Benchmark</span>
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#17201D]">
                      {formatCurrency(guidance.today.base)}
                      <span className="text-xs font-sans font-normal text-[#7D8A65]">/kg</span>
                    </span>
                  </div>

                  <div className="h-10 w-[1px] bg-[#E9E7E1]" />

                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#173D32] block">
                      {perspective === "farmer" ? "Projected Peak" : "7-Day Range"}
                    </span>
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
                      {formatCurrency(guidance.action_recommendation?.optimal_price || guidance.today.high)}
                      <span className="text-xs font-sans font-normal text-[#7D8A65]">/kg</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Actionable Metric Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-[#E9E7E1] bg-[#FAF9F5] p-4 space-y-1">
                  <span className="text-[11px] font-bold text-[#7D8A65] flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#C99B43]" />
                    <span>Optimal Action Window</span>
                  </span>
                  <p className="font-bold text-sm text-[#17201D]">
                    {guidance.action_recommendation?.optimal_harvest_date || guidance.today.date}
                  </p>
                  <p className="text-[10px] text-[#7D8A65]">Projected market price peak</p>
                </div>

                <div className="rounded-2xl border border-[#E9E7E1] bg-[#FAF9F5] p-4 space-y-1">
                  <span className="text-[11px] font-bold text-[#7D8A65] flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-[#173D32]" />
                    <span>Expected Gain</span>
                  </span>
                  <p className="font-bold text-sm text-[#173D32]">
                    +{guidance.action_recommendation?.expected_gain_pct || 12.5}% (+₹
                    {guidance.action_recommendation?.expected_gain_rupees_per_kg || 4.2}/kg)
                  </p>
                  <p className="text-[10px] text-[#7D8A65]">vs traditional distress liquidation</p>
                </div>

                <div className="rounded-2xl border border-[#E9E7E1] bg-[#FAF9F5] p-4 space-y-1">
                  <span className="text-[11px] font-bold text-[#7D8A65] flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#C99B43]" />
                    <span>Spoilage Risk</span>
                  </span>
                  <p className="font-bold text-sm text-[#17201D] capitalize">
                    {guidance.market_drivers?.spoilage_risk_gauge || "Low"} Risk
                  </p>
                  <p className="text-[10px] text-[#7D8A65]">
                    Ambient: {guidance.market_drivers?.shelf_life_ambient_days || 5} days • Cold:{" "}
                    {guidance.market_drivers?.shelf_life_cold_days || 21} days
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E9E7E1] bg-[#FAF9F5] p-4 space-y-1">
                  <span className="text-[11px] font-bold text-[#7D8A65] flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-[#173D32]" />
                    <span>Farmer Margin Gain</span>
                  </span>
                  <p className="font-bold text-sm text-[#173D32]">
                    +₹{guidance.price_breakdown?.farmer_extra_margin_per_kg || 6.5}/kg
                  </p>
                  <p className="text-[10px] text-[#7D8A65]">Zero middlemen APMC commission</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E9E7E1]">
                <div className="text-xs text-[#7D8A65] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#173D32]" />
                  <span>
                    Agmarknet Source: <strong>{guidance.source_meta?.source || "Lucknow APMC Benchmark"}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {perspective === "farmer" ? (
                    <Link
                      href="/farmer"
                      className="flex items-center gap-2 rounded-full bg-[#173D32] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#215445] transition shadow-md"
                    >
                      <span>🌾 List Lot at ₹{guidance.action_recommendation?.optimal_price || guidance.today.base}/kg</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/buyer"
                      className="flex items-center gap-2 rounded-full bg-[#173D32] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#215445] transition shadow-md"
                    >
                      <span>🛒 Source {selectedCrop} on Marketplace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* 2. REVENUE & SPOILAGE HARVEST SIMULATOR */}
            <div className="rounded-3xl border border-[#E9E7E1] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E9E7E1] pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173D32]">
                    <Calculator className="h-4 w-4 text-[#C99B43]" />
                    <span>PRODUCE REVENUE & STORAGE SIMULATOR</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                    Simulate Your Net Harvest Payout ({selectedCrop.toUpperCase()})
                  </h3>
                  <p className="text-xs text-[#7D8A65]">
                    Enter your batch volume and storage conditions to calculate date-by-date revenue, spoilage risk, and optimal harvest day.
                  </p>
                </div>

                {/* Storage Toggle */}
                <div className="flex rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStorageType("ambient");
                      runSimulation(selectedCrop, batchQty, "ambient");
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      storageType === "ambient" ? "bg-white text-[#173D32] shadow-xs" : "text-[#7D8A65]"
                    }`}
                  >
                    Farm Shed (Ambient)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStorageType("cold");
                      runSimulation(selectedCrop, batchQty, "cold");
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      storageType === "cold" ? "bg-white text-[#173D32] shadow-xs" : "text-[#7D8A65]"
                    }`}
                  >
                    Cold Storage / Solar
                  </button>
                </div>
              </div>

              {/* Slider & Quantity Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="text-[#17201D]">Batch Quantity: <strong className="text-sm font-bold text-[#173D32]">{batchQty.toLocaleString()} kg</strong> ({ (batchQty / 100).toFixed(1) } Quintals)</label>
                    <span className="text-[#7D8A65]">Quick Presets:</span>
                  </div>

                  <input
                    type="range"
                    min={100}
                    max={20000}
                    step={100}
                    value={batchQty}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBatchQty(val);
                      runSimulation(selectedCrop, val, storageType);
                    }}
                    className="w-full h-2 bg-[#E9E7E1] rounded-lg appearance-none cursor-pointer accent-[#173D32]"
                  />

                  <div className="flex gap-2 pt-1">
                    {[500, 1500, 3000, 5000, 10000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setBatchQty(preset);
                          runSimulation(selectedCrop, preset, storageType);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                          batchQty === preset
                            ? "border-[#173D32] bg-[#173D32] text-white"
                            : "border-[#E9E7E1] bg-[#F7F5EF] text-[#7D8A65] hover:bg-white"
                        }`}
                      >
                        {preset >= 1000 ? `${preset / 1000}T` : `${preset}kg`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulation Result Box */}
                {simResult && (
                  <div className="rounded-2xl border border-[#173D32]/20 bg-[#DCE8DD]/40 p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#173D32] tracking-wider block">
                      Projected Gain on {batchQty} kg
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#7D8A65]">Sell Today:</span>
                      <span className="font-bold text-sm text-[#17201D]">
                        {formatCurrency(simResult.today_revenue)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#173D32] font-semibold">Sell on Optimal Day:</span>
                      <span className="font-serif text-xl font-bold text-[#173D32]">
                        {formatCurrency(simResult.best_day_revenue)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#173D32]/20 flex items-center justify-between text-xs font-bold text-[#173D32]">
                      <span>📈 Extra Net Profit:</span>
                      <span className="bg-[#173D32] text-white px-2 py-0.5 rounded-md">
                        +{formatCurrency(simResult.extra_profit_rupees)} ({simResult.extra_profit_pct}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. PREDICTIVE CHARTS & MANDI ARBITRAGE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 7/14 Day Price Trend Chart */}
              <div className="lg:col-span-7 rounded-3xl border border-[#E9E7E1] bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-[#7D8A65] tracking-wider">
                      Price Trajectory Curve
                    </span>
                    <h4 className="font-serif text-xl font-bold text-[#17201D]">
                      {forecastHorizon === "7day" ? "7-Day Price Forecast" : "14-Day Price Forecast"} (₹/kg)
                    </h4>
                  </div>

                  <div className="flex rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] p-1">
                    <button
                      type="button"
                      onClick={() => setForecastHorizon("7day")}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                        forecastHorizon === "7day" ? "bg-white text-[#173D32] shadow-xs" : "text-[#7D8A65]"
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setForecastHorizon("14day")}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                        forecastHorizon === "14day" ? "bg-white text-[#173D32] shadow-xs" : "text-[#7D8A65]"
                      }`}
                    >
                      14 Days
                    </button>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#173D32" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#173D32" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="highLowGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C99B43" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#C99B43" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EFEA" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => {
                          const d = new Date(val);
                          return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
                        }}
                        tick={{ fontSize: 11, fill: "#7D8A65" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={(val) => `₹${val}`}
                        tick={{ fontSize: 11, fill: "#7D8A65" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-[#E9E7E1] bg-white p-3 shadow-xl space-y-1 text-xs">
                                <p className="font-bold text-[#17201D]">
                                  {label
                                    ? new Date(label).toLocaleDateString(undefined, {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "Forecast Date"}
                                </p>
                                <p className="text-[#173D32] font-bold text-sm">
                                  Base Price: ₹{data.base}/kg
                                </p>
                                <p className="text-[#7D8A65]">
                                  Range: ₹{data.low} - ₹{data.high}/kg
                                </p>
                                <span className="inline-block rounded bg-[#DCE8DD] px-1.5 py-0.5 text-[10px] font-bold text-[#173D32] uppercase">
                                  {data.confidence} confidence
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="high"
                        stroke="#C99B43"
                        strokeDasharray="3 3"
                        fillOpacity={1}
                        fill="url(#highLowGrad)"
                        name="Upper Bound"
                      />
                      <Area
                        type="monotone"
                        dataKey="base"
                        stroke="#173D32"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#priceGrad)"
                        name="Expected Modal Price"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right: Lucknow 5-Mandi Price Arbitrage */}
              <div className="lg:col-span-5 rounded-3xl border border-[#E9E7E1] bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-[#7D8A65] tracking-wider">
                    Cross-Mandi Arbitrage
                  </span>
                  <h4 className="font-serif text-xl font-bold text-[#17201D]">
                    Lucknow Mandi Rate Comparison
                  </h4>
                  <p className="text-xs text-[#7D8A65]">
                    Real-time modal price variations across Lucknow sub-mandis vs FarmLink Direct.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {guidance.mandi_comparison?.map((mandi, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                        mandi.market_name.includes("FarmLink")
                          ? "border-[#173D32] bg-[#DCE8DD]/40 font-bold"
                          : "border-[#E9E7E1] bg-[#FAF9F5]"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-[#17201D]">{mandi.market_name}</p>
                        <p className="text-[10px] text-[#7D8A65]">
                          {mandi.role} • {mandi.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-base font-bold text-[#173D32]">
                          ₹{mandi.price_per_kg}/kg
                        </span>
                        <span className="text-[10px] text-[#7D8A65] block">
                          {mandi.distance_km > 0 ? `${mandi.distance_km} km` : "Direct Escrow"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. MARKET DRIVERS & INTEGRITY */}
            <div className="rounded-3xl border border-[#E9E7E1] bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#173D32] tracking-wider">
                  Forecast Drivers & Market Fundamentals
                </span>
                <h4 className="font-serif text-xl font-bold text-[#17201D]">
                  Why is the price moving? (Lucknow Cluster Analysis)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="rounded-2xl border border-[#E9E7E1] bg-[#FAF9F5] p-4 space-y-2">
                  <span className="text-xs font-bold text-[#17201D] flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-[#C99B43]" />
                    <span>Mandi Arrival Supply Trends</span>
                  </span>
                  <p className="text-xs text-[#7D8A65]">
                    {guidance.market_drivers?.arrival_volume_trend}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E9E7E1] bg-[#FAF9F5] p-4 space-y-2">
                  <span className="text-xs font-bold text-[#17201D] flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-[#173D32]" />
                    <span>Weather & Agro-Climatic Factors</span>
                  </span>
                  <p className="text-xs text-[#7D8A65]">
                    {guidance.market_drivers?.weather_impact}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E9E7E1] bg-[#FAF9F5] p-4 space-y-2">
                  <span className="text-xs font-bold text-[#17201D] flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-[#C99B43]" />
                    <span>Demand Surge & Festival Pressure</span>
                  </span>
                  <p className="text-xs text-[#7D8A65]">
                    {guidance.market_drivers?.demand_index}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-[#E9E7E1] bg-white p-12 text-center text-xs text-[#7D8A65]">
            No forecast data available for {selectedCrop}.
          </div>
        )}
      </main>
    </div>
  );
}
