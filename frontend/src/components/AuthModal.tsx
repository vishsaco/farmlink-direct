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
  Navigation,
  ExternalLink,
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
    { id: "driver", label: "Fleet Driver", icon: Truck, desc: "Tata Ace fulfillment" },
    { id: "ops", label: "Ops Coordinator", icon: ShieldAlert, desc: "Control tower" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-calm-reveal">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 text-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header & Mode Switch */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center bg-slate-50 p-1 rounded-md border border-slate-200">
              <img
                src="/logo.png"
                alt="FarmLink Direct"
                className="h-7 w-auto object-contain"
              />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Verified B2B Direct
            </span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            {mode === "register" ? "Join the Agricultural Network" : "Welcome Back"}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === "register"
              ? "Create your verified account for the Lucknow Regional Cluster."
              : "Sign in with your registered account credentials."}
          </p>

          <div className="mt-3.5 flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
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
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 p-3 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Role Selector Card */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
            Select Your Role / खाता प्रकार
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
                  className={`rounded-xl border p-2.5 text-left text-xs transition flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600 shadow-xs"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="h-4 w-4 text-emerald-700" />
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />}
                  </div>
                  <span className="font-bold">{cfg.label}</span>
                  <span className="text-[9px] text-slate-500 line-clamp-1">{cfg.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real Official Google Authentication */}
        <div className="space-y-2.5 pt-0.5">
          <div className="flex justify-center min-h-[40px]" ref={googleBtnContainerRef} />

          {googleLoading && (
            <p className="text-center text-xs text-slate-500 animate-pulse font-medium">
              Verifying Google credentials...
            </p>
          )}

          <div className="relative flex items-center justify-center text-[10px] uppercase font-bold text-slate-400">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3">or continue with password</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name & Phone for Register */}
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Vikas"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Yadav"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Interactive Google Maps & GPS Location Picker */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {role === "buyer" ? "Delivery Receiving Dock" : "Farm Gate Location"}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs"
                  >
                    <span>🗺️ Choose on Map</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bakshi Ka Talab, Lucknow"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="font-mono">
                    📍 GPS: <strong className="text-slate-800">{geoLat}, {geoLng}</strong>
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${geoLat},${geoLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Check Maps &rarr;</span>
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {role === "buyer" ? "Business / Organization (Optional)" : "Farm Name (Optional)"}
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder={role === "buyer" ? "e.g. Lucknow Fresh Mart" : "e.g. Vikas Organic Produce Farm"}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Username & Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === "login" ? "Enter your username" : "Choose username (e.g. vikas_kisan)"}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-1.5">
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Processing..." : mode === "register" ? "Register & Enter Portal" : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Real Location Confirmation Modal */}
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
