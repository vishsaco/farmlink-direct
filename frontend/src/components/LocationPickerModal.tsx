"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, CheckCircle2, ExternalLink, X, Search, Sparkles, Compass } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

// Dynamically import Leaflet Map to avoid SSR issues
const MapInner = dynamic(() => import("@/components/MapInner"), { ssr: false });

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  zoneName?: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (location: LocationData) => void;
  initialLocation?: LocationData;
  title?: string;
  role?: string;
}

const LUCKNOW_PRESETS: { name: string; type: "farm" | "buyer" | "hub" | "mandi"; lat: number; lng: number; desc: string }[] = [
  { name: "Bakshi Ka Talab (BKT), Lucknow", type: "hub", lat: 26.9824, lng: 80.9247, desc: "Northern Vegetable & Farm Cluster" },
  { name: "Malihabad Mango Belt, Lucknow", type: "farm", lat: 26.9200, lng: 80.7100, desc: "Dussehri Mango & Fruit Farmlands" },
  { name: "Kakori Agro Hub, Lucknow", type: "farm", lat: 26.8800, lng: 80.7900, desc: "Green Chilli & Vegetable Belt" },
  { name: "Dubagga APMC Mandi, Lucknow", type: "mandi", lat: 26.8650, lng: 80.8650, desc: "Central Produce Wholesale Market" },
  { name: "Chinhat Agri Hub, Lucknow", type: "hub", lat: 26.8700, lng: 81.0200, desc: "Eastern Logistics & Potato/Onion Storage" },
  { name: "Gosainganj Organic Farms, Lucknow", type: "farm", lat: 26.7700, lng: 81.1200, desc: "Organic Vegetable & Leafy Greens Belt" },
  { name: "Mohanlalganj Depot, Lucknow", type: "hub", lat: 26.6800, lng: 80.9800, desc: "Southern Wheat & Grain Depot" },
  { name: "Sitapur Road Naveen Mandi, Lucknow", type: "mandi", lat: 26.9100, lng: 80.9400, desc: "APMC Agricultural Sthal" },
  { name: "Hazratganj Central Receiving, Lucknow", type: "buyer", lat: 26.8467, lng: 80.9462, desc: "Institutional Procurement Dock" },
  { name: "Gomti Nagar Commercial Hub, Lucknow", type: "buyer", lat: 26.8500, lng: 80.9900, desc: "Cloud Kitchens & Supermarkets Dock" },
  { name: "Alambagh Logistics Terminal, Lucknow", type: "buyer", lat: 26.8150, lng: 80.9050, desc: "Fleet Transport Terminal" },
  { name: "Itaunja Northern Farms, Lucknow", type: "farm", lat: 27.0500, lng: 80.9100, desc: "Tomato & Cauliflower Farmlands" },
];

export function LocationPickerModal({
  isOpen,
  onClose,
  onConfirmLocation,
  initialLocation,
  title = "Confirm Location on Map",
  role = "farmer",
}: LocationPickerModalProps) {
  const { lang } = useLanguage();
  const [selectedAddress, setSelectedAddress] = useState(initialLocation?.address || "Bakshi Ka Talab, Lucknow");
  const [lat, setLat] = useState<number>(initialLocation?.lat || 26.9824);
  const [lng, setLng] = useState<number>(initialLocation?.lng || 80.9247);
  const [capturingGps, setCapturingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setSelectedAddress(initialLocation.address);
      setLat(initialLocation.lat);
      setLng(initialLocation.lng);
    }
  }, [initialLocation]);

  if (!isOpen) return null;

  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setCapturingGps(true);
    setGpsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(4));
        const userLng = Number(pos.coords.longitude.toFixed(4));
        setLat(userLat);
        setLng(userLng);
        setSelectedAddress(`Current GPS Farm/Dock [${userLat}, ${userLng}], Lucknow Region`);
        setCapturingGps(false);
        setGpsSuccess(true);
        setTimeout(() => setGpsSuccess(false), 3000);
      },
      (err) => {
        console.warn("GPS lookup error, falling back to Bakshi Ka Talab", err);
        setLat(26.9824);
        setLng(80.9247);
        setSelectedAddress("Bakshi Ka Talab, Lucknow");
        setCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSelectPreset = (preset: typeof LUCKNOW_PRESETS[0]) => {
    setSelectedAddress(preset.name);
    setLat(preset.lat);
    setLng(preset.lng);
  };

  const handleConfirm = () => {
    onConfirmLocation({
      address: selectedAddress,
      lat,
      lng,
    });
    onClose();
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17201D]/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#E9E7E1] bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E9E7E1] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173D32] text-white">
              <MapPin className="h-5 w-5 text-[#C99B43]" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#17201D]">{title}</h3>
              <p className="text-xs text-[#7D8A65]">
                {role === "buyer"
                  ? "Select and confirm your delivery receiving dock address in Lucknow"
                  : "Select and confirm your farm gate pickup location in Lucknow"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#7D8A65] hover:bg-[#F7F5EF] hover:text-[#17201D] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#F7F5EF] p-4 rounded-2xl border border-[#E9E7E1]">
          <button
            type="button"
            onClick={handleUseCurrentGps}
            disabled={capturingGps}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#173D32] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#215445] transition shadow-xs disabled:opacity-50 shrink-0"
          >
            <Navigation className={`h-3.5 w-3.5 text-[#C99B43] ${capturingGps ? "animate-spin" : ""}`} />
            <span>{capturingGps ? "Acquiring GPS..." : "📍 Use Current GPS Location"}</span>
          </button>

          <div className="text-xs text-[#7D8A65] flex-1 text-center sm:text-left">
            {gpsSuccess ? (
              <span className="font-bold text-[#173D32] flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>GPS Location Captured: {lat}, {lng}</span>
              </span>
            ) : (
              <span>Automatically pin your device's exact location in Lucknow</span>
            )}
          </div>
        </div>

        {/* Lucknow Regional Quick Selectors */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#17201D] uppercase tracking-wider">
            Or Choose from Lucknow Agricultural & Commercial Zones:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
            {LUCKNOW_PRESETS.map((preset, idx) => {
              const isSelected = lat === preset.lat && lng === preset.lng;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition space-y-0.5 ${
                    isSelected
                      ? "border-[#173D32] bg-[#DCE8DD] font-bold text-[#173D32] shadow-xs"
                      : "border-[#E9E7E1] bg-white hover:border-[#173D32]/40 text-[#17201D]"
                  }`}
                >
                  <p className="font-bold truncate">{preset.name.split(",")[0]}</p>
                  <p className="text-[10px] text-[#7D8A65] line-clamp-1">{preset.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Location Confirmation Bar */}
        <div className="rounded-2xl border border-[#E9E7E1] bg-white p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">
              Confirmed Location Address / Landmark:
            </label>
            <input
              type="text"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2 text-xs font-bold text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#7D8A65] pt-1">
            <span className="font-mono font-medium">
              Geo-Coordinates: <strong className="text-[#17201D]">{lat}, {lng}</strong>
            </span>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#173D32] hover:underline"
            >
              <span>Verify on Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#C99B43]" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-[#E9E7E1] py-3 text-xs font-bold text-[#7D8A65] hover:bg-[#F7F5EF] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-full bg-[#173D32] py-3 text-xs font-bold text-white hover:bg-[#215445] transition shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-[#C99B43]" />
            <span>Confirm & Apply Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
