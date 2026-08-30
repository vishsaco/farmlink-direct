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
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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

  const selectedCropObj = COMMODITIES.find((c) => c.id === selectedCrop) || COMMODITIES[0];
  const cropDisplayName = lang === "hi" ? selectedCropObj.hindi : selectedCropObj.label.split(" (")[0];

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

  // Helper for Natural Hindi Recommendations
  const getHindiRecommendation = (rec: any) => {
    if (!rec) return { badge: "🟢 सही समय पर बेचें", advice: "बाज़ार का भाव अच्छा है।" };
    if (rec.seller_action === "hold") {
      return {
        badge: `🟢 ${rec.optimal_harvest_date ? "कुछ दिन रुकें (ज़्यादा मुनाफ़ा)" : "रुक कर बेचें"}`,
        advice: `फसल को ${rec.optimal_harvest_date || "आने वाले दिनों"} तक रोक कर बेचें। अनुमानित भाव ₹${rec.optimal_price}/किलो तक जा सकता है जिससे आपको प्रति किलो +₹${rec.expected_gain_rupees_per_kg} (+${rec.expected_gain_pct}%) का अधिक मुनाफ़ा होगा।`,
      };
    }
    if (rec.seller_action === "sell_now") {
      return {
        badge: "⚡ आज ही फसल बेचें (दाम गिरने से पहले)",
        advice: `मंडियों में आवक बहुत बढ़ रही है जिससे भाव गिरने का अनुमान है। आज ही ₹${guidance?.today.base}/किलो के अच्छे भाव पर अपनी फसल बेचकर पक्की कमाई करें।`,
      };
    }
    return {
      badge: "🟡 आधी फसल आज बेचें, आधी रोकें",
      advice: `बाज़ार में भाव स्थिर चल रहे हैं। जोखिम कम करने के लिए आधी फसल आज बेचें और बची हुई आधी आने वाले दिनों की मांग के लिए रखें।`,
    };
  };

  const getHindiBuyerRecommendation = (rec: any) => {
    if (!rec) return { badge: "🛒 आज ही खरीदें", advice: "भाव अनुकूल है।" };
    if (guidance?.trend === "rising") {
      return {
        badge: "🛒 आज ही खरीदें (सस्ता पड़ेगा)",
        advice: `अगले कुछ दिनों में भाव बढ़ने की संभावना है। कीमतों में तेज़ी आने से पहले आज ही ₹${guidance?.today.base}/किलो पर माल बुक करें।`,
      };
    }
    return {
      badge: "⏳ 2-3 दिन इंतज़ार करें",
      advice: `मंडियों में नई सप्लाई आ रही है। 2-3 दिन रुकने पर भाव में थोड़ी गिरावट आ सकती है।`,
    };
  };

  const hindiSeller = getHindiRecommendation(guidance?.action_recommendation);
  const hindiBuyer = getHindiBuyerRecommendation(guidance?.action_recommendation);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      {/* TOP HEADER SECTION */}
      <section className="border-b border-slate-200 bg-white pt-8 pb-7 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  {lang === "hi"
                    ? "एआई फसल भाव पूर्वानुमान • पूरा लखनऊ कृषि क्षेत्र"
                    : "AI Produce Predictive Intelligence • Lucknow Regional Cluster"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                {lang === "hi" ? "कृषि उपज बाज़ार और भाव का सही अनुमान" : "Produce Market Predictor & Action Advisory"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal">
                {lang === "hi"
                  ? "लखनऊ मंडी के ताज़ा और पिछले भाव देखकर जानें कि फसल कब बेचना सबसे फायदेमंद रहेगा और कितना ज़्यादा मुनाफ़ा मिलेगा।"
                  : "Turn historical and real-time Agmarknet mandi data into actionable revenue-maximizing decisions for farmers and cost-minimizing timing for buyers."}
              </p>
            </div>

            {/* Persona Switcher & Live Sync Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setPerspective("farmer")}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                    perspective === "farmer"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {lang === "hi" ? "🌾 किसान भाई (ज़्यादा कमाई)" : "🌾 Farmer / FPO View"}
                </button>
                <button
                  type="button"
                  onClick={() => setPerspective("buyer")}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                    perspective === "buyer"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {lang === "hi" ? "🛒 खरीदार (कम लागत)" : "🛒 Buyer View"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSyncAgmarknet}
                disabled={syncing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
              >
                <RotateCw className={`h-3.5 w-3.5 text-emerald-600 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? (lang === "hi" ? "अपडेट हो रहा है..." : "Syncing...") : (lang === "hi" ? "मंडी भाव ताज़ा करें" : "Sync Agmarknet")}</span>
              </button>
            </div>
          </div>

          {/* CROP SELECTOR RIBBON */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {COMMODITIES.map((c) => {
              const isSelected = selectedCrop === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCropChange(c.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 border ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
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
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
        {loading ? (
          <div className="editorial-card p-12 text-center space-y-3 bg-white">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-600">
              {lang === "hi" ? "मंडी भाव और सटीक अनुमान लोड हो रहा है..." : "Computing AI Price Predictions & Agmarknet Baseline..."}
            </p>
          </div>
        ) : guidance ? (
          <>
            {/* 1. PRIMARY ACTIONABLE DECISION CARD */}
            <div className="editorial-card p-6 sm:p-7 space-y-6 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-slate-100 pb-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                      {lang === "hi"
                        ? perspective === "farmer"
                          ? hindiSeller.badge
                          : hindiBuyer.badge
                        : perspective === "farmer"
                        ? guidance.action_recommendation?.seller_badge || "🟢 HOLD (Recommended)"
                        : guidance.action_recommendation?.buyer_badge || "🛒 BUY TODAY"}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {lang === "hi" ? "मंडी क्षेत्र:" : "Cluster:"} {guidance.market_cluster} • {lang === "hi" ? "अनुमान शुद्धता:" : "Confidence:"}{" "}
                      <strong className="text-slate-800 capitalize">
                        {guidance.today.confidence === "high" ? (lang === "hi" ? "उच्च (विश्वसनीय)" : "High") : guidance.today.confidence}
                      </strong>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 capitalize">
                    {lang === "hi"
                      ? perspective === "farmer"
                        ? `${cropDisplayName}: फसल बेचने की सही सलाह और अधिकतम मुनाफ़ा`
                        : `${cropDisplayName}: फसल खरीदारी की सलाह और बचत`
                      : perspective === "farmer"
                      ? `${selectedCrop} Timing Advisory: Maximize Harvest Profit`
                      : `${selectedCrop} Procurement Advisory: Cost Minimizer`}
                  </h2>
                  <p className="text-sm font-normal text-slate-700 max-w-3xl leading-relaxed">
                    {lang === "hi"
                      ? perspective === "farmer"
                        ? hindiSeller.advice
                        : hindiBuyer.advice
                      : perspective === "farmer"
                      ? guidance.action_recommendation?.seller_advice || guidance.explanation
                      : guidance.action_recommendation?.buyer_advice || guidance.explanation}
                  </p>
                </div>

                {/* Key Numbers Highlight */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      {lang === "hi" ? "आज का मंडी भाव" : "Today's Benchmark"}
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      {formatCurrency(guidance.today.base)}
                      <span className="text-xs font-normal text-slate-500">{lang === "hi" ? "/किलो" : "/kg"}</span>
                    </span>
                  </div>

                  <div className="h-9 w-[1px] bg-slate-200" />

                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                      {lang === "hi" ? "अधिकतम अनुमानित भाव" : perspective === "farmer" ? "Projected Peak" : "7-Day Range"}
                    </span>
                    <span className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(guidance.action_recommendation?.optimal_price || guidance.today.high)}
                      <span className="text-xs font-normal text-slate-500">{lang === "hi" ? "/किलो" : "/kg"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Actionable Metric Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{lang === "hi" ? "बेचने का सबसे अच्छा दिन" : "Optimal Action Window"}</span>
                  </span>
                  <p className="font-bold text-sm text-slate-900">
                    {guidance.action_recommendation?.optimal_harvest_date || guidance.today.date}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {lang === "hi" ? "इस दिन सबसे ऊंचा भाव मिलने की उम्मीद" : "Projected market price peak"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{lang === "hi" ? "अतिरिक्त मुनाफ़ा" : "Expected Gain"}</span>
                  </span>
                  <p className="font-bold text-sm text-emerald-700">
                    +{guidance.action_recommendation?.expected_gain_pct || 12.5}% (+₹
                    {guidance.action_recommendation?.expected_gain_rupees_per_kg || 4.2}/{lang === "hi" ? "किलो" : "kg"})
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {lang === "hi" ? "जल्दबाजी में बेचने की तुलना में" : "vs traditional distress liquidation"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{lang === "hi" ? "खराब होने का खतरा" : "Spoilage Risk"}</span>
                  </span>
                  <p className="font-bold text-sm text-slate-900 capitalize">
                    {lang === "hi" ? "कम जोखिम (सुरक्षित)" : `${guidance.market_drivers?.spoilage_risk_gauge || "Low"} Risk`}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {lang === "hi"
                      ? `साधारण शेड: ${guidance.market_drivers?.shelf_life_ambient_days || 5} दिन • कोल्ड: ${guidance.market_drivers?.shelf_life_cold_days || 21} दिन`
                      : `Ambient: ${guidance.market_drivers?.shelf_life_ambient_days || 5}d • Cold: ${guidance.market_drivers?.shelf_life_cold_days || 21}d`}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{lang === "hi" ? "सीधी बिक्री से बचत" : "Farmer Margin Gain"}</span>
                  </span>
                  <p className="font-bold text-sm text-emerald-700">
                    +₹{guidance.price_breakdown?.farmer_extra_margin_per_kg || 6.5}/{lang === "hi" ? "किलो" : "kg"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {lang === "hi" ? "बिचौलियों की 0% दलाली" : "Zero middlemen commission"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>
                    {lang === "hi" ? "सरकारी मंडी डेटा सोर्स:" : "Agmarknet Source:"}{" "}
                    <strong className="text-slate-700">{guidance.source_meta?.source || "Lucknow APMC Benchmark"}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {perspective === "farmer" ? (
                    <Link
                      href="/farmer"
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                      <span>
                        {lang === "hi"
                          ? `🌾 ₹${guidance.action_recommendation?.optimal_price || guidance.today.base}/किलो पर फसल लिस्ट करें`
                          : `🌾 List Lot at ₹${guidance.action_recommendation?.optimal_price || guidance.today.base}/kg`}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/buyer"
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                      <span>
                        {lang === "hi"
                          ? `🛒 ${cropDisplayName} की खरीदारी करें`
                          : `🛒 Source ${selectedCrop} on Marketplace`}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* 2. REVENUE & SPOILAGE HARVEST SIMULATOR */}
            <div className="editorial-card p-6 sm:p-7 space-y-5 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <Calculator className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{lang === "hi" ? "उपज कमाई और मुनाफ़ा कैलकुलेटर" : "PRODUCE REVENUE & STORAGE SIMULATOR"}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    {lang === "hi"
                      ? `अपनी ${cropDisplayName} की कुल कमाई का हिसाब लगाएं`
                      : `Simulate Your Net Harvest Payout (${selectedCrop.toUpperCase()})`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === "hi"
                      ? "अपनी फसल का वज़न (किलो) और रखने का तरीका चुनें, और देखें कि सही दिन बेचने पर कितने रुपयों का अतिरिक्त फ़ायदा होगा।"
                      : "Enter your batch volume and storage conditions to calculate date-by-date revenue, spoilage risk, and optimal harvest day."}
                  </p>
                </div>

                {/* Storage Toggle */}
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStorageType("ambient");
                      runSimulation(selectedCrop, batchQty, "ambient");
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                      storageType === "ambient" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    {lang === "hi" ? "साधारण गोदाम" : "Ambient Storage"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStorageType("cold");
                      runSimulation(selectedCrop, batchQty, "cold");
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                      storageType === "cold" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    {lang === "hi" ? "कोल्ड स्टोरेज" : "Cold Storage"}
                  </button>
                </div>
              </div>

              {/* Slider & Quantity Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="text-slate-800">
                      {lang === "hi" ? "फसल की मात्रा:" : "Batch Quantity:"}{" "}
                      <strong className="text-sm font-bold text-emerald-700">
                        {batchQty.toLocaleString()} {lang === "hi" ? "किलो" : "kg"}
                      </strong>{" "}
                      ({(batchQty / 100).toFixed(1)} {lang === "hi" ? "क्विंटल" : "Quintals"})
                    </label>
                    <span className="text-slate-500">{lang === "hi" ? "शॉर्टकट:" : "Presets:"}</span>
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
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
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold border transition ${
                          batchQty === preset
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-bold"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                        }`}
                      >
                        {preset >= 1000 ? `${preset / 1000}${lang === "hi" ? " टन" : "T"}` : `${preset}${lang === "hi" ? " किलो" : "kg"}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulation Result Box */}
                {simResult && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                      {lang === "hi"
                        ? `कुल ${batchQty.toLocaleString()} किलो पर अनुमानित कमाई`
                        : `Projected Gain on ${batchQty} kg`}
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-600">{lang === "hi" ? "आज बेचने पर रकम:" : "Sell Today:"}</span>
                      <span className="font-bold text-sm text-slate-900">
                        {formatCurrency(simResult.today_revenue)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-emerald-800 font-semibold">
                        {lang === "hi" ? "सही दिन बेचने पर रकम:" : "Optimal Day Revenue:"}
                      </span>
                      <span className="text-lg font-bold text-emerald-800">
                        {formatCurrency(simResult.best_day_revenue)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs font-bold text-emerald-800">
                      <span>{lang === "hi" ? "📈 कुल अतिरिक्त मुनाफ़ा:" : "📈 Extra Net Profit:"}</span>
                      <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-md font-mono">
                        +{formatCurrency(simResult.extra_profit_rupees)} ({simResult.extra_profit_pct}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. PREDICTIVE CHARTS & MANDI ARBITRAGE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7/14 Day Price Trend Chart */}
              <div className="lg:col-span-7 editorial-card p-6 sm:p-7 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      {lang === "hi" ? "भाव का ग्राफ" : "Price Trajectory Curve"}
                    </span>
                    <h4 className="text-lg font-bold tracking-tight text-slate-900">
                      {lang === "hi"
                        ? forecastHorizon === "7day"
                          ? `अगले 7 दिनों के अनुमानित भाव (₹/किलो)`
                          : `अगले 14 दिनों के अनुमानित भाव (₹/किलो)`
                        : forecastHorizon === "7day"
                        ? "7-Day Price Forecast (₹/kg)"
                        : "14-Day Price Forecast (₹/kg)"}
                    </h4>
                  </div>

                  <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setForecastHorizon("7day")}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                        forecastHorizon === "7day" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      {lang === "hi" ? "7 दिन" : "7 Days"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForecastHorizon("14day")}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                        forecastHorizon === "14day" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      {lang === "hi" ? "14 दिन" : "14 Days"}
                    </button>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => {
                          const d = new Date(val);
                          return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "short", day: "numeric" });
                        }}
                        tick={{ fontSize: 11, fill: "#64748B" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={(val) => `₹${val}`}
                        tick={{ fontSize: 11, fill: "#64748B" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md space-y-1 text-xs">
                                <p className="font-bold text-slate-900">
                                  {label
                                    ? new Date(label).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "Forecast Date"}
                                </p>
                                <p className="text-emerald-700 font-bold text-sm">
                                  {lang === "hi" ? "अनुमानित भाव:" : "Base Price:"} ₹{data.base}/{lang === "hi" ? "किलो" : "kg"}
                                </p>
                                <p className="text-slate-500">
                                  {lang === "hi" ? "संभावित दायरा:" : "Range:"} ₹{data.low} - ₹{data.high}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="base"
                        stroke="#059669"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#priceGrad)"
                        name={lang === "hi" ? "अनुमानित मॉडल भाव" : "Expected Modal Price"}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right: Lucknow 5-Mandi Price Arbitrage */}
              <div className="lg:col-span-5 editorial-card p-6 sm:p-7 space-y-4 bg-white">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    {lang === "hi" ? "मंडियों के भाव की तुलना" : "Cross-Mandi Arbitrage"}
                  </span>
                  <h4 className="text-lg font-bold tracking-tight text-slate-900">
                    {lang === "hi" ? "लखनऊ की मंडियों में आज का भाव" : "Lucknow Mandi Rate Comparison"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {lang === "hi"
                      ? "दुबग्गा, नवीन मंडी, मलिहाबाद और फार्मलिंक डायरेक्ट के भाव की तुलना।"
                      : "Real-time modal price variations across Lucknow sub-mandis vs FarmLink Direct."}
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {guidance.mandi_comparison?.map((mandi, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                        mandi.market_name.includes("FarmLink")
                          ? "border-emerald-300 bg-emerald-50/70 font-semibold"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {lang === "hi" && mandi.market_name.includes("FarmLink")
                            ? "फार्मलिंक डायरेक्ट (सीधा किसान खाता)"
                            : mandi.market_name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {mandi.role} • {lang === "hi" && mandi.status.includes("Highest") ? "किसान को सबसे ज़्यादा मुनाफा (+22%)" : mandi.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-emerald-700">
                          ₹{mandi.price_per_kg}/{lang === "hi" ? "किलो" : "kg"}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {mandi.distance_km > 0 ? `${mandi.distance_km} km` : (lang === "hi" ? "सीधा डिजिटल भुगतान" : "Direct Escrow")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. MARKET DRIVERS & INTEGRITY */}
            <div className="editorial-card p-6 sm:p-7 space-y-4 bg-white">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                  {lang === "hi" ? "बाज़ार की स्थिति और कारण" : "Forecast Drivers & Market Fundamentals"}
                </span>
                <h4 className="text-lg font-bold tracking-tight text-slate-900">
                  {lang === "hi" ? "मंडी में भाव क्यों बदल रहे हैं? (लखनऊ क्षेत्र का विश्लेषण)" : "Why is the price moving? (Lucknow Cluster Analysis)"}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    <span>{lang === "hi" ? "मंडियों में माल की आवक" : "Mandi Arrival Supply Trends"}</span>
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {guidance.market_drivers?.arrival_volume_trend}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    <span>{lang === "hi" ? "मौसम और परिवहन" : "Weather & Agro-Climatic Factors"}</span>
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === "hi"
                      ? "मलिहाबाद, काकोरी और बख्शी का तालाब क्षेत्र में मौसम साफ — माल की ढुलाई सुचारू रूप से जारी।"
                      : guidance.market_drivers?.weather_impact}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-emerald-600" />
                    <span>{lang === "hi" ? "बाज़ार में मांग" : "Demand Surge & Festival Pressure"}</span>
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === "hi"
                      ? "गोमती नगर और हजरतगंज के होटलों व रेस्टोरेंटों में ताज़ी सब्जियों की अच्छी मांग (+16%)।"
                      : guidance.market_drivers?.demand_index}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="editorial-card p-12 text-center text-xs text-slate-500 bg-white">
            {lang === "hi" ? `${cropDisplayName} का कोई डेटा उपलब्ध नहीं है।` : `No forecast data available for ${selectedCrop}.`}
          </div>
        )}
      </main>
    </div>
  );
}
