"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  X,
  Sprout,
  ShoppingBag,
  Truck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
  Phone,
  User,
  Building,
  MapPin,
  Sparkles,
  ShieldCheck,
  CloudSun,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import { LocationPickerModal, LocationData } from "@/components/LocationPickerModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
  defaultRole?: "farmer" | "fpo" | "buyer" | "driver" | "ops";
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "678996638926-0nf07l8t43r45cueneqb5a5eks6ofaou.apps.googleusercontent.com";

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = "register",
  defaultRole = "farmer",
}: AuthModalProps) {
  const router = useRouter();
  const { login, register, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [role, setRole] = useState<"farmer" | "fpo" | "buyer" | "driver" | "ops">(defaultRole);

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [location, setLocation] = useState("Bakshi Ka Talab, Lucknow");
  const [geoLat, setGeoLat] = useState<number>(26.9824);
  const [geoLng, setGeoLng] = useState<number>(80.9247);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Pillar 1: Government Agrarian Verification State
  const [pmKisanId, setPmKisanId] = useState("");
  const [khasraNumber, setKhasraNumber] = useState("");
  const [landSizeAcres, setLandSizeAcres] = useState<number>(0);
  const [tehsil, setTehsil] = useState("");
  const [govVerifying, setGovVerifying] = useState(false);
  const [govVerifiedRecord, setGovVerifiedRecord] = useState<any>(null);
  const [govError, setGovError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email: "",
        name: "",
        role: role,
        credential: response.credential,
      } as any);

      onClose();

      if (role === "farmer") router.push("/farmer");
      else if (role === "fpo") router.push("/fpo");
      else if (role === "buyer") router.push("/buyer");
      else if (role === "driver") router.push("/driver");
      else if (role === "ops") router.push("/ops");
      else router.push("/");
    } catch (err: any) {
      console.error("Google login failed", err);
      setError(err.message || "Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

    const initGoogleGSI = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "rectangular",
              width: 320,
              logo_alignment: "left",
            });
          }
        } catch (err) {
          console.warn("GSI init warning:", err);
        }
      }
    };

    if (!document.getElementById("google-gsi-script")) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogleGSI;
      document.body.appendChild(script);
    } else {
      initGoogleGSI();
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleLiveGovVerify = async () => {
    if (!pmKisanId.trim() && !khasraNumber.trim()) {
      setGovError("Please enter your PM-KISAN ID or Khasra Number to query the Government Registry.");
      return;
    }
    setGovVerifying(true);
    setGovError(null);
    try {
      const res = await api.verifyFarmerId({
        farmer_id: pmKisanId.trim(),
        khasra_number: khasraNumber.trim(),
        district: "Lucknow",
      });
      if (res.success && res.data) {
        setGovVerifiedRecord(res.data);
        if (res.data.beneficiary_name && !firstName) {
          const parts = res.data.beneficiary_name.split(" ");
          setFirstName(parts[0]);
          if (parts.length > 1) setLastName(parts.slice(1).join(" "));
        }
        if (res.data.village && res.data.tehsil) {
          setLocation(`${res.data.village}, ${res.data.tehsil}, Lucknow`);
        }
        if (res.data.land_size_acres) {
          setLandSizeAcres(res.data.land_size_acres);
        }
        if (res.data.tehsil) {
          setTehsil(res.data.tehsil);
        }
      }
    } catch (err: any) {
      setGovVerifiedRecord(null);
      setGovError(err.message || "Government verification failed: Record not found in UP Bhulekh or PM-KISAN database.");
    } finally {
      setGovVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPhone = phone.trim().startsWith("+91") ? phone.trim() : `+91-${phone.trim().replace(/^0+/, "")}`;

    try {
      if (mode === "login") {
        await login(cleanUsername, password);
      } else {
        await register({
          username: cleanUsername,
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: cleanPhone || "+91-9876543210",
          role,
          organization_name: orgName.trim(),
          location: location.trim() || "Bakshi Ka Talab, Lucknow",
          language: "en",
          pm_kisan_id: pmKisanId.trim(),
          khasra_number: khasraNumber.trim(),
          land_size_acres: landSizeAcres,
          tehsil: tehsil.trim(),
        });
      }

      onClose();

      if (role === "farmer") router.push("/farmer");
      else if (role === "fpo") router.push("/fpo");
      else if (role === "buyer") router.push("/buyer");
      else if (role === "driver") router.push("/driver");
      else if (role === "ops") router.push("/ops");
      else router.push("/");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = [
    { id: "farmer", label: "Farmer / Kisan", icon: Sprout, desc: "List produce directly" },
    { id: "fpo", label: "FPO Aggregator", icon: Building, desc: "Manage member farms" },
    { id: "buyer", label: "Bulk Buyer", icon: ShoppingBag, desc: "Kitchens & retailers" },
    { id: "driver", label: "Fleet Driver", icon: Truck, desc: "Direct farm dispatch" },
    { id: "ops", label: "Ops Coordinator", icon: ShieldAlert, desc: "Control tower" },
  ];

  const inputClass = "w-full rounded-2xl border border-[#E4E2DD] bg-white px-3.5 py-2.5 text-sm text-[#262238] focus:border-[#718A68] focus:ring-1 focus:ring-[#718A68]/20 focus:outline-none transition placeholder:text-[#9D9AAE]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#262238]/60 p-3 sm:p-5 backdrop-blur-sm transition-opacity duration-200">
      <div className="relative w-full max-w-4xl rounded-[28px] border border-[#E4E2DD] bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] animate-fade-in-up">
        {/* Left Panel: Brand Photography */}
        <div className="hidden md:flex md:w-5/12 bg-[#262238] relative flex-col justify-between p-8 text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1000&auto=format&fit=crop&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1729] via-[#262238]/90 to-[#262238]/80" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[#718A68]" />
              <span>Lucknow Regional Cluster</span>
            </div>
            <h2 className="font-heading text-2xl lg:text-3xl font-normal leading-tight text-white">
              Direct markets built for better harvest decisions.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Connecting 1,200+ verified farmers and FPOs with transparent APMC benchmarks and weather-aware fulfillment.
            </p>
          </div>

          <div className="relative z-10 space-y-2.5 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <ShieldCheck className="h-4 w-4 text-[#718A68] shrink-0" />
              <span>Zero broker cut · Farm-gate escrow</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <CloudSun className="h-4 w-4 text-[#C99B43] shrink-0" />
              <span>Weather-synchronized dispatch routing</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 overflow-y-auto bg-[#F6F5F1]/40 relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-[#737184] hover:bg-[#E4E2DD]/60 hover:text-[#262238] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="pr-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8E4F2] text-[#262238] text-[10px] font-medium uppercase tracking-wider mb-3">
              FarmLink Verification
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl text-[#262238] font-normal tracking-tight">
              {mode === "register" ? "Welcome to FarmLink" : "Welcome Back"}
            </h3>
            <p className="text-sm text-[#737184] mt-1.5">
              {mode === "register"
                ? "Join a direct market built for transparent prices and harvest planning."
                : "Sign in to access your farm, market orders, and logistics terminal."}
            </p>

            <div className="mt-4 flex rounded-2xl bg-[#E4E2DD]/40 p-1 border border-[#E4E2DD]">
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); }}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition cursor-pointer ${
                  mode === "register"
                    ? "bg-white text-[#262238] shadow-sm"
                    : "text-[#737184] hover:text-[#262238]"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); }}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition cursor-pointer ${
                  mode === "login"
                    ? "bg-white text-[#262238] shadow-sm"
                    : "text-[#737184] hover:text-[#262238]"
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-[#F8ECE8] p-3.5 border border-[#C86B4A]/20 text-sm font-medium text-[#C86B4A]">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="mt-5">
            <label className="block text-xs font-medium text-[#737184] uppercase tracking-wider mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roleConfigs.map((cfg) => {
                const Icon = cfg.icon;
                const isSelected = role === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => setRole(cfg.id as any)}
                    className={`rounded-2xl border p-3 text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-[#718A68] bg-[#E3EBE0]/40 text-[#262238] ring-1 ring-[#718A68]/30 shadow-sm"
                        : "border-[#E4E2DD] bg-white text-[#262238] hover:border-[#D4CEE8]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-[#718A68]" : "text-[#737184]"}`} />
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-[#718A68]" />}
                    </div>
                    <span className="font-medium text-xs leading-tight">{cfg.label}</span>
                    <span className="text-[10px] text-[#737184] line-clamp-1 mt-0.5">{cfg.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google SSO Container */}
          <div className="space-y-2.5 pt-4">
            <div className="flex justify-center min-h-[40px]" ref={googleBtnContainerRef} />
            {googleLoading && (
              <p className="text-center text-xs text-[#737184] animate-pulse font-medium">
                Verifying Google credentials...
              </p>
            )}
            <div className="relative flex items-center justify-center text-[10px] uppercase font-medium tracking-wider text-[#9D9AAE]">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E4E2DD]" />
              </div>
              <span className="relative bg-[#F8F7F3] px-3">or continue with credentials</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-3">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-[#262238] mb-1.5">First Name</label>
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Ramesh" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#262238] mb-1.5">Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Yadav" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#262238] mb-1.5">Phone Number</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className={inputClass} />
                </div>

                {/* Pillar 1: Government AgriStack */}
                {role === "farmer" && (
                  <div className="rounded-[20px] border-2 border-[#718A68]/25 bg-[#E3EBE0]/20 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-[#E4E2DD] pb-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#718A68] uppercase tracking-wider">
                          <span className="flex h-2 w-2 rounded-full bg-[#718A68] animate-pulse" />
                          <span>Govt. AgriStack Verification</span>
                        </div>
                        <p className="text-[11px] text-[#737184] mt-0.5 leading-snug">
                          Live authentication against UP Bhulekh & PM-KISAN Registry
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E3EBE0] text-[#718A68] border border-[#718A68]/20 shrink-0">
                        Mandatory
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-medium text-[#262238] mb-1.5">PM-KISAN ID *</label>
                        <input
                          type="text" required value={pmKisanId}
                          onChange={(e) => { setPmKisanId(e.target.value); setGovVerifiedRecord(null); setGovError(null); }}
                          placeholder="e.g. UP20248849201"
                          className={`${inputClass} font-mono uppercase`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#262238] mb-1.5">Khasra Number *</label>
                        <input
                          type="text" required value={khasraNumber}
                          onChange={(e) => { setKhasraNumber(e.target.value); setGovVerifiedRecord(null); setGovError(null); }}
                          placeholder="e.g. 142/2A"
                          className={`${inputClass} font-mono`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLiveGovVerify}
                      disabled={govVerifying || (!pmKisanId.trim() && !khasraNumber.trim())}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-[#262238] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1A1729] transition disabled:opacity-50 cursor-pointer"
                    >
                      {govVerifying ? (
                        <>
                          <RotateCw className="h-4 w-4 animate-spin" />
                          <span>Connecting to UP Bhulekh & PM-KISAN...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 text-[#718A68]" />
                          <span>Verify with Government Registry</span>
                        </>
                      )}
                    </button>

                    {govVerifiedRecord && (
                      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-3.5 text-xs space-y-2 animate-calm-reveal">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                            <span>Verified: {govVerifiedRecord.beneficiary_name}</span>
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900">
                            {govVerifiedRecord.pfms_status || "Aadhaar Seeded"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800 pt-1.5 border-t border-emerald-200/50">
                          <div><span className="text-emerald-950 font-medium">Village: </span>{govVerifiedRecord.village}, {govVerifiedRecord.tehsil}</div>
                          <div><span className="text-emerald-950 font-medium">Area: </span>{govVerifiedRecord.land_size_acres} Acres</div>
                          <div><span className="text-emerald-950 font-medium">Khasra: </span>{govVerifiedRecord.khasra_number}</div>
                          <div><span className="text-emerald-950 font-medium">Registry: </span>UP Bhulekh RoR</div>
                        </div>
                        <div className="text-[9px] font-mono text-emerald-700 pt-0.5 flex items-center justify-between">
                          <span>Seal: {govVerifiedRecord.government_seal}</span>
                          <span>✓ Live Gov Response</span>
                        </div>
                      </div>
                    )}

                    {govError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-start gap-2 animate-calm-reveal">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold">Government Registry Check Failed</strong>
                          <span className="text-[11px] text-red-700 block mt-0.5">{govError}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Location Picker */}
                <div className="rounded-2xl border border-[#E4E2DD] bg-white p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#262238] flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#718A68]" />
                      <span>{role === "buyer" ? "Delivery Dock" : "Farm Location"}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLocationPicker(true)}
                      className="text-xs font-medium text-[#718A68] hover:underline flex items-center gap-1 bg-[#E3EBE0]/40 px-2.5 py-1 rounded-full border border-[#E3EBE0] cursor-pointer"
                    >
                      <span>🗺️ Set on Map</span>
                    </button>
                  </div>
                  <input
                    type="text" required value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bakshi Ka Talab, Lucknow"
                    className={`${inputClass} !rounded-xl`}
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#737184]">
                    <span className="font-mono">📍 GPS: <strong className="text-[#262238]">{geoLat.toFixed(4)}, {geoLng.toFixed(4)}</strong></span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${geoLat},${geoLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#718A68] hover:underline"
                    >
                      Verify on Maps &rarr;
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#262238] mb-1.5">
                    {role === "buyer" ? "Organization Name (Optional)" : "Farm / FPO Name (Optional)"}
                  </label>
                  <input
                    type="text" value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={role === "buyer" ? "e.g. Green Valley Kitchens" : "e.g. Malihabad Mango Growers FPO"}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* Username & Password */}
            <div>
              <label className="block text-xs font-medium text-[#262238] mb-1.5">Username</label>
              <input
                type="text" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === "login" ? "Enter your username" : "Choose username (e.g. ramesh_kisan)"}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262238] mb-1.5">Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#262238] py-3 text-sm font-semibold text-white hover:bg-[#1A1729] transition-all shadow-sm disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                <span>{loading ? "Processing..." : mode === "register" ? "Join FarmLink Network" : "Sign In"}</span>
                <ArrowRight className="h-4 w-4 text-[#718A68]" />
              </button>
            </div>
          </form>
        </div>

        {/* Location Confirmation Modal */}
        <LocationPickerModal
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onConfirmLocation={(loc: LocationData) => {
            setLocation(loc.address);
            setGeoLat(loc.lat);
            setGeoLng(loc.lng);
          }}
          initialLocation={{
            address: location,
            lat: geoLat,
            lng: geoLng,
          }}
          role={role}
          title={role === "buyer" ? "Confirm Delivery Dock on Google Maps" : "Confirm Farm Gate on Google Maps"}
        />
      </div>
    </div>
  );
}
