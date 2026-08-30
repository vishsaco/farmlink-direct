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

  // Load Google Identity Services Script and Render Native Official Button
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
              shape: "pill",
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

      // Navigate to corresponding persona portal
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
    { id: "fpo", label: "FPO Aggregator", icon: Sprout, desc: "Manage member farms" },
    { id: "buyer", label: "Bulk Buyer", icon: ShoppingBag, desc: "Kitchens & retailers" },
    { id: "driver", label: "Fleet Driver", icon: Truck, desc: "Tata Ace fulfillment" },
    { id: "ops", label: "Ops Coordinator", icon: ShieldAlert, desc: "Control tower" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17201D]/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#E9E7E1] bg-[#FFFFFF] p-6 sm:p-8 shadow-2xl space-y-6 text-[#17201D] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#7D8A65] hover:bg-[#F7F5EF] hover:text-[#17201D] transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header & Mode Switch */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center bg-[#F7F5EF] p-1.5 rounded-xl border border-[#E9E7E1]">
              <img
                src="/logo.png"
                alt="FarmLink Direct"
                className="h-8 w-auto object-contain"
              />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C99B43] bg-[#C99B43]/15 px-2.5 py-1 rounded-full border border-[#C99B43]/30">
              Verified B2B Direct
            </span>
          </div>

          <h3 className="font-serif text-2xl font-bold text-[#17201D]">
            {mode === "register" ? "Join the Agricultural Network" : "Welcome Back"}
          </h3>
          <p className="text-xs text-[#7D8A65] mt-1 font-light">
            {mode === "register"
              ? "Create your verified real account for the Lucknow Agri-Cluster."
              : "Sign in with your registered account credentials."}
          </p>

          <div className="mt-4 flex rounded-full bg-[#F7F5EF] p-1 border border-[#E9E7E1]">
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 rounded-full py-1.5 text-xs font-bold transition ${
                mode === "register"
                  ? "bg-[#173D32] text-white shadow-sm"
                  : "text-[#7D8A65] hover:text-[#17201D]"
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
              className={`flex-1 rounded-full py-1.5 text-xs font-bold transition ${
                mode === "login"
                  ? "bg-[#173D32] text-white shadow-sm"
                  : "text-[#7D8A65] hover:text-[#17201D]"
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-[#C86B4A]/10 p-3.5 border border-[#C86B4A]/30 text-xs font-semibold text-[#C86B4A]">
            {error}
          </div>
        )}

        {/* Role Selector Card */}
        <div>
          <label className="block text-xs font-semibold text-[#17201D] mb-1.5">
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
                      ? "border-[#173D32] bg-[#DCE8DD]/40 text-[#173D32] ring-2 ring-[#173D32]/20"
                      : "border-[#E9E7E1] bg-[#F7F5EF] text-[#17201D] hover:border-[#173D32]/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="h-4 w-4 text-[#173D32]" />
                    {isSelected && <CheckCircle2 className="h-3 w-3 text-[#173D32]" />}
                  </div>
                  <span className="font-bold">{cfg.label}</span>
                  <span className="text-[9px] text-[#7D8A65] line-clamp-1">{cfg.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real Official Google Authentication */}
        <div className="space-y-3 pt-1">
          {/* Native Official Google GSI Button Container */}
          <div className="flex justify-center min-h-[44px]" ref={googleBtnContainerRef} />

          {googleLoading && (
            <p className="text-center text-xs text-[#7D8A65] animate-pulse font-medium">
              Verifying Google credentials...
            </p>
          )}

          <div className="relative flex items-center justify-center text-[10px] uppercase font-bold text-[#7D8A65]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E9E7E1]" />
            </div>
            <span className="relative bg-white px-3">or continue with password</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Phone for Register */}
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17201D] mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Vikas"
                    className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs font-medium focus:bg-white focus:border-[#173D32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17201D] mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Yadav"
                    className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs font-medium focus:bg-white focus:border-[#173D32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17201D] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs font-medium focus:bg-white focus:border-[#173D32] focus:outline-none"
                />
              </div>

              {/* Interactive Google Maps & GPS Location Picker */}
              <div className="rounded-2xl border border-[#E9E7E1] bg-[#F7F5EF] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#17201D] flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#C99B43]" />
                    <span>
                      {role === "buyer" ? "Delivery Receiving Dock Location" : "Farm Gate Pickup Location"}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="text-[11px] font-bold text-[#173D32] hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[#E9E7E1] shadow-xs"
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
                  className="w-full rounded-xl border border-[#E9E7E1] bg-white px-3 py-2 text-xs font-bold text-[#17201D] focus:border-[#173D32] focus:outline-none"
                />

                <div className="flex items-center justify-between text-[11px] text-[#7D8A65] pt-0.5">
                  <span className="font-mono">
                    📍 GPS: <strong className="text-[#17201D]">{geoLat}, {geoLng}</strong>
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${geoLat},${geoLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#173D32] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Check Google Maps</span>
                    <ExternalLink className="h-2.5 w-2.5 text-[#C99B43]" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17201D] mb-1">
                  {role === "buyer" ? "Business / Company Name (Optional)" : "Farm Name or Organization (Optional)"}
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder={role === "buyer" ? "e.g. Lucknow Fresh Mart" : "e.g. Vikas Organic Produce Farm"}
                  className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs font-medium focus:bg-white focus:border-[#173D32] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Username & Password */}
          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === "login" ? "Enter your username" : "Choose unique username (e.g. vikas_kisan)"}
              className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-xs font-medium focus:bg-white focus:border-[#173D32] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-xs font-medium focus:bg-white focus:border-[#173D32] focus:outline-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#173D32] py-3.5 text-xs font-bold text-white hover:bg-[#215445] transition-all shadow-md disabled:opacity-50"
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
