"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/LanguageContext";
import { AuthModal } from "@/components/AuthModal";
import {
  Globe,
  ChevronDown,
  LogOut,
  MapPin,
  Sparkles,
  Menu,
  X,
  LogIn,
  UserPlus,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";

interface NavbarProps {
  lang?: "en" | "hi";
  onLanguageChange?: (lang: "en" | "hi") => void;
}

export function Navbar(props: NavbarProps) {
  const { lang, toggleLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const openAuth = (mode: "login" | "register") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    router.push("/");
  };

  const isPredictActive = pathname === "/predict";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-xs">
        {/* Top Financial Ticker: Live All-5 Lucknow Mandis Terminal Feed */}
        <div className="bg-[#064E3B] text-white px-3 sm:px-4 py-1.5 text-xs border-b border-emerald-950/30">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-300 shrink-0 text-[10px] sm:text-[11px] uppercase tracking-wider">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xs:inline">APMC FEED:</span>
              </div>

              {/* Continuous Financial Marquee Ribbon */}
              <div className="overflow-hidden flex-1">
                <div className="animate-ticker-smooth text-[11px] font-mono text-emerald-100/90 flex items-center gap-6">
                  <span className="flex items-center gap-1">
                    <span className="text-slate-300">Dubagga APMC (Tomato):</span>
                    <strong className="text-white">₹40.4/kg</strong>
                    <span className="text-emerald-400 font-bold text-[10px]">▲ +9.4%</span>
                  </span>
                  <span className="text-emerald-500">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-slate-300">Sitapur Rd (Onion):</span>
                    <strong className="text-white">₹30.0/kg</strong>
                    <span className="text-emerald-400 font-bold text-[10px]">▲ +6.7%</span>
                  </span>
                  <span className="text-emerald-500">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-slate-300">Malihabad (Dussehri Mango):</span>
                    <strong className="text-white">₹65.0/kg</strong>
                    <span className="text-emerald-400 font-bold text-[10px]">▲ +21.5%</span>
                  </span>
                  <span className="text-emerald-500">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-slate-300">Mohanlalganj (Potato):</span>
                    <strong className="text-white">₹24.0/kg</strong>
                    <span className="text-emerald-400 font-bold text-[10px]">▲ +12.5%</span>
                  </span>
                  <span className="text-emerald-500">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-slate-300">BKT Feeder (Spinach):</span>
                    <strong className="text-white">₹22.0/kg</strong>
                    <span className="text-rose-300 font-bold text-[10px]">▼ -9.1%</span>
                  </span>
                  <span className="text-emerald-500">•</span>
                  <span className="flex items-center gap-1 text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    <span>0% Broker Cut • Farm-Gate Escrow Settlement</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-emerald-200 shrink-0 font-mono">
              <span className="hidden md:inline agri-stamp border-emerald-400/40 text-emerald-300 bg-emerald-950/40">
                LUCKNOW CLUSTER v4.0
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          {/* Left: Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center transition-transform duration-150 group-hover:scale-102">
              <img
                src="/logo.png"
                alt="FarmLink Direct"
                className="h-8 sm:h-9 w-auto object-contain max-w-[160px] sm:max-w-[185px]"
              />
            </div>
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-600" />
                <span>Lucknow Agro-Commodity Terminal</span>
              </p>
            </div>
          </Link>

          {/* Center: ONLY Market Predictor Tab */}
          <nav className="hidden md:flex items-center">
            <Link
              href="/predict"
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                isPredictActive
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs ring-1 ring-emerald-400/30"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200"
              }`}
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>{lang === "hi" ? "🔮 बाज़ार पूर्वानुमान (Market Predictor)" : "🔮 Market Predictor"}</span>
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Real Instant Language Switch Button */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-xs active:scale-95 cursor-pointer"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span>{lang === "en" ? "हिन्दी" : "English"}</span>
            </button>

            {/* Authentication: Logged Out vs Logged In */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-500" />
                  <span>{t.signIn}</span>
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer active:scale-98"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{t.register}</span>
                </button>
              </div>
            ) : (
              /* User Profile Menu */
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                    {user.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline font-bold">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase border border-emerald-200">
                    {user.role}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-50 text-slate-800 animate-calm-reveal">
                    <div className="border-b border-slate-100 pb-2.5 mb-2">
                      <p className="font-bold text-sm text-slate-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{user.phone}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase border border-emerald-200">
                          Role: {user.role}
                        </span>
                        {user.organization_detail?.location && (
                          <span className="text-[10px] text-slate-500 truncate">
                            • {user.organization_detail.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href={`/${user.role === "ops" ? "ops" : user.role}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <span>My Dashboard ({user.role.toUpperCase()})</span>
                        <span className="text-slate-400 text-[10px]">&rarr;</span>
                      </Link>

                      <Link
                        href="/predict"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3" />
                          <span>Market Predictor</span>
                        </span>
                        <span className="text-emerald-700 text-[10px]">&rarr;</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition border-t border-slate-100 mt-1 pt-2 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{t.logOut}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-lg animate-calm-reveal">
            <Link
              href="/predict"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-3 text-xs font-bold text-emerald-800 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>{lang === "hi" ? "बाज़ार पूर्वानुमान (Market Predictor)" : "Market Predictor"}</span>
              </div>
              <span className="text-emerald-700 font-bold">&rarr;</span>
            </Link>

            {!user ? (
              <div className="pt-2 border-t border-slate-200 flex gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="flex-1 rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-800 text-center border border-slate-200 hover:bg-slate-200"
                >
                  {t.signIn}
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white text-center hover:bg-emerald-700 shadow-xs"
                >
                  {t.register}
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-rose-50 py-2.5 text-xs font-bold text-rose-600 text-center border border-rose-200 hover:bg-rose-100"
                >
                  {t.logOut} ({user.first_name})
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Real Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
}
