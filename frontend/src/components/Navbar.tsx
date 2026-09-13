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
  ShieldCheck,
  CloudSun,
  ShoppingBag,
  Sprout,
  Building,
  Truck,
  ShieldAlert,
  ArrowRight,
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#E8E8E3] transition-all">
        {/* Slim Top Regional Utility Bar: APMC Live Mandi Pulse */}
        <div className="bg-[#173D32] text-white px-3 sm:px-6 py-1.5 text-xs border-b border-[#0F2820]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <div className="flex items-center gap-1.5 font-mono font-medium text-[#DCE8DD] shrink-0 text-[10px] sm:text-[11px] uppercase tracking-wider">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#C99B43] animate-pulse" />
                <span className="hidden xs:inline text-white/90">LUCKNOW APMC:</span>
              </div>

              {/* Continuous Calm Scrolling Ribbon */}
              <div className="overflow-hidden flex-1">
                <div className="animate-ticker-smooth text-[11px] font-mono text-[#DCE8DD]/90 flex items-center gap-6">
                  <span className="flex items-center gap-1">
                    <span className="text-[#BFD8E5]/90">Dubagga APMC (Tomato):</span>
                    <strong className="text-white font-medium">₹40.4/kg</strong>
                    <span className="text-[#DCE8DD] font-semibold text-[10px]">▲ +9.4% · Rain-sensitive</span>
                  </span>
                  <span className="text-[#235445]">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[#BFD8E5]/90">Sitapur Rd (Onion):</span>
                    <strong className="text-white font-medium">₹30.0/kg</strong>
                    <span className="text-[#DCE8DD] font-semibold text-[10px]">▲ +6.7% · Stable</span>
                  </span>
                  <span className="text-[#235445]">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[#BFD8E5]/90">Malihabad (Dussehri Mango):</span>
                    <strong className="text-white font-medium">₹65.0/kg</strong>
                    <span className="text-[#C99B43] font-semibold text-[10px]">▲ +21.5% · Harvest Window</span>
                  </span>
                  <span className="text-[#235445]">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[#BFD8E5]/90">Mohanlalganj (Potato):</span>
                    <strong className="text-white font-medium">₹24.0/kg</strong>
                    <span className="text-[#DCE8DD] font-semibold text-[10px]">▲ +12.5%</span>
                  </span>
                  <span className="text-[#235445]">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[#BFD8E5]/90">BKT Feeder (Spinach):</span>
                    <strong className="text-white font-medium">₹22.0/kg</strong>
                    <span className="text-[#C86B4A] font-semibold text-[10px]">▼ -9.1% · High Humidity</span>
                  </span>
                  <span className="text-[#235445]">•</span>
                  <span className="flex items-center gap-1 text-[#DCE8DD]">
                    <ShieldCheck className="h-3 w-3 text-[#C99B43]" />
                    <span>Direct Farm-Gate Escrow · Zero Brokerage</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-[#DCE8DD] shrink-0 font-mono">
              <span className="hidden sm:inline px-2 py-0.5 rounded border border-[#235445] bg-[#0F2820]/70 text-[#C99B43]">
                LUCKNOW CLUSTER
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2.5">
              {/* Bespoke FarmLink Leaf-Link Geometry SVG */}
              <div className="h-9 w-9 rounded-xl bg-[#173D32] flex items-center justify-center text-white shadow-xs border border-[#173D32]/40 transition-transform group-hover:scale-103">
                <svg className="h-5 w-5 text-[#DCE8DD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#C99B43" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-tight text-[#173D32] font-normal leading-none">
                  Farm<span className="text-[#C99B43]">Link</span>
                </span>
                <span className="text-[10px] font-sans tracking-wide text-[#576561] font-medium mt-0.5">
                  Direct Produce Network
                </span>
              </div>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              href="/buyer"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isBuyerActive
                  ? "bg-[#DCE8DD] text-[#173D32] font-semibold"
                  : "text-[#17201D] hover:bg-[#E8E8E3]/60 hover:text-[#173D32]"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5 text-[#173D32]" />
              <span>{lang === "hi" ? "मंडी बाज़ार (Marketplace)" : "Marketplace"}</span>
            </Link>

            <Link
              href="/predict"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isPredictActive
                  ? "bg-[#DCE8DD] text-[#173D32] font-semibold"
                  : "text-[#17201D] hover:bg-[#E8E8E3]/60 hover:text-[#173D32]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C99B43]" />
              <span>{lang === "hi" ? "बाज़ार पूर्वानुमान" : "Market Predictor"}</span>
            </Link>

            {/* Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                onBlur={() => setTimeout(() => setPortalsDropdownOpen(false), 200)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  isFarmerActive || isFpoActive || isDriverActive || isOpsActive
                    ? "bg-[#DCE8DD] text-[#173D32] font-semibold"
                    : "text-[#17201D] hover:bg-[#E8E8E3]/60 hover:text-[#173D32]"
                }`}
              >
                <span>{lang === "hi" ? "पोर्टल" : "Portals"}</span>
                <ChevronDown className={`h-3 w-3 text-[#576561] transition-transform ${portalsDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {portalsDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-60 rounded-2xl border border-[#E8E8E3] bg-white p-2 shadow-lg z-50 animate-calm-reveal">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#576561] border-b border-[#E8E8E3]/70 mb-1">
                    Stakeholder Workspaces
                  </div>
                  <Link
                    href="/farmer"
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#17201D] hover:bg-[#F7F5EF] hover:text-[#173D32] transition"
                  >
                    <div className="h-7 w-7 rounded-lg bg-[#DCE8DD]/70 flex items-center justify-center text-[#173D32] shrink-0">
                      <Sprout className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#17201D]">Farmer Portal</div>
                      <div className="text-[10px] text-[#576561]">Harvest listing & farm payouts</div>
                    </div>
                  </Link>

                  <Link
                    href="/fpo"
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#17201D] hover:bg-[#F7F5EF] hover:text-[#173D32] transition"
                  >
                    <div className="h-7 w-7 rounded-lg bg-[#BFD8E5]/50 flex items-center justify-center text-[#173D32] shrink-0">
                      <Building className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#17201D]">FPO Aggregator Hub</div>
                      <div className="text-[10px] text-[#576561]">Cluster lots & pooled supply</div>
                    </div>
                  </Link>

                  <Link
                    href="/driver"
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#17201D] hover:bg-[#F7F5EF] hover:text-[#173D32] transition"
                  >
                    <div className="h-7 w-7 rounded-lg bg-[#DCE8DD]/70 flex items-center justify-center text-[#173D32] shrink-0">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#17201D]">Fleet Dispatch</div>
                      <div className="text-[10px] text-[#576561]">Weather routes & farm pickup</div>
                    </div>
                  </Link>

                  <Link
                    href="/ops"
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#17201D] hover:bg-[#F7F5EF] hover:text-[#173D32] transition"
                  >
                    <div className="h-7 w-7 rounded-lg bg-[#F7F0E2] flex items-center justify-center text-[#C99B43] shrink-0">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#17201D]">Operations Tower</div>
                      <div className="text-[10px] text-[#576561]">Escrow & exception control</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Weather Intelligence Micro-Chip */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-[11px] font-sans font-medium text-[#173D32] bg-[#DCE8DD]/50 border border-[#DCE8DD] rounded-full">
              <CloudSun className="h-3.5 w-3.5 text-[#173D32]" />
              <span>Malihabad: 26°C · Clear harvest window</span>
            </div>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Language Switch Button */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border border-[#E8E8E3] bg-white text-[#17201D] hover:bg-[#F7F5EF] transition shadow-2xs active:scale-98 cursor-pointer"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="h-3.5 w-3.5 text-[#173D32]" />
              <span>{lang === "en" ? "हिन्दी" : "English"}</span>
            </button>

            {/* Authentication: Logged Out vs Logged In */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#17201D] hover:bg-[#E8E8E3]/60 transition cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5 text-[#576561]" />
                  <span>{t.signIn}</span>
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#C99B43] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#B88B35] transition shadow-xs cursor-pointer active:scale-98"
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
                  className="flex items-center gap-2 rounded-lg border border-[#E8E8E3] bg-white px-3 py-1.5 text-xs font-medium text-[#17201D] hover:bg-[#F7F5EF] transition shadow-2xs cursor-pointer"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#173D32] text-white font-bold text-[10px]">
                    {user.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline font-semibold">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="rounded bg-[#DCE8DD] px-1.5 py-0.2 text-[10px] font-bold text-[#173D32] uppercase border border-[#173D32]/20">
                    {user.role}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#576561]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E8E8E3] bg-white p-3 shadow-lg z-50 text-[#17201D] animate-calm-reveal">
                    <div className="border-b border-[#E8E8E3] pb-2.5 mb-2">
                      <p className="font-serif text-sm font-normal text-[#17201D]">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-[#576561]">@{user.username}</p>
                      <p className="text-[11px] text-[#576561] mt-0.5">{user.phone}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="rounded-md bg-[#DCE8DD] px-2 py-0.5 text-[10px] font-bold text-[#173D32] uppercase">
                          Role: {user.role}
                        </span>
                        {user.organization_detail?.location && (
                          <span className="text-[10px] text-[#576561] truncate">
                            • {user.organization_detail.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href={`/${user.role === "ops" ? "ops" : user.role}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-[#17201D] hover:bg-[#F7F5EF] transition"
                      >
                        <span>My Dashboard ({user.role.toUpperCase()})</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#576561]" />
                      </Link>

                      <Link
                        href="/predict"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-[#173D32] hover:bg-[#DCE8DD]/40 transition"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-[#C99B43]" />
                          <span>Market Predictor</span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#173D32]" />
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#C86B4A] hover:bg-[#F8ECE8] transition border-t border-[#E8E8E3] mt-1 pt-2 cursor-pointer"
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
              className="md:hidden rounded-lg p-2 text-[#17201D] hover:bg-[#E8E8E3]/60 transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F7F5EF] border-t border-[#E8E8E3] px-4 py-4 space-y-2.5 shadow-lg animate-calm-reveal">
            <Link
              href="/buyer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-white border border-[#E8E8E3] px-3.5 py-2.5 text-xs font-medium text-[#17201D]"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#173D32]" />
                <span>Marketplace (Produce Lots)</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#576561]" />
            </Link>

            <Link
              href="/predict"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-[#DCE8DD]/60 border border-[#DCE8DD] px-3.5 py-2.5 text-xs font-semibold text-[#173D32]"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#C99B43]" />
                <span>{lang === "hi" ? "बाज़ार पूर्वानुमान (Market Predictor)" : "Market Predictor"}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#173D32]" />
            </Link>

            <div className="pt-2 border-t border-[#E8E8E3]/80">
              <div className="text-[10px] font-mono uppercase text-[#576561] px-1 mb-1.5">Direct Portals</div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/farmer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-white border border-[#E8E8E3] p-2 text-xs font-medium text-[#17201D]"
                >
                  <Sprout className="h-3.5 w-3.5 text-[#173D32]" />
                  <span>Farmer</span>
                </Link>
                <Link
                  href="/fpo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-white border border-[#E8E8E3] p-2 text-xs font-medium text-[#17201D]"
                >
                  <Building className="h-3.5 w-3.5 text-[#173D32]" />
                  <span>FPO Hub</span>
                </Link>
                <Link
                  href="/driver"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-white border border-[#E8E8E3] p-2 text-xs font-medium text-[#17201D]"
                >
                  <Truck className="h-3.5 w-3.5 text-[#173D32]" />
                  <span>Fleet Dispatch</span>
                </Link>
                <Link
                  href="/ops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-white border border-[#E8E8E3] p-2 text-xs font-medium text-[#17201D]"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-[#C99B43]" />
                  <span>Ops Control</span>
                </Link>
              </div>
            </div>

            {!user ? (
              <div className="pt-2 border-t border-[#E8E8E3] flex gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="flex-1 rounded-xl bg-white py-2.5 text-xs font-medium text-[#17201D] text-center border border-[#E8E8E3]"
                >
                  {t.signIn}
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="flex-1 rounded-xl bg-[#C99B43] py-2.5 text-xs font-semibold text-white text-center shadow-xs"
                >
                  {t.register}
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#E8E8E3]">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-[#F8ECE8] py-2.5 text-xs font-semibold text-[#C86B4A] text-center border border-[#C86B4A]/30"
                >
                  {t.logOut} ({user.first_name})
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal with Split Editorial Layout */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
}
