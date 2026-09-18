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

// Custom Gold Pin Icon for FPO Collection Hubs
const hubIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
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

// Custom Blue Pin Icon for Mandis
const mandiIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 12 Whole-Lucknow Agricultural & Mandi Key Zones
const LUCKNOW_ZONES = [
  { name: "Bakshi Ka Talab (BKT)", type: "hub", lat: 26.9824, lng: 80.9247, desc: "Northern Vegetable Cluster & FPO Intake Hub" },
  { name: "Malihabad Mango Belt", type: "hub", lat: 26.9200, lng: 80.7100, desc: "World-Famous GI-Tagged Dussehri Mango Hub" },
  { name: "Kakori Agro Cluster", type: "farm", lat: 26.8800, lng: 80.7900, desc: "Green Chilli & Vegetable Production Zone" },
  { name: "Dubagga APMC Mandi", type: "mandi", lat: 26.8650, lng: 80.8650, desc: "Major Lucknow Wholesale Mandi Terminal" },
  { name: "Chinhat Agri Hub", type: "hub", lat: 26.8700, lng: 81.0200, desc: "Eastern Logistics & Potato/Onion Storage" },
  { name: "Gosainganj Organic Zone", type: "farm", lat: 26.7700, lng: 81.1200, desc: "Organic Spinach & Vegetable Farmlands" },
  { name: "Mohanlalganj Depot", type: "hub", lat: 26.6800, lng: 80.9800, desc: "Southern Wheat & Grain Aggregation Depot" },
  { name: "Naveen Mandi Sthal (Sitapur Rd)", type: "mandi", lat: 26.9100, lng: 80.9400, desc: "Direct APMC Agmarknet Benchmark Feed" },
  { name: "Hazratganj Central Receiving", type: "buyer", lat: 26.8467, lng: 80.9462, desc: "Central B2B Institutional Procurement Dock" },
  { name: "Gomti Nagar Procurement", type: "buyer", lat: 26.8500, lng: 80.9900, desc: "Commercial Cloud Kitchens & Retail Docks" },
  { name: "Alambagh Logistics Dock", type: "buyer", lat: 26.8150, lng: 80.9050, desc: "Fleet Transport Terminal & Cross-Dock" },
  { name: "Itaunja Northern Farms", type: "farm", lat: 27.0500, lng: 80.9100, desc: "Tomato & Cauliflower Production Belt" },
];

export default function MapInner({
  center,
  radiusKm = 50,
  lots = [],
  onSelectLot,
  height,
}: MapInnerProps) {
  useEffect(() => {
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
        style={{ height: "100%", width: "100%", borderRadius: "24px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 50+ km Whole-Lucknow Cluster Radius */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#262238",
            fillColor: "#262238",
            fillOpacity: 0.05,
            weight: 2,
            dashArray: "6, 6",
          }}
        />

        {/* Whole-Lucknow Agricultural Hubs & Mandis */}
        {LUCKNOW_ZONES.map((zone, idx) => {
          let icon = hubIcon;
          if (zone.type === "mandi") icon = mandiIcon;
          else if (zone.type === "buyer") icon = centerIcon;
          else if (zone.type === "farm") icon = farmIcon;

          return (
            <Marker key={idx} position={[zone.lat, zone.lng]} icon={icon}>
              <Popup>
                <div className="p-2 text-xs font-sans space-y-1.5">
                  <span className="rounded-full bg-[#E8E4F2] px-2 py-0.5 text-[9px] font-medium text-[#262238] uppercase tracking-wider">
                    {zone.type.toUpperCase()} • LUCKNOW CLUSTER
                  </span>
                  <h4 className="font-serif font-normal text-sm text-[#262238] mt-1">{zone.name}</h4>
                  <p className="text-[#737184] text-[11px]">{zone.desc}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${zone.lat},${zone.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-[#718A68] hover:underline block pt-1"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Dynamic Real Lots Published by Users */}
        {lots.map((lot) => {
          const lat = lot.farm_detail?.latitude || 26.9124;
          const lng = lot.farm_detail?.longitude || 80.8947;

          return (
            <Marker key={lot.id} position={[lat, lng]} icon={farmIcon}>
              <Popup>
                <div className="p-2.5 text-xs font-sans space-y-1.5 min-w-[190px]">
                  <span className="rounded-full bg-[#E8E4F2] px-2 py-0.5 text-[9px] font-medium text-[#262238] uppercase tracking-wider">
                    Grade {lot.grade} • Active Harvest Lot #{lot.id}
                  </span>
                  <h4 className="font-serif font-normal text-base capitalize text-[#262238]">
                    {lot.commodity} ({lot.remaining_qty} kg)
                  </h4>
                  <p className="text-[12px] text-[#262238] font-medium">
                    ₹{lot.asking_price}/kg • <span className="text-[#737184] font-normal">{lot.farm_detail?.village || "Lucknow Tehsil"}</span>
                  </p>
                  <p className="text-[10px] text-[#737184]">
                    {lot.farm_detail?.name || "Verified Farm"}
                  </p>
                  {onSelectLot && (
                    <button
                      onClick={() => onSelectLot(lot)}
                      className="mt-2 w-full rounded-full bg-[#262238] py-1.5 text-[11px] font-medium text-white hover:bg-[#342e4c] transition shadow-xs cursor-pointer"
                    >
                      Select Lot
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
