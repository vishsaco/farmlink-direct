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
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Price Intelligence
            </span>
            <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold ${
              isLive ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-700"
            }`}>
              {isLive ? "Agmarknet Live" : "Lucknow APMC"}
            </span>
          </div>
          <h4 className="text-base font-bold tracking-tight text-slate-900 capitalize mt-0.5">
            {commodity} Price Guidance
          </h4>
        </div>

        <button
          onClick={handleSyncMandi}
          disabled={syncing}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
          title="Sync with latest Agmarknet Mandi rates"
        >
          <RotateCw className={`h-3 w-3 text-emerald-600 ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Syncing..." : "Sync Mandi"}</span>
        </button>
      </div>

      {keySavedMsg && (
        <div className="rounded-lg bg-emerald-50 p-2 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{keySavedMsg}</span>
        </div>
      )}

      {/* Actionable Decision Badge */}
      {guidance.action_recommendation && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {guidance.action_recommendation.seller_badge}
            </span>
            <span className="text-[10px] font-bold text-emerald-800">
              +{guidance.action_recommendation.expected_gain_pct}% Gain
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 leading-snug">
            {guidance.action_recommendation.seller_advice}
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Optimal: <strong className="text-slate-900">{guidance.action_recommendation.optimal_harvest_date}</strong></span>
            <a
              href="/predict"
              className="font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              <span>Full AI Simulator 🔮 &rarr;</span>
            </a>
          </div>
        </div>
      )}

      {/* Suggested Price Breakdown */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Recommended Base
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg font-bold text-emerald-700">
              {formatCurrency(guidance.today.base)}
            </span>
            <span className="text-xs text-slate-500">/kg</span>
          </div>
          {onSelectPrice && (
            <button
              onClick={() => onSelectPrice(guidance.today.base)}
              className="mt-1.5 text-[11px] font-bold text-emerald-700 hover:underline transition flex items-center gap-0.5"
            >
              <span>Use Rate &rarr;</span>
            </button>
          )}
        </div>

        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Suggested Range
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-900">
              ₹{guidance.today.low} - ₹{guidance.today.high}
            </span>
            <span className="text-xs text-slate-500">/kg</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-700">
            {trendIcon}
            <span className="capitalize">{guidance.trend} trend</span>
          </div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            7-Day Projected Benchmark
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-emerald-600" />
            <span>Avg: ₹{guidance.avg_price}/kg</span>
          </span>
        </div>

        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="editorialPriceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={10} domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-md">
                        <p className="font-bold text-slate-900">{d.date}</p>
                        <p className="text-emerald-700 font-semibold">Base: ₹{d.base}/kg</p>
                        <p className="text-slate-500">Range: ₹{d.low} - ₹{d.high}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="base" stroke="#059669" strokeWidth={2} fill="url(#editorialPriceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanation note */}
      <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px] text-slate-700">
        <Info className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="leading-relaxed font-normal">{guidance.explanation}</p>
          <div className="pt-0.5 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">
              Market: {guidance.source_meta?.market_name || "Lucknow APMC"}
            </span>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Key className="h-2.5 w-2.5" />
              <span>{showKeyInput ? "Close" : "data.gov.in API Key"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional data.gov.in API Key input */}
      {showKeyInput && (
        <form onSubmit={handleSaveApiKey} className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-900 block">
            Add data.gov.in API Key (Agmarknet Live Sync)
          </span>
          <p className="text-[10px] text-slate-500">
            Get a free API key from <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">data.gov.in</a> to fetch real-time official APMC mandi rates.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste data.gov.in API key here"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              Save Key
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
