"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  CheckCircle2,
  ExternalLink,
  X,
  Search,
  Sparkles,
  Compass,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { getLiveAccurateLocation, reverseGeocode, searchAddress, AccurateLocation } from "@/lib/geo";

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
  { name: "Chinhat Agri Hub, Lucknow", type: "hub", lat: 26.8700, lng: 81.0200, desc: "Eastern Logistics & Cold Storage" },
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
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null);

  // Live Address Search Suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: number; lon: number }>>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setSelectedAddress(initialLocation.address);
      setLat(initialLocation.lat);
      setLng(initialLocation.lng);
    }
  }, [initialLocation]);

  if (!isOpen) return null;

  const handleUseCurrentLiveLocation = async () => {
    setCapturingGps(true);
    setGpsSuccess(null);
    try {
      const loc = await getLiveAccurateLocation();
      setLat(loc.lat);
      setLng(loc.lng);
      setSelectedAddress(loc.address);
      setGpsSuccess(
        loc.source === "gps"
          ? `Live GPS Acquired: ${loc.lat}, ${loc.lng} (${loc.accuracyMeters ? `±${Math.round(loc.accuracyMeters)}m` : "Accurate"})`
          : `Live Location Detected: ${loc.address}`
      );
      setTimeout(() => setGpsSuccess(null), 5000);
    } catch (err: any) {
      console.error("Live location error", err);
      alert("Could not access live location. Please choose from the Lucknow zones or search your address.");
    } finally {
      setCapturingGps(false);
    }
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchAddress(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: { display_name: string; lat: number; lon: number }) => {
    setLat(result.lat);
    setLng(result.lon);
    setSelectedAddress(result.display_name.split(",").slice(0, 3).join(", "));
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSelectPreset = async (preset: typeof LUCKNOW_PRESETS[0]) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#262238]/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-[28px] border border-[#E4E2DD] bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E4E2DD] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#E8E4F2] text-[#262238] shadow-xs">
              <MapPin className="h-5 w-5 text-[#718A68]" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-normal text-[#262238]">{title}</h3>
              <p className="text-xs text-[#737184]">
                {role === "buyer"
                  ? "Pinpoint and confirm your commercial receiving dock address in Lucknow"
                  : "Pinpoint and confirm your exact farm gate pickup location in Lucknow"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#737184] hover:bg-[#F6F5F1] hover:text-[#262238] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. SEAMLESS LIVE GPS ACTION */}
        <div className="rounded-[20px] border border-[#262238]/10 bg-[#E8E4F2]/50 p-4 space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleUseCurrentLiveLocation}
              disabled={capturingGps}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#262238] px-6 py-3 text-xs font-medium text-white hover:bg-[#342e4c] transition shadow-xs disabled:opacity-50 shrink-0 active:scale-95 cursor-pointer"
            >
              {capturingGps ? (
                <Loader2 className="h-4 w-4 text-[#718A68] animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 text-[#718A68]" />
              )}
              <span>{capturingGps ? "Acquiring High-Precision GPS..." : "📍 Get My Exact Live Location"}</span>
            </button>

            <div className="text-xs text-[#262238] font-medium text-center sm:text-right">
              {gpsSuccess ? (
                <span className="text-[#262238] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#718A68]" />
                  <span>{gpsSuccess}</span>
                </span>
              ) : (
                <span className="text-[#737184]">1-Tap browser GPS with automatic village reverse-geocoding</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. SEARCH ANY VILLAGE / LOCALITY */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#262238] uppercase tracking-wider">
            Search Any Place, Tehsil or Village in Lucknow:
          </label>
          <form onSubmit={handleSearchAddress} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#737184]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Malihabad, Gomti Nagar, Kakori, Mohanlalganj..."
                className="w-full rounded-full border border-[#E4E2DD] bg-[#F6F5F1] pl-10 pr-4 py-2.5 text-xs text-[#262238] focus:bg-white focus:border-[#262238] focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="rounded-full bg-[#262238] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#342e4c] transition disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="rounded-[18px] border border-[#E4E2DD] bg-white p-2 shadow-lg space-y-1 max-h-40 overflow-y-auto z-10">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#F6F5F1] text-xs transition flex items-center gap-2"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#718A68] shrink-0" />
                  <span className="truncate font-medium text-[#262238]">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. LUCKNOW 12-ZONE PRESETS */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#262238] uppercase tracking-wider">
            Or Choose from Whole-Lucknow Agricultural Hubs:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-40 overflow-y-auto pr-1">
            {LUCKNOW_PRESETS.map((preset, idx) => {
              const isSelected = lat === preset.lat && lng === preset.lng;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-[16px] border text-left text-xs transition space-y-0.5 cursor-pointer ${
                    isSelected
                      ? "border-[#262238] bg-[#E8E4F2] font-semibold text-[#262238] shadow-xs"
                      : "border-[#E4E2DD] bg-white hover:border-[#262238]/30 text-[#262238]"
                  }`}
                >
                  <p className="font-semibold truncate">{preset.name.split(",")[0]}</p>
                  <p className="text-[10px] text-[#737184] line-clamp-1">{preset.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. CONFIRMED LOCATION DETAILS & GOOGLE MAPS PREVIEW */}
        <div className="rounded-[20px] border border-[#E4E2DD] bg-white p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#262238] mb-1">
              Confirmed Address / Landmark:
            </label>
            <input
              type="text"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full rounded-xl border border-[#E4E2DD] bg-[#F6F5F1] px-3.5 py-2.5 text-xs font-medium text-[#262238] focus:bg-white focus:border-[#262238] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#737184] pt-1">
            <span className="font-mono text-[11px]">
              Exact Coordinates: <strong className="text-[#262238]">{lat}° N, {lng}° E</strong>
            </span>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-[#262238] hover:underline bg-[#E8E4F2] px-3 py-1 rounded-full border border-[#262238]/10"
            >
              <span>View in Google Maps</span>
              <ExternalLink className="h-3 w-3 text-[#718A68]" />
            </a>
          </div>
        </div>

        {/* 5. ACTION BUTTONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-[#E4E2DD] py-3 text-xs font-medium text-[#737184] hover:bg-[#F6F5F1] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-full bg-[#262238] py-3 text-xs font-medium text-white hover:bg-[#342e4c] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 text-[#718A68]" />
            <span>Confirm & Apply Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
