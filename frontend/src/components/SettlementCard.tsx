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
      <div className="editorial-card p-6 animate-pulse space-y-4 bg-white border border-[#E4E2DD] rounded-[24px]">
        <div className="h-5 w-36 bg-[#F6F5F1] rounded-lg" />
        <div className="h-8 w-24 bg-[#F6F5F1] rounded-lg" />
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="editorial-card p-6 text-center text-xs text-[#737184] bg-white border border-[#E4E2DD] rounded-[24px]">
        Settlement statement will generate upon delivery confirmation.
      </div>
    );
  }

  return (
    <div className="editorial-card p-6 space-y-4 bg-white border border-[#E4E2DD] rounded-[24px] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E2DD] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#E8E4F2] text-[#262238]">
            <Receipt className="h-4 w-4 text-[#718A68]" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-normal text-[#262238]">
              Settlement Statement
            </h4>
            <p className="text-[11px] text-[#737184]">
              Ref: {settlement.reference} • Order #{orderId}
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 rounded-full bg-[#E8E4F2] border border-[#262238]/10 px-3 py-1 text-xs font-medium text-[#262238]">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#718A68]" />
          <span>{settlement.status_display}</span>
        </span>
      </div>

      {/* Itemized Financial Breakdown */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between py-1 text-[#262238]">
          <span className="text-[#737184]">Gross Produce Value</span>
          <span className="font-serif text-base font-normal text-[#262238]">
            {formatCurrency(settlement.gross_amount)}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-[#C86B4A]">
          <span className="flex items-center gap-1.5">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Logistics & Vehicle Fulfillment (5%)</span>
          </span>
          <span className="font-medium font-mono">
            -{formatCurrency(settlement.logistics_fee)}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-[#C86B4A]">
          <span className="flex items-center gap-1.5">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Platform Facilitation Fee (2%)</span>
          </span>
          <span className="font-medium font-mono">
            -{formatCurrency(settlement.platform_fee)}
          </span>
        </div>

        {/* Net Farmer Amount Highlight */}
        <div className="mt-3 flex items-center justify-between rounded-[20px] bg-[#E8E4F2]/40 p-4 border border-[#262238]/10">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#262238] block">
              Net Farmer Realization
            </span>
            <p className="text-[11px] text-[#737184]">
              Automated UPI / Bank disbursal within 24h
            </p>
          </div>
          <span className="font-serif text-2xl font-normal text-[#262238]">
            {formatCurrency(settlement.net_farmer_amount)}
          </span>
        </div>
      </div>

      {/* Audit Disclosure */}
      <div className="flex items-start gap-2.5 rounded-[18px] bg-[#F6F5F1] p-3.5 border border-[#E4E2DD] text-[11px] text-[#737184]">
        <Info className="h-4 w-4 text-[#718A68] shrink-0 mt-0.5" />
        <p className="font-normal">
          <span className="font-medium text-[#262238]">Audit Record:</span> {settlement.note}. Transaction record registered immutably in the Lucknow cluster ledger.
        </p>
      </div>
    </div>
  );
}
