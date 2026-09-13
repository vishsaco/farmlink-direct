"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17201D]/75 p-3 sm:p-5 backdrop-blur-sm animate-calm-reveal">
      <div className="relative w-full max-w-4xl rounded-3xl border border-[#E8E8E3] bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Left Panel: Authentic Indian Agriculture Photography & Editorial Brand Ethos */}
        <div className="hidden md:flex md:w-5/12 bg-[#173D32] relative flex-col justify-between p-8 text-white overflow-hidden">
          {/* Background Photography with Natural Light and Earth Tones */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-103 opacity-40 mix-blend-overlay"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1000&auto=format&fit=crop&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2820] via-[#173D32]/90 to-[#173D32]/80" />

          {/* Top Branding in Left Panel */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-[#DCE8DD]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C99B43]" />
              <span>Lucknow Regional Cluster</span>
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl font-normal leading-tight text-white">
              Direct markets built for better harvest decisions.
            </h2>
            <p className="text-xs text-[#DCE8DD]/90 leading-relaxed font-sans">
              Connecting 1,200+ verified farmers and FPOs with transparent APMC benchmarks and weather-aware fulfillment.
            </p>
          </div>

          {/* Bottom Trust Micro-Cards */}
          <div className="relative z-10 space-y-2 pt-6 border-t border-white/15">
            <div className="flex items-center gap-2 text-xs text-[#DCE8DD]">
              <ShieldCheck className="h-4 w-4 text-[#C99B43] shrink-0" />
              <span>Zero broker cut · Farm-gate escrow</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#DCE8DD]">
              <CloudSun className="h-4 w-4 text-[#BFD8E5] shrink-0" />
              <span>Weather-synchronized dispatch routing</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Clean Form Experience */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 overflow-y-auto bg-[#F7F5EF]/40 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-[#576561] hover:bg-[#E8E8E3]/60 hover:text-[#17201D] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Header */}
          <div className="pr-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#DCE8DD]/70 text-[#173D32] text-[10px] font-mono uppercase font-semibold mb-2">
              FarmLink Verification
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#17201D] font-normal tracking-tight">
              {mode === "register" ? "Welcome to FarmLink" : "Welcome Back"}
            </h3>
            <p className="text-xs text-[#576561] mt-1 font-sans">
              {mode === "register"
                ? "Join a direct market built for transparent prices and harvest planning."
                : "Sign in to access your farm, market orders, and logistics terminal."}
            </p>

            {/* Mode Switch Pills */}
            <div className="mt-4 flex rounded-xl bg-[#E8E8E3]/60 p-1 border border-[#E8E8E3]">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
                  mode === "register"
                    ? "bg-white text-[#173D32] shadow-2xs"
                    : "text-[#576561] hover:text-[#17201D]"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
                  mode === "login"
                    ? "bg-white text-[#173D32] shadow-2xs"
                    : "text-[#576561] hover:text-[#17201D]"
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3.5 rounded-xl bg-[#F8ECE8] p-3 border border-[#C86B4A]/30 text-xs font-medium text-[#C86B4A]">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="mt-4">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#576561] mb-1.5">
              Select Stakeholder Role / खाता प्रकार
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
                    className={`rounded-xl border p-2 text-left text-xs transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-[#173D32] bg-[#DCE8DD]/40 text-[#173D32] ring-1 ring-[#173D32]/30 shadow-2xs"
                        : "border-[#E8E8E3] bg-white text-[#17201D] hover:border-[#D4D4CE]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className="h-3.5 w-3.5 text-[#173D32]" />
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-[#173D32]" />}
                    </div>
                    <span className="font-semibold text-[11px] leading-tight">{cfg.label}</span>
                    <span className="text-[9px] text-[#576561] line-clamp-1 mt-0.5">{cfg.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google SSO Container */}
          <div className="space-y-2 pt-3">
            <div className="flex justify-center min-h-[40px]" ref={googleBtnContainerRef} />

            {googleLoading && (
              <p className="text-center text-xs text-[#576561] animate-pulse font-medium">
                Verifying Google credentials...
              </p>
            )}

            <div className="relative flex items-center justify-center text-[10px] uppercase font-mono tracking-wider text-[#576561]/80">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E8E3]" />
              </div>
              <span className="relative bg-[#FAF9F5] px-3">or continue with credentials</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            {/* Name & Phone for Register */}
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-[#17201D] mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-xs font-normal text-[#17201D] focus:border-[#173D32] focus:outline-none transition shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#17201D] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Yadav"
                      className="w-full rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-xs font-normal text-[#17201D] focus:border-[#173D32] focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#17201D] mb-1">
                    Phone Number (OTP verification)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-xs font-normal text-[#17201D] focus:border-[#173D32] focus:outline-none transition shadow-2xs"
                  />
                </div>

                {/* Location Picker */}
                <div className="rounded-xl border border-[#E8E8E3] bg-white p-3 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-[#17201D] flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#173D32]" />
                      <span>{role === "buyer" ? "Delivery Receiving Dock" : "Farm Gate Location"}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLocationPicker(true)}
                      className="text-[11px] font-semibold text-[#173D32] hover:underline flex items-center gap-1 bg-[#DCE8DD]/40 px-2 py-0.5 rounded-lg border border-[#DCE8DD] cursor-pointer"
                    >
                      <span>🗺️ Set on Map</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bakshi Ka Talab, Lucknow"
                    className="w-full rounded-lg border border-[#E8E8E3] bg-[#F7F5EF]/50 px-2.5 py-1.5 text-xs font-semibold text-[#17201D] focus:border-[#173D32] focus:outline-none"
                  />

                  <div className="flex items-center justify-between text-[10px] text-[#576561] pt-0.5">
                    <span className="font-mono">
                      📍 GPS: <strong className="text-[#17201D]">{geoLat.toFixed(4)}, {geoLng.toFixed(4)}</strong>
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${geoLat},${geoLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#173D32] hover:underline"
                    >
                      Verify on Maps &rarr;
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#17201D] mb-1">
                    {role === "buyer" ? "Organization Name (Optional)" : "Farm / FPO Name (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={role === "buyer" ? "e.g. Green Valley Kitchens" : "e.g. Malihabad Mango Growers FPO"}
                    className="w-full rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-xs font-normal text-[#17201D] focus:border-[#173D32] focus:outline-none transition shadow-2xs"
                  />
                </div>
              </>
            )}

            {/* Username & Password */}
            <div>
              <label className="block text-[11px] font-medium text-[#17201D] mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === "login" ? "Enter your username" : "Choose username (e.g. ramesh_kisan)"}
                className="w-full rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-xs font-normal text-[#17201D] focus:border-[#173D32] focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#17201D] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-xs font-normal text-[#17201D] focus:border-[#173D32] focus:outline-none transition shadow-2xs"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#173D32] py-2.5 text-xs font-semibold text-white hover:bg-[#0F2820] transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-99"
              >
                <span>{loading ? "Processing..." : mode === "register" ? "Join FarmLink Network" : "Sign In to Terminal"}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#C99B43]" />
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
