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
      <div className="editorial-card p-5 animate-pulse space-y-3 bg-white border border-[#E8E8E3] rounded-2xl">
        <div className="h-4 w-36 bg-[#F0EDE4] rounded-lg" />
        <div className="h-7 w-24 bg-[#F0EDE4] rounded-lg" />
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="editorial-card p-5 text-center text-xs text-[#5C584E] bg-white border border-[#E8E8E3] rounded-2xl">
        Settlement statement will generate upon delivery confirmation.
      </div>
    );
  }

  return (
    <div className="editorial-card p-5 space-y-3.5 bg-white border border-[#E8E8E3] rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E8E3] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCE8DD] text-[#173D32]">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-serif text-lg text-[#17201D]">
              Settlement Statement
            </h4>
            <p className="text-[11px] text-[#5C584E]">
              Ref: {settlement.reference} • Order #{orderId}
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 rounded-md bg-[#DCE8DD] border border-[#173D32]/20 px-2.5 py-0.5 text-xs font-semibold text-[#173D32]">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#173D32]" />
          <span>{settlement.status_display}</span>
        </span>
      </div>

      {/* Itemized Financial Breakdown */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between py-1 text-[#17201D]">
          <span>Gross Produce Value</span>
          <span className="font-serif text-base text-[#17201D]">
            {formatCurrency(settlement.gross_amount)}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-[#C86B4A]">
          <span className="flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Logistics & Vehicle Fulfillment (5%)</span>
          </span>
          <span className="font-semibold font-mono">
            -{formatCurrency(settlement.logistics_fee)}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-[#C86B4A]">
          <span className="flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Platform Facilitation Fee (2%)</span>
          </span>
          <span className="font-semibold font-mono">
            -{formatCurrency(settlement.platform_fee)}
          </span>
        </div>

        {/* Net Farmer Amount Highlight */}
        <div className="mt-2.5 flex items-center justify-between rounded-2xl bg-[#DCE8DD]/40 p-3.5 border border-[#173D32]/20">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#173D32] block">
              Net Farmer Realization
            </span>
            <p className="text-[11px] text-[#5C584E]">
              Automated UPI / Bank disbursal within 24h
            </p>
          </div>
          <span className="font-serif text-xl text-[#173D32]">
            {formatCurrency(settlement.net_farmer_amount)}
          </span>
        </div>
      </div>

      {/* Audit Disclosure */}
      <div className="flex items-start gap-2 rounded-2xl bg-[#F7F5EF] p-3 border border-[#E8E8E3] text-[11px] text-[#5C584E]">
        <Info className="h-3.5 w-3.5 text-[#173D32] shrink-0 mt-0.5" />
        <p className="font-normal">
          <span className="font-semibold text-[#17201D]">Audit Record:</span> {settlement.note}. Transaction record registered immutably in the Lucknow cluster ledger.
        </p>
      </div>
    </div>
  );
}
