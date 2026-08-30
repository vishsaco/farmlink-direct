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
      <div className="rounded-2xl border border-[#E9E7E1] bg-[#FFFFFF] p-6 animate-pulse space-y-3">
        <div className="h-4 w-40 bg-[#E9E7E1] rounded" />
        <div className="h-8 w-24 bg-[#E9E7E1] rounded" />
        <div className="h-28 w-full bg-[#F7F5EF] rounded-xl" />
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
      <TrendingUp className="h-3.5 w-3.5 text-[#173D32]" />
    ) : guidance.trend === "falling" ? (
      <TrendingDown className="h-3.5 w-3.5 text-[#C86B4A]" />
    ) : (
      <Minus className="h-3.5 w-3.5 text-[#7D8A65]" />
    );

  const isLive = guidance.source_meta?.is_live_api;

  return (
    <div className="rounded-2xl border border-[#E9E7E1] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E9E7E1] pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D8A65]">
              Mandi Price Intelligence
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
              isLive ? "bg-[#173D32] text-white" : "bg-[#DCE8DD] text-[#173D32]"
            }`}>
              {isLive ? "Agmarknet Live" : "Lucknow APMC"}
            </span>
          </div>
          <h4 className="font-serif text-lg font-bold text-[#17201D] capitalize mt-0.5">
            {commodity} Price Guidance
          </h4>
        </div>

        <button
          onClick={handleSyncMandi}
          disabled={syncing}
          className="flex items-center gap-1 text-[11px] font-bold text-[#173D32] bg-[#F7F5EF] hover:bg-[#DCE8DD] px-2.5 py-1.5 rounded-full border border-[#E9E7E1] transition"
          title="Sync with latest Agmarknet Mandi rates"
        >
          <RotateCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Syncing..." : "Sync Mandi"}</span>
        </button>
      </div>

      {keySavedMsg && (
        <div className="rounded-xl bg-[#DCE8DD] p-2 text-[11px] font-bold text-[#173D32] flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{keySavedMsg}</span>
        </div>
      )}

      {/* Suggested Price Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#F7F5EF] p-3 border border-[#E9E7E1]">
          <span className="text-[10px] uppercase font-semibold text-[#7D8A65] block">
            Recommended Base
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#173D32]">
              {formatCurrency(guidance.today.base)}
            </span>
            <span className="text-xs text-[#7D8A65]">/kg</span>
          </div>
          {onSelectPrice && (
            <button
              onClick={() => onSelectPrice(guidance.today.base)}
              className="mt-2 text-[11px] font-bold text-[#173D32] hover:text-[#C86B4A] transition flex items-center gap-1"
            >
              <span>Use Rate</span>
              <span>&rarr;</span>
            </button>
          )}
        </div>

        <div className="rounded-xl bg-[#F7F5EF] p-3 border border-[#E9E7E1]">
          <span className="text-[10px] uppercase font-semibold text-[#7D8A65] block">
            Suggested Range
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-sm font-bold text-[#17201D]">
              ₹{guidance.today.low} - ₹{guidance.today.high}
            </span>
            <span className="text-xs text-[#7D8A65]">/kg</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#17201D]">
            {trendIcon}
            <span className="capitalize">{guidance.trend} trend</span>
          </div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#7D8A65] uppercase">
            7-Day Projected Benchmark
          </span>
          <span className="text-[11px] text-[#7D8A65] flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Avg: ₹{guidance.avg_price}/kg</span>
          </span>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="editorialPriceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#173D32" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#173D32" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#7D8A65" fontSize={10} tickLine={false} />
              <YAxis stroke="#7D8A65" fontSize={10} domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-[#E9E7E1] bg-[#FFFFFF] p-2.5 text-xs shadow-md">
                        <p className="font-bold text-[#17201D]">{d.date}</p>
                        <p className="text-[#173D32] font-semibold">Base: ₹{d.base}/kg</p>
                        <p className="text-[#7D8A65]">Range: ₹{d.low} - ₹{d.high}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="base" stroke="#173D32" strokeWidth={2} fill="url(#editorialPriceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanation note */}
      <div className="flex items-start gap-2 rounded-xl bg-[#F7F5EF] p-3 border border-[#E9E7E1] text-[11px] text-[#17201D]/80">
        <Info className="h-3.5 w-3.5 text-[#173D32] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="leading-relaxed font-light">{guidance.explanation}</p>
          <div className="pt-1 flex items-center justify-between text-[10px]">
            <span className="text-[#7D8A65]">
              Market: {guidance.source_meta?.market_name || "Lucknow APMC"}
            </span>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[#173D32] font-bold hover:underline flex items-center gap-1"
            >
              <Key className="h-2.5 w-2.5" />
              <span>{showKeyInput ? "Close" : "data.gov.in API Key"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional data.gov.in API Key input */}
      {showKeyInput && (
        <form onSubmit={handleSaveApiKey} className="rounded-xl bg-[#FFFDF7] p-3 border border-[#C99B43]/30 space-y-2 text-xs">
          <span className="font-bold text-[#17201D] block">
            Add data.gov.in API Key (Agmarknet Live Sync)
          </span>
          <p className="text-[10px] text-[#7D8A65]">
            Get a free API key from <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-[#173D32] underline font-semibold">data.gov.in</a> to fetch real-time official APMC mandi rates.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste data.gov.in API key here"
              className="flex-1 rounded-lg border border-[#E9E7E1] bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#173D32]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#173D32] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#215445] transition"
            >
              Save Key
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
