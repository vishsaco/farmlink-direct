"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Commodity, PriceGuidance } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ShieldCheck,
  Calendar,
  RotateCw,
  Key,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface PriceGuidanceCardProps {
  commodity: Commodity;
  cluster?: string;
  onSelectPrice?: (price: number) => void;
}

export function PriceGuidanceCard({
  commodity,
  cluster = "Lucknow",
  onSelectPrice,
}: PriceGuidanceCardProps) {
  const [guidance, setGuidance] = useState<PriceGuidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keySavedMsg, setKeySavedMsg] = useState<string | null>(null);

  const fetchGuidance = () => {
    setLoading(true);
    api
      .getForecast(commodity, cluster)
      .then((data) => {
        setGuidance(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Forecast error", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGuidance();
  }, [commodity, cluster]);

  const handleSyncMandi = async () => {
    setSyncing(true);
    try {
      await api.syncMandi(commodity, apiKey || undefined);
      fetchGuidance();
    } catch (err) {
      console.warn("Sync error", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    try {
      await api.setMandiApiKey(apiKey.trim());
      setKeySavedMsg("data.gov.in API key saved!");
      setShowKeyInput(false);
      handleSyncMandi();
      setTimeout(() => setKeySavedMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save key");
    }
  };

  if (loading) {
    return (
      <div className="editorial-card p-6 animate-pulse space-y-3 bg-white">
        <div className="h-4 w-40 bg-[#E4E2DD] rounded-full" />
        <div className="h-7 w-24 bg-[#E4E2DD] rounded-full" />
        <div className="h-24 w-full bg-[#F6F5F1] rounded-2xl" />
      </div>
    );
  }

  if (!guidance) return null;

  const chartData = guidance.seven_day.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }),
    base: d.base,
    low: d.low,
    high: d.high,
  }));

  const trendIcon =
    guidance.trend === "rising" ? (
      <TrendingUp className="h-3.5 w-3.5 text-[#718A68]" />
    ) : guidance.trend === "falling" ? (
      <TrendingDown className="h-3.5 w-3.5 text-[#C86B4A]" />
    ) : (
      <Minus className="h-3.5 w-3.5 text-[#9D9AAE]" />
    );

  const isLive = guidance.source_meta?.is_live_api;

  return (
    <div className="editorial-card p-6 space-y-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E2DD] pb-3.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#737184]">
              Price Intelligence
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
              isLive ? "bg-[#E3EBE0] text-[#718A68] border border-[#718A68]/20" : "bg-[#E8E4F2] text-[#262238]"
            }`}>
              {isLive ? "Agmarknet Live" : "Lucknow APMC"}
            </span>
          </div>
          <h4 className="font-heading text-lg text-[#262238] capitalize mt-1">
            {commodity} Price Guidance
          </h4>
        </div>

        <button
          onClick={handleSyncMandi}
          disabled={syncing}
          className="flex items-center gap-1.5 text-xs font-medium text-[#262238] bg-[#F6F5F1] hover:bg-[#E8E4F2] px-3 py-2 rounded-full border border-[#E4E2DD] transition cursor-pointer"
          title="Sync with latest Agmarknet Mandi rates"
        >
          <RotateCw className={`h-3 w-3 text-[#718A68] ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Syncing..." : "Sync Mandi"}</span>
        </button>
      </div>

      {keySavedMsg && (
        <div className="rounded-2xl bg-[#E3EBE0]/60 p-3 text-xs font-medium text-[#718A68] flex items-center gap-1.5 border border-[#718A68]/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#718A68]" />
          <span>{keySavedMsg}</span>
        </div>
      )}

      {/* Actionable Decision Badge */}
      {guidance.action_recommendation && (
        <div className="rounded-[20px] border border-[#718A68]/20 bg-[#E3EBE0]/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#262238] px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
              {guidance.action_recommendation.seller_badge}
            </span>
            <span className="text-[11px] font-semibold text-[#718A68]">
              +{guidance.action_recommendation.expected_gain_pct}% Gain
            </span>
          </div>
          <p className="text-sm font-medium text-[#262238] leading-snug">
            {guidance.action_recommendation.seller_advice}
          </p>
          <div className="pt-1 flex items-center justify-between text-xs text-[#737184]">
            <span>Optimal: <strong className="text-[#262238]">{guidance.action_recommendation.optimal_harvest_date}</strong></span>
            <a
              href="/predict"
              className="font-medium text-[#718A68] hover:underline flex items-center gap-0.5"
            >
              <span>Full AI Simulator 🔮 &rarr;</span>
            </a>
          </div>
        </div>
      )}

      {/* Suggested Price Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[20px] bg-[#F6F5F1] p-4 border border-[#E4E2DD]">
          <span className="text-[10px] uppercase font-medium text-[#737184] block">
            Recommended Base
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-heading text-[#262238]">
              {formatCurrency(guidance.today.base)}
            </span>
            <span className="text-xs text-[#737184]">/kg</span>
          </div>
          {onSelectPrice && (
            <button
              onClick={() => onSelectPrice(guidance.today.base)}
              className="mt-2 text-xs font-medium text-[#718A68] hover:underline transition flex items-center gap-0.5 cursor-pointer"
            >
              <span>Use Rate &rarr;</span>
            </button>
          )}
        </div>

        <div className="rounded-[20px] bg-[#F6F5F1] p-4 border border-[#E4E2DD]">
          <span className="text-[10px] uppercase font-medium text-[#737184] block">
            Suggested Range
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base font-semibold text-[#262238]">
              ₹{guidance.today.low} - ₹{guidance.today.high}
            </span>
            <span className="text-xs text-[#737184]">/kg</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#737184]">
            {trendIcon}
            <span className="capitalize">{guidance.trend} trend</span>
          </div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-[#737184] uppercase tracking-wider">
            7-Day Projected Benchmark
          </span>
          <span className="text-[10px] text-[#737184] flex items-center gap-1">
            <Calendar className="h-3 w-3 text-[#718A68]" />
            <span>Avg: ₹{guidance.avg_price}/kg</span>
          </span>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="editorialPriceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#718A68" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#718A68" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#9D9AAE" fontSize={10} tickLine={false} />
              <YAxis stroke="#9D9AAE" fontSize={10} domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-2xl border border-[#E4E2DD] bg-white p-2.5 text-xs shadow-lg">
                        <p className="font-medium text-[#262238]">{d.date}</p>
                        <p className="text-[#718A68] font-semibold">Base: ₹{d.base}/kg</p>
                        <p className="text-[#737184]">Range: ₹{d.low} - ₹{d.high}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="base"
                stroke="#718A68"
                strokeWidth={2}
                fill="url(#editorialPriceGrad)"
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanation */}
      <div className="flex items-start gap-2 rounded-[20px] bg-[#F6F5F1] p-3.5 border border-[#E4E2DD] text-xs text-[#262238]">
        <Info className="h-3.5 w-3.5 text-[#718A68] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="leading-relaxed text-[#737184]">{guidance.explanation}</p>
          <div className="pt-1 flex items-center justify-between text-[10px]">
            <span className="text-[#737184]">
              Market: {guidance.source_meta?.market_name || "Lucknow APMC"}
            </span>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[#718A68] font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Key className="h-2.5 w-2.5" />
              <span>{showKeyInput ? "Close" : "data.gov.in API Key"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      {showKeyInput && (
        <form onSubmit={handleSaveApiKey} className="rounded-[20px] bg-[#F6F5F1] p-4 border border-[#E4E2DD] space-y-2.5 text-xs">
          <span className="font-medium text-[#262238] block">
            Add data.gov.in API Key (Agmarknet Live Sync)
          </span>
          <p className="text-[10px] text-[#737184]">
            Get a free API key from <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-[#718A68] underline font-medium">data.gov.in</a> to fetch real-time official APMC mandi rates.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste data.gov.in API key here"
              className="flex-1 rounded-full border border-[#E4E2DD] bg-white px-3.5 py-2 text-xs focus:outline-none focus:border-[#718A68]"
            />
            <button
              type="submit"
              className="rounded-full bg-[#262238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1A1729] transition cursor-pointer"
            >
              Save Key
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
