"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Lot } from "@/lib/types";
import { MapPin } from "lucide-react";

// Dynamic import of the entire MapInner component with SSR disabled
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center rounded-[24px] bg-[#F6F5F1] border border-[#E4E2DD] p-8 text-center text-[#737184] space-y-3">
      <div className="h-6 w-6 rounded-full border-2 border-[#262238] border-t-transparent animate-spin" />
      <p className="text-xs font-medium text-[#262238]">
        Rendering Lucknow Agri-Cluster Spatial Map...
      </p>
    </div>
  ),
});

interface LeafletMapProps {
  center?: [number, number];
  radiusKm?: number;
  lots?: Lot[];
  selectedLotId?: number;
  onSelectLot?: (lot: Lot) => void;
  height?: string;
}

export function LeafletMap({
  center = [26.8467, 80.9462], // Lucknow center
  radiusKm = 50,
  lots = [],
  selectedLotId,
  onSelectLot,
  height = "420px",
}: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{ height }}
        className="w-full flex flex-col items-center justify-center rounded-[24px] bg-[#F6F5F1] border border-[#E4E2DD] text-xs text-[#737184]"
      >
        <div className="flex items-center gap-2 font-medium">
          <MapPin className="h-4 w-4 text-[#718A68] animate-pulse" />
          <span>Initializing Spatial Cluster Map...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height }}
      className="relative w-full overflow-hidden rounded-[24px] border border-[#E4E2DD] shadow-xs bg-[#F6F5F1]"
    >
      <MapInner
        center={center}
        radiusKm={radiusKm}
        lots={lots}
        selectedLotId={selectedLotId}
        onSelectLot={onSelectLot}
        height={height}
      />
    </div>
  );
}
