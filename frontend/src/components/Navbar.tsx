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
  Sprout,
  ShoppingBag,
  Truck,
  ShieldAlert,
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
  Building,
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

  // Clean Navigation: Market Predictor as primary showcase
  const getNavLinks = () => {
    const predictorLink = {
      label: lang === "hi" ? "🔮 बाज़ार पूर्वानुमान" : "🔮 Market Predictor",
      path: "/predict",
    };

    if (!user) {
      return [predictorLink];
    }

    switch (user.role) {
      case "farmer":
        return [
          { label: t.navFarmer, path: "/farmer" },
          predictorLink,
        ];
      case "fpo":
        return [
          { label: t.navFPO, path: "/fpo" },
          predictorLink,
        ];
      case "buyer":
        return [
          { label: t.navMarketplace, path: "/buyer" },
          predictorLink,
        ];
      case "driver":
        return [
          { label: t.navDriver, path: "/driver" },
          predictorLink,
        ];
      case "ops":
        return [
          { label: t.navOps, path: "/ops" },
          predictorLink,
        ];
      default:
        return [predictorLink];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#173D32] text-white border-b border-[#215445] shadow-lg">
        {/* Top Announcement Ribbon */}
        <div className="bg-[#0f2720] border-b border-white/10 px-4 py-1.5 text-[11px] text-[#DCE8DD]">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="flex h-2 w-2 rounded-full bg-[#C99B43] animate-pulse shrink-0" />
              <span className="font-semibold text-white whitespace-nowrap">{t.lucknowCluster}:</span>
              <span className="hidden sm:inline text-[#DCE8DD]/80 truncate">
                {t.clusterTicker}
              </span>
            </div>

            <div className="flex items-center gap-3 font-semibold text-xs shrink-0">
              <span className="text-[#C99B43]">{t.b2bDirectSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Left: Brand Identity with Official FarmLink Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center bg-white px-2.5 py-1 rounded-xl border border-white/20 shadow-md transition-transform duration-200 group-hover:scale-105">
              <img
                src="/logo.png"
                alt="FarmLink Direct"
                className="h-8 sm:h-9 w-auto object-contain max-w-[160px] sm:max-w-[190px]"
              />
            </div>
            <div className="hidden lg:block">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#C99B43] bg-[#C99B43]/15 px-2 py-0.5 rounded-full border border-[#C99B43]/30">
                  Direct B2B
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#DCE8DD]/80 flex items-center gap-1 mt-0.5">
                <MapPin className="h-2.5 w-2.5 text-[#C99B43]" />
                <span>Whole Lucknow Agri-Cluster</span>
              </p>
            </div>
          </Link>

          {/* Center: Role-Based Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0f2720]/80 p-1 rounded-full border border-white/10 backdrop-blur-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#C99B43] text-[#17201D] font-bold shadow-sm"
                      : "text-[#DCE8DD] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Real Instant Language Switch Button */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border border-white/25 bg-[#0f2720] text-white hover:bg-white/15 hover:border-[#C99B43] transition-all shadow-sm active:scale-95"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="h-3.5 w-3.5 text-[#C99B43]" />
              <span>{lang === "en" ? "हिन्दी" : "English"}</span>
            </button>

            {/* Authentication: Logged Out vs Logged In */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border border-white/20 bg-white/5 text-white hover:bg-white/15 transition"
                >
                  <LogIn className="h-3.5 w-3.5 text-[#C99B43]" />
                  <span>{t.signIn}</span>
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#C99B43] px-4 py-1.5 text-xs font-bold text-[#17201D] hover:bg-[#d8a94d] transition shadow-md"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{t.register}</span>
                </button>
              </div>
            ) : (
              /* Real User Profile Menu */
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-[#0f2720] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-all shadow-sm"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C99B43] text-[#17201D] font-bold text-[10px]">
                    {user.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline font-bold">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="rounded bg-[#DCE8DD] px-1.5 py-0.2 text-[9px] font-bold text-[#173D32] uppercase">
                    {user.role}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#DCE8DD]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E9E7E1] bg-[#FFFFFF] p-3 shadow-2xl z-50 text-[#17201D] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="border-b border-[#E9E7E1] pb-2.5 mb-2">
                      <p className="font-bold text-sm text-[#17201D]">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-[#7D8A65]">@{user.username}</p>
                      <p className="text-[11px] text-[#7D8A65] mt-0.5">{user.phone}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded-full bg-[#DCE8DD] px-2 py-0.5 text-[10px] font-bold text-[#173D32] uppercase">
                          Role: {user.role}
                        </span>
                        {user.organization_detail?.location && (
                          <span className="text-[10px] text-[#7D8A65] truncate">
                            • {user.organization_detail.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.path}
                          href={link.path}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-[#17201D] hover:bg-[#F7F5EF] transition"
                        >
                          <span>{link.label}</span>
                          <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-[#7D8A65]" />
                        </Link>
                      ))}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#C86B4A] hover:bg-[#C86B4A]/10 transition border-t border-[#E9E7E1] mt-1 pt-2"
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
              className="md:hidden rounded-lg p-2 text-white hover:bg-white/10 transition"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f2720] border-t border-white/10 px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            {!user ? (
              <div className="pt-2 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="flex-1 rounded-xl bg-white/10 py-2 text-xs font-bold text-white text-center"
                >
                  {t.signIn}
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="flex-1 rounded-xl bg-[#C99B43] py-2 text-xs font-bold text-[#17201D] text-center"
                >
                  {t.register}
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-white/10 py-2 text-xs font-bold text-[#C86B4A] text-center"
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
