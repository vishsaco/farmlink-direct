"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Lot } from "@/lib/types";

interface MapInnerProps {
  center: [number, number];
  radiusKm: number;
  lots: Lot[];
  selectedLotId?: number;
  onSelectLot?: (lot: Lot) => void;
  height: string;
}

// Custom Green Pin Icon for Farms
const farmIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom Red Pin Icon for Buyer Center
const centerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapInner({
  center,
  radiusKm,
  lots,
  onSelectLot,
  height,
}: MapInnerProps) {
  useEffect(() => {
    // Fix default Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div style={{ height, width: "100%" }} className="relative z-0">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: "16px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 50 km Service Radius */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#173D32",
            fillColor: "#173D32",
            fillOpacity: 0.08,
            weight: 2,
            dashArray: "6, 6",
          }}
        />

        {/* Buyer Delivery Hub (Lucknow Central) */}
        <Marker position={center} icon={centerIcon}>
          <Popup>
            <div className="p-2 text-xs font-sans">
              <p className="font-serif font-bold text-sm text-[#173D32]">Lucknow Central Hub</p>
              <p className="text-slate-600 font-medium">Hazratganj Receiving Station</p>
              <p className="text-[11px] text-[#C99B43] font-bold mt-1">
                Active Service Radius: {radiusKm} km
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Farm Markers */}
        {lots.map((lot) => {
          const lat = lot.farm_detail?.latitude || 26.9124;
          const lng = lot.farm_detail?.longitude || 80.8947;
          const pos: [number, number] = [lat, lng];

          return (
            <Marker
              key={lot.id}
              position={pos}
              icon={farmIcon}
              eventHandlers={{
                click: () => onSelectLot && onSelectLot(lot),
              }}
            >
              <Popup>
                <div className="p-2 text-xs font-sans space-y-1">
                  <span className="font-serif font-bold text-sm text-[#173D32] capitalize block">
                    {lot.commodity} (Grade {lot.grade})
                  </span>
                  <p className="text-slate-700 font-medium">
                    {lot.farm_detail?.village || "Lucknow"}, {lot.farm_detail?.district || "District"}
                  </p>
                  <p className="font-bold text-[#173D32]">
                    ₹{lot.asking_price}/kg • {lot.remaining_qty} kg available
                  </p>
                  {lot.distance_km !== undefined && (
                    <p className="text-[11px] text-slate-500 font-semibold">
                      📍 {lot.distance_km} km from buyer hub
                    </p>
                  )}
                  {onSelectLot && (
                    <button
                      onClick={() => onSelectLot(lot)}
                      className="mt-2 w-full rounded-full bg-[#173D32] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#215445] transition"
                    >
                      Reserve This Lot &rarr;
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
