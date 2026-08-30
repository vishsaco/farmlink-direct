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
      <div className="rounded-2xl border border-[#E9E7E1] bg-white p-6 animate-pulse space-y-3">
        <div className="h-4 w-36 bg-[#E9E7E1] rounded" />
        <div className="h-8 w-24 bg-[#E9E7E1] rounded" />
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="rounded-2xl border border-[#E9E7E1] bg-[#FFFFFF] p-6 text-center text-xs text-[#7D8A65]">
        Settlement statement will generate upon delivery confirmation.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#DCE8DD] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E9E7E1] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCE8DD] text-[#173D32]">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-[#17201D]">
              Settlement Statement
            </h4>
            <p className="text-[11px] text-[#7D8A65]">
              Ref: {settlement.reference} • Order #{orderId}
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 rounded-full bg-[#DCE8DD] px-3 py-1 text-xs font-bold text-[#173D32]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{settlement.status_display}</span>
        </span>
      </div>

      {/* Itemized Financial Breakdown */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between py-1 text-[#17201D]">
          <span>Gross Produce Value</span>
          <span className="font-semibold text-base">
            {formatCurrency(settlement.gross_amount)}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-[#C86B4A]">
          <span className="flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Logistics & Vehicle Fulfillment (5%)</span>
          </span>
          <span className="font-semibold">
            -{formatCurrency(settlement.logistics_fee)}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-[#C86B4A]">
          <span className="flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Platform Facilitation Fee (2%)</span>
          </span>
          <span className="font-semibold">
            -{formatCurrency(settlement.platform_fee)}
          </span>
        </div>

        {/* Net Farmer Amount Highlight */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#DCE8DD]/40 p-4 border border-[#173D32]/20">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#173D32] block">
              Net Farmer Realization
            </span>
            <p className="text-[11px] text-[#7D8A65]">
              Ready for automated UPI / Bank transfer
            </p>
          </div>
          <span className="font-serif text-2xl font-bold text-[#173D32]">
            {formatCurrency(settlement.net_farmer_amount)}
          </span>
        </div>
      </div>

      {/* Audit Disclosure */}
      <div className="flex items-start gap-2 rounded-xl bg-[#F7F5EF] p-3 border border-[#E9E7E1] text-[11px] text-[#17201D]/80">
        <Info className="h-3.5 w-3.5 text-[#173D32] shrink-0 mt-0.5" />
        <p className="font-light">
          <span className="font-semibold">Audit Record:</span> {settlement.note}. Transaction record registered immutably in the Lucknow cluster ledger.
        </p>
      </div>
    </div>
  );
}
