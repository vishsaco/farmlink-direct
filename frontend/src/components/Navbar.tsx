"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/LanguageContext";
import { AuthModal } from "@/components/AuthModal";
import { api } from "@/lib/api";
import {
  Globe,
  ChevronDown,
  LogOut,
  Sparkles,
  Menu,
  X,
  LogIn,
  UserPlus,
  ShoppingBag,
  Sprout,
  Building,
  Truck,
  ShieldAlert,
  ArrowRight,
  CloudSun,
  TrendingUp,
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
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.healthCheck().catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  const isBuyerActive = pathname === "/buyer";
  const isFarmerActive = pathname === "/farmer";
  const isFpoActive = pathname === "/fpo";
  const isDriverActive = pathname === "/driver";
  const isOpsActive = pathname === "/ops";
  const isHomePage = pathname === "/";

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isHomePage ? "px-4 sm:px-6 pt-3" : ""
        }`}
      >
        <div
          className={`transition-all duration-300 ${
            isHomePage
              ? `mx-auto max-w-[1320px] rounded-[20px] ${
                  scrolled
                    ? "bg-white/80 backdrop-blur-xl shadow-lg border border-[#E4E2DD]/60"
                    : "bg-white/60 backdrop-blur-md border border-[#E4E2DD]/40"
                }`
              : `${
                  scrolled
                    ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-[#E4E2DD]"
                    : "bg-[#F6F5F1]/95 backdrop-blur-md border-b border-[#E4E2DD]"
                }`
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
            {/* Left: Brand Identity */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="h-9 w-9 rounded-2xl bg-[#262238] flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-sm">
                <svg className="h-5 w-5 text-[#E8E4F2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#718A68" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg tracking-tight text-[#262238] font-medium leading-none">
                  Farm<span className="text-[#718A68]">Link</span>
                </span>
                <span className="text-[10px] font-sans tracking-wide text-[#737184] font-medium mt-0.5 hidden sm:inline">
                  Direct Produce Network
                </span>
              </div>
            </Link>

            {/* Center Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link
                href="/buyer"
                className={`px-4 py-2 text-[13px] font-medium rounded-full transition-all ${
                  isBuyerActive
                    ? "bg-[#E8E4F2] text-[#262238]"
                    : "text-[#737184] hover:text-[#262238] hover:bg-[#F6F5F1]"
                }`}
              >
                Marketplace
              </Link>

              {/* Farmer Hub - Only shown after logging in as a farmer */}
              {user && user.role === "farmer" && (
                <Link
                  href="/farmer"
                  className={`px-4 py-2 text-[13px] font-medium rounded-full transition-all ${
                    isFarmerActive
                      ? "bg-[#E8E4F2] text-[#262238]"
                      : "text-[#737184] hover:text-[#262238] hover:bg-[#F6F5F1]"
                  }`}
                >
                  Farmer Hub
                </Link>
              )}

              <Link
                href="/predict"
                className={`px-4 py-2 text-[13px] font-medium rounded-full transition-all ${
                  isPredictActive
                    ? "bg-[#E8E4F2] text-[#262238]"
                    : "text-[#737184] hover:text-[#262238] hover:bg-[#F6F5F1]"
                }`}
              >
                Insights
              </Link>

              {/* Portals Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                  onBlur={() => setTimeout(() => setPortalsDropdownOpen(false), 200)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-full transition-all cursor-pointer ${
                    isFpoActive || isDriverActive || isOpsActive
                      ? "bg-[#E8E4F2] text-[#262238]"
                      : "text-[#737184] hover:text-[#262238] hover:bg-[#F6F5F1]"
                  }`}
                >
                  <span>Portals</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${portalsDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {portalsDropdownOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-3xl border border-[#E4E2DD] bg-white p-3 shadow-xl z-50 animate-calm-reveal">
                    <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-[#737184]">
                      Workspaces
                    </div>

                    <Link
                      href="/fpo"
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-[#262238] hover:bg-[#F6F5F1] transition"
                    >
                      <div className="h-8 w-8 rounded-xl bg-[#E8E4F2] flex items-center justify-center text-[#262238] shrink-0">
                        <Building className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-[13px]">FPO Aggregator</div>
                        <div className="text-[11px] text-[#737184]">Cluster lots & pooled supply</div>
                      </div>
                    </Link>

                    <Link
                      href="/driver"
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-[#262238] hover:bg-[#F6F5F1] transition"
                    >
                      <div className="h-8 w-8 rounded-xl bg-[#E3EBE0] flex items-center justify-center text-[#718A68] shrink-0">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-[13px]">Fleet Dispatch</div>
                        <div className="text-[11px] text-[#737184]">Routes & farm pickup</div>
                      </div>
                    </Link>

                    <Link
                      href="/ops"
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-[#262238] hover:bg-[#F6F5F1] transition"
                    >
                      <div className="h-8 w-8 rounded-xl bg-[#F8ECE8] flex items-center justify-center text-[#C86B4A] shrink-0">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-[13px]">Operations Tower</div>
                        <div className="text-[11px] text-[#737184]">Settlement & control</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Language Switch */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#737184] hover:text-[#262238] hover:bg-[#F6F5F1] transition cursor-pointer"
                title="Switch Language"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === "en" ? "हिन्दी" : "EN"}</span>
              </button>

              {/* Authentication */}
              {!user ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openAuth("login")}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-[#262238] hover:bg-[#F6F5F1] transition cursor-pointer"
                  >
                    {t.signIn}
                  </button>
                  <button
                    onClick={() => openAuth("register")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#262238] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#1A1729] transition shadow-sm cursor-pointer active:scale-[0.98]"
                  >
                    <span>Get Started</span>
                  </button>
                </div>
              ) : (
                /* User Profile Menu */
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-[#E4E2DD] bg-white px-3 py-1.5 text-xs font-medium text-[#262238] hover:border-[#D4CEE8] transition shadow-sm cursor-pointer"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#262238] text-white font-semibold text-[10px]">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="hidden sm:inline font-medium text-[13px]">
                      {user.first_name}
                    </span>
                    <span className="rounded-full bg-[#E8E4F2] px-2 py-0.5 text-[10px] font-semibold text-[#262238] uppercase">
                      {user.role}
                    </span>
                    <ChevronDown className="h-3 w-3 text-[#737184]" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-[#E4E2DD] bg-white p-4 shadow-xl z-50 animate-calm-reveal">
                      <div className="border-b border-[#E4E2DD] pb-3 mb-3">
                        <p className="font-heading text-sm font-medium text-[#262238]">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-[#737184]">@{user.username}</p>
                        <p className="text-[11px] text-[#737184] mt-0.5">{user.phone}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="rounded-full bg-[#E8E4F2] px-2.5 py-0.5 text-[10px] font-semibold text-[#262238] uppercase">
                            {user.role}
                          </span>
                          {user.organization_detail?.location && (
                            <span className="text-[10px] text-[#737184] truncate">
                              • {user.organization_detail.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link
                          href={`/${user.role === "ops" ? "ops" : user.role}`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-[13px] font-medium text-[#262238] hover:bg-[#F6F5F1] transition"
                        >
                          <span>My Dashboard</span>
                          <ArrowRight className="h-3.5 w-3.5 text-[#737184]" />
                        </Link>

                        <Link
                          href="/predict"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-[13px] font-medium text-[#718A68] hover:bg-[#E3EBE0]/40 transition"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Market Predictor</span>
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-semibold text-[#C86B4A] hover:bg-[#F8ECE8] transition border-t border-[#E4E2DD] mt-1 pt-2 cursor-pointer"
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
                className="lg:hidden rounded-full p-2 text-[#262238] hover:bg-[#F6F5F1] transition cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-[#E4E2DD] px-5 py-5 space-y-2 animate-calm-reveal rounded-b-[20px]">
              <Link
                href="/buyer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-2xl bg-[#F6F5F1] px-4 py-3 text-[13px] font-medium text-[#262238]"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 text-[#718A68]" />
                  <span>Marketplace</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#737184]" />
              </Link>

              {user && user.role === "farmer" && (
                <Link
                  href="/farmer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl bg-[#F6F5F1] px-4 py-3 text-[13px] font-medium text-[#262238]"
                >
                  <div className="flex items-center gap-2.5">
                    <Sprout className="h-4 w-4 text-[#718A68]" />
                    <span>Farmer Hub</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#737184]" />
                </Link>
              )}

              <Link
                href="/predict"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-2xl bg-[#E8E4F2]/60 px-4 py-3 text-[13px] font-semibold text-[#262238]"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-[#718A68]" />
                  <span>Market Predictor</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#262238]" />
              </Link>

              <div className="pt-2 border-t border-[#E4E2DD]">
                <div className="text-[10px] font-medium uppercase text-[#737184] px-1 mb-2 tracking-wider">Portals</div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/fpo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-2xl bg-[#F6F5F1] p-3 text-[13px] font-medium text-[#262238]"
                  >
                    <Building className="h-4 w-4 text-[#262238]" />
                    <span>FPO Hub</span>
                  </Link>
                  <Link
                    href="/driver"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-2xl bg-[#F6F5F1] p-3 text-[13px] font-medium text-[#262238]"
                  >
                    <Truck className="h-4 w-4 text-[#718A68]" />
                    <span>Fleet</span>
                  </Link>
                  <Link
                    href="/ops"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-2xl bg-[#F6F5F1] p-3 text-[13px] font-medium text-[#262238]"
                  >
                    <ShieldAlert className="h-4 w-4 text-[#C86B4A]" />
                    <span>Ops</span>
                  </Link>
                  <Link
                    href="/buyer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-2xl bg-[#F6F5F1] p-3 text-[13px] font-medium text-[#262238]"
                  >
                    <ShoppingBag className="h-4 w-4 text-[#262238]" />
                    <span>Buyer</span>
                  </Link>
                </div>
              </div>

              {!user ? (
                <div className="pt-3 border-t border-[#E4E2DD] flex gap-2">
                  <button
                    onClick={() => openAuth("login")}
                    className="flex-1 rounded-full bg-[#F6F5F1] py-2.5 text-[13px] font-medium text-[#262238] text-center border border-[#E4E2DD] cursor-pointer"
                  >
                    {t.signIn}
                  </button>
                  <button
                    onClick={() => openAuth("register")}
                    className="flex-1 rounded-full bg-[#262238] py-2.5 text-[13px] font-semibold text-white text-center shadow-sm cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-[#E4E2DD]">
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-full bg-[#F8ECE8] py-2.5 text-[13px] font-semibold text-[#C86B4A] text-center cursor-pointer"
                  >
                    {t.logOut} ({user.first_name})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
}
