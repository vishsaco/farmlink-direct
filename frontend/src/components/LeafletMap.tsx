"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Lot } from "@/lib/types";
import { MapPin, Layers } from "lucide-react";

// Dynamic import of the entire MapInner component with SSR disabled
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl bg-[#F7F5EF] border border-[#E9E7E1] p-8 text-center text-[#7D8A65] space-y-3">
      <div className="h-6 w-6 rounded-full border-2 border-[#173D32] border-t-transparent animate-spin" />
      <p className="text-xs font-semibold text-[#17201D]">
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
        className="w-full flex flex-col items-center justify-center rounded-2xl bg-[#F7F5EF] border border-[#E9E7E1] text-xs text-[#7D8A65]"
      >
        <div className="flex items-center gap-2 font-medium">
          <MapPin className="h-4 w-4 text-[#173D32] animate-pulse" />
          <span>Initializing Spatial Cluster Map...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height }}
      className="relative w-full overflow-hidden rounded-2xl border border-[#E9E7E1] shadow-sm bg-[#F7F5EF]"
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
