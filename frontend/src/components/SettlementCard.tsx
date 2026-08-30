"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Settlement } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  ArrowDownRight,
  Info,
  CheckCircle2,
  Receipt,
  Download,
} from "lucide-react";

interface SettlementCardProps {
  orderId: number;
}

export function SettlementCard({ orderId }: SettlementCardProps) {
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .getSettlement(orderId)
      .then((data) => {
        if (isMounted) {
          setSettlement(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Settlement fetch error", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="editorial-card p-5 animate-pulse space-y-3 bg-white">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="h-7 w-24 bg-slate-200 rounded" />
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="editorial-card p-5 text-center text-xs text-slate-500 bg-white">
        Settlement statement will generate upon delivery confirmation.
      </div>
    );
  }

  return (
    <div className="editorial-card p-5 space-y-3.5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-base font-bold tracking-tight text-slate-900">
              Settlement Statement
            </h4>
            <p className="text-[11px] text-slate-500">
              Ref: {settlement.reference} • Order #{orderId}
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{settlement.status_display}</span>
        </span>
      </div>

      {/* Itemized Financial Breakdown */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between py-1 text-slate-800">
          <span>Gross Produce Value</span>
          <span className="font-bold text-sm text-slate-900">
            {formatCurrency(settlement.gross_amount)}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-rose-600">
          <span className="flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Logistics & Vehicle Fulfillment (5%)</span>
          </span>
          <span className="font-semibold">
            -{formatCurrency(settlement.logistics_fee)}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-rose-600">
          <span className="flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Platform Facilitation Fee (2%)</span>
          </span>
          <span className="font-semibold">
            -{formatCurrency(settlement.platform_fee)}
          </span>
        </div>

        {/* Net Farmer Amount Highlight */}
        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Net Farmer Realization
            </span>
            <p className="text-[11px] text-slate-500">
              Automated UPI / Bank disbursal within 24h
            </p>
          </div>
          <span className="text-xl font-bold text-emerald-800">
            {formatCurrency(settlement.net_farmer_amount)}
          </span>
        </div>
      </div>

      {/* Audit Disclosure */}
      <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px] text-slate-600">
        <Info className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="font-normal">
          <span className="font-bold text-slate-800">Audit Record:</span> {settlement.note}. Transaction record registered immutably in the Lucknow cluster ledger.
        </p>
      </div>
    </div>
  );
}
