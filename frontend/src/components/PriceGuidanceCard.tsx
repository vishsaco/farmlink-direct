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
      <div className="editorial-card p-5 animate-pulse space-y-3 bg-white">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="h-7 w-24 bg-slate-200 rounded" />
        <div className="h-24 w-full bg-slate-100 rounded-lg" />
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
      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
    ) : guidance.trend === "falling" ? (
      <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
    ) : (
      <Minus className="h-3.5 w-3.5 text-slate-400" />
    );

  const isLive = guidance.source_meta?.is_live_api;

  return (
    <div className="editorial-card p-5 space-y-3.5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E8E3] pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5C584E]">
              Price Intelligence
            </span>
            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${
              isLive ? "bg-[#DCE8DD] text-[#173D32] border border-[#173D32]/20" : "bg-[#F0EDE4] text-[#5C584E]"
            }`}>
              {isLive ? "Agmarknet Live" : "Lucknow APMC"}
            </span>
          </div>
          <h4 className="font-serif text-lg text-[#17201D] capitalize mt-0.5">
            {commodity} Price Guidance
          </h4>
        </div>

        <button
          onClick={handleSyncMandi}
          disabled={syncing}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#17201D] bg-[#F0EDE4] hover:bg-white px-2.5 py-1.5 rounded-xl border border-[#E8E8E3] transition cursor-pointer"
          title="Sync with latest Agmarknet Mandi rates"
        >
          <RotateCw className={`h-3 w-3 text-[#173D32] ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Syncing..." : "Sync Mandi"}</span>
        </button>
      </div>

      {keySavedMsg && (
        <div className="rounded-xl bg-[#DCE8DD]/60 p-2.5 text-[11px] font-semibold text-[#173D32] flex items-center gap-1.5 border border-[#173D32]/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#173D32]" />
          <span>{keySavedMsg}</span>
        </div>
      )}

      {/* Actionable Decision Badge */}
      {guidance.action_recommendation && (
        <div className="rounded-2xl border border-[#173D32]/20 bg-[#DCE8DD]/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-[#173D32] px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
              {guidance.action_recommendation.seller_badge}
            </span>
            <span className="text-[10px] font-semibold text-[#173D32]">
              +{guidance.action_recommendation.expected_gain_pct}% Gain
            </span>
          </div>
          <p className="text-xs font-medium text-[#17201D] leading-snug">
            {guidance.action_recommendation.seller_advice}
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-[#5C584E]">
            <span>Optimal: <strong className="text-[#17201D]">{guidance.action_recommendation.optimal_harvest_date}</strong></span>
            <a
              href="/predict"
              className="font-semibold text-[#173D32] hover:underline flex items-center gap-0.5"
            >
              <span>Full AI Simulator 🔮 &rarr;</span>
            </a>
          </div>
        </div>
      )}

      {/* Suggested Price Breakdown */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-[#F7F5EF] p-3 border border-[#E8E8E3]">
          <span className="text-[10px] uppercase font-semibold text-[#5C584E] block">
            Recommended Base
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg font-serif text-[#173D32]">
              {formatCurrency(guidance.today.base)}
            </span>
            <span className="text-xs text-[#5C584E]">/kg</span>
          </div>
          {onSelectPrice && (
            <button
              onClick={() => onSelectPrice(guidance.today.base)}
              className="mt-1.5 text-[11px] font-semibold text-[#173D32] hover:underline transition flex items-center gap-0.5 cursor-pointer"
            >
              <span>Use Rate &rarr;</span>
            </button>
          )}
        </div>

        <div className="rounded-2xl bg-[#F7F5EF] p-3 border border-[#E8E8E3]">
          <span className="text-[10px] uppercase font-semibold text-[#5C584E] block">
            Suggested Range
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-[#17201D]">
              ₹{guidance.today.low} - ₹{guidance.today.high}
            </span>
            <span className="text-xs text-[#5C584E]">/kg</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#5C584E]">
            {trendIcon}
            <span className="capitalize">{guidance.trend} trend</span>
          </div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-[#5C584E] uppercase">
            7-Day Projected Benchmark
          </span>
          <span className="text-[10px] text-[#5C584E] flex items-center gap-1">
            <Calendar className="h-3 w-3 text-[#173D32]" />
            <span>Avg: ₹{guidance.avg_price}/kg</span>
          </span>
        </div>

        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="editorialPriceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#173D32" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#173D32" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#5C584E" fontSize={10} tickLine={false} />
              <YAxis stroke="#5C584E" fontSize={10} domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-[#E8E8E3] bg-white p-2 text-xs shadow-md">
                        <p className="font-semibold text-[#17201D]">{d.date}</p>
                        <p className="text-[#173D32] font-semibold">Base: ₹{d.base}/kg</p>
                        <p className="text-[#5C584E]">Range: ₹{d.low} - ₹{d.high}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="base"
                stroke="#173D32"
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

      {/* Explanation note */}
      <div className="flex items-start gap-2 rounded-2xl bg-[#F7F5EF] p-3 border border-[#E8E8E3] text-[11px] text-[#17201D]">
        <Info className="h-3.5 w-3.5 text-[#173D32] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="leading-relaxed font-normal text-[#5C584E]">{guidance.explanation}</p>
          <div className="pt-1 flex items-center justify-between text-[10px]">
            <span className="text-[#5C584E]">
              Market: {guidance.source_meta?.market_name || "Lucknow APMC"}
            </span>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[#173D32] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Key className="h-2.5 w-2.5" />
              <span>{showKeyInput ? "Close" : "data.gov.in API Key"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional data.gov.in API Key input */}
      {showKeyInput && (
        <form onSubmit={handleSaveApiKey} className="rounded-2xl bg-[#F7F5EF] p-3.5 border border-[#E8E8E3] space-y-2 text-xs">
          <span className="font-semibold text-[#17201D] block">
            Add data.gov.in API Key (Agmarknet Live Sync)
          </span>
          <p className="text-[10px] text-[#5C584E]">
            Get a free API key from <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-[#173D32] underline font-semibold">data.gov.in</a> to fetch real-time official APMC mandi rates.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste data.gov.in API key here"
              className="flex-1 rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#173D32]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#173D32] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#122e26] transition cursor-pointer"
            >
              Save Key
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
