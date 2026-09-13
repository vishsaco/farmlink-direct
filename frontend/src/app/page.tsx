"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/LanguageContext";
import { Navbar } from "@/components/Navbar";
import {
  Sprout,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Lock,
  Building,
  ShieldAlert,
  Navigation2,
  Compass,
  CloudSun,
  Calendar,
  CloudRain,
  Coins,
} from "lucide-react";

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [countTemp, setCountTemp] = useState(0);

  useEffect(() => {
    let cur = 0;
    const interval = setInterval(() => {
      cur += 2;
      if (cur >= 24) {
        setCountTemp(24);
        clearInterval(interval);
      } else {
        setCountTemp(cur);
      }
    }, 28);
    return () => clearInterval(interval);
  }, []);
  const { user } = useAuth();
  const router = useRouter();

  const PORTAL_CARDS = [
    {
      id: "predict",
      title: lang === "hi" ? "बाज़ार पूर्वानुमान एवं फसल सलाह" : "Produce Market Predictor & Action Engine",
      role: lang === "hi" ? "पूर्वानुमान इंजन" : "Predictive Intelligence",
      description: lang === "hi"
        ? "7 और 14 दिनों के भाव का सही अनुमान, फसल रोकने बनाम बेचने की सलाह और लाइव कमाई सिमुलेटर।"
        : "7 & 14-day APMC price forecasting, Holt-Winters ML models, hold vs sell harvest advice, and batch payout simulator.",
      href: "/predict",
      icon: Sparkles,
      badge: lang === "hi" ? "कोर प्रिडिक्टर" : "Core ML Predictor v4.0",
      badgeColor: "border-[#C99B43]/50 text-[#C99B43] bg-[#F7F0E2]",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "farmer",
      title: t.farmerTitle,
      role: t.farmerRole,
      description: t.farmerDesc,
      href: "/farmer",
      icon: Sprout,
      badge: t.farmerBadge,
      badgeColor: "border-[#173D32]/40 text-[#173D32] bg-[#DCE8DD]",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "buyer",
      title: t.buyerTitle,
      role: t.buyerRole,
      description: t.buyerDesc,
      href: "/buyer",
      icon: ShoppingBag,
      badge: t.buyerBadge,
      badgeColor: "border-[#173D32]/40 text-[#173D32] bg-[#DCE8DD]",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "fpo",
      title: t.fpoTitle,
      role: t.fpoRole,
      description: t.fpoDesc,
      href: "/fpo",
      icon: Building,
      badge: t.fpoBadge,
      badgeColor: "border-[#173D32]/40 text-[#173D32] bg-[#DCE8DD]",
      image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "driver",
      title: t.driverTitle,
      role: t.driverRole,
      description: t.driverDesc,
      href: "/driver",
      icon: Truck,
      badge: t.driverBadge,
      badgeColor: "border-[#173D32]/40 text-[#173D32] bg-[#DCE8DD]",
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "ops",
      title: t.opsTitle,
      role: t.opsRole,
      description: t.opsDesc,
      href: "/ops",
      icon: ShieldAlert,
      badge: t.opsBadge,
      badgeColor: "border-[#C86B4A]/40 text-[#C86B4A] bg-[#F8ECE8]",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col selection:bg-[#DCE8DD] selection:text-[#173D32]">
      {/* Refined Floating Navbar */}
      <Navbar />

      {/* 1. EDITORIAL HERO SECTION WITH SERIF TYPOGRAPHY & FLOATING AGRO-WEATHER CARD */}
      <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-[#E8E8E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: High-Contrast Editorial Messaging & Primary CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#173D32]/20 bg-[#DCE8DD]/70 px-3.5 py-1 text-xs font-semibold text-[#173D32] animate-badge-entrance">
                <Compass className="h-3.5 w-3.5 text-[#173D32]" />
                <span>{lang === "hi" ? "लखनऊ का सीधा कृषि नेटवर्क" : "Lucknow's Direct Produce Network"}</span>
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#17201D] leading-[1.12]">
                  <span className="block animate-fade-in-up" style={{ animationDelay: "0ms" }}>
                    {t.heroTitleLine1 || "Better markets"}
                  </span>
                  <span className="block animate-fade-in-up italic text-[#173D32]" style={{ animationDelay: "120ms" }}>
                    {t.heroTitleLine2 || "for every harvest."}
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#576561] font-sans font-normal leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: "220ms" }}>
                  FarmLink connects verified farmers, FPOs, and institutional buyers with transparent prices, weather-aware harvest planning, and <span className="animate-underline-draw font-semibold text-[#173D32]">verifiable</span> fulfillment across Lucknow.
                </p>
              </div>

              {/* Primary Call To Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <Link
                  href="/predict"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#173D32] px-6 py-3.5 text-xs font-semibold text-white hover:bg-[#0F2820] hover:-translate-y-[1px] hover:shadow-md transition-all duration-200 shadow-xs active:scale-98"
                >
                  <Sparkles className="h-4 w-4 text-[#C99B43]" />
                  <span>{lang === "hi" ? "फसल भाव का सही अनुमान लगाएं 🔮" : "Produce Market Predictor 🔮"}</span>
                </Link>

                <Link
                  href="/buyer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#E8E8E3] bg-white px-5 py-3.5 text-xs font-semibold text-[#17201D] hover:bg-white hover:border-[#173D32]/35 hover:-translate-y-[1px] hover:shadow-xs transition-all duration-200 shadow-2xs"
                >
                  <ShoppingBag className="h-4 w-4 text-[#173D32]" />
                  <span>{lang === "hi" ? "ताज़ी फसलें खरीदें" : "Browse Fresh Marketplace"}</span>
                </Link>
              </div>

              {/* Trust Credentials Strip */}
              <div className="pt-5 border-t border-[#E8E8E3] flex flex-wrap items-center gap-6 text-xs text-[#576561] font-medium font-mono animate-fade-in-up" style={{ animationDelay: "360ms" }}>
                <span className="flex items-center gap-1.5 group cursor-default">
                  <CheckCircle2 className="h-4 w-4 text-[#173D32] transition-transform duration-200 group-hover:scale-110" />
                  <span>Verified FPOs</span>
                </span>
                <span className="flex items-center gap-1.5 group cursor-default">
                  <CheckCircle2 className="h-4 w-4 text-[#173D32] transition-transform duration-200 group-hover:scale-110" />
                  <span>Weather-aware planning</span>
                </span>
                <span className="flex items-center gap-1.5 group cursor-default">
                  <CheckCircle2 className="h-4 w-4 text-[#173D32] transition-transform duration-200 group-hover:scale-110" />
                  <span>Traceable fulfillment</span>
                </span>
              </div>
            </div>

            {/* Right Column: Authentic Agriculture Photography Frame + Weather Insight Card */}
            <div className="lg:col-span-5 relative">
              {/* Faint Animated Topographic Background Lines */}
              <div className="absolute -inset-4 opacity-[0.04] pointer-events-none hero-contour-drift overflow-hidden">
                <svg className="w-full h-full text-[#173D32]" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M-50,200 Q100,50 250,220 T500,180" />
                  <path d="M-30,240 Q120,90 270,260 T520,220" />
                  <path d="M-10,280 Q140,130 290,300 T540,260" />
                </svg>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-[#E8E8E3] bg-white shadow-xl group">
                <div className="relative h-80 sm:h-96 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1200&auto=format&fit=crop&q=85"
                    alt="Authentic Indian fresh produce sorting in Lucknow"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                  />
                  {/* Subtle One-Time Shimmer across tomato photography */}
                  <div className="animate-shimmer-once" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17201D]/75 via-transparent to-transparent" />
                </div>

                {/* Top Agricultural Lot Stamp */}
                <div className="absolute top-4 left-4">
                  <span className="agri-stamp bg-[#173D32]/90 text-[#DCE8DD] border-[#DCE8DD]/40 backdrop-blur-xs">
                    APMC LOT #UP-LK-2026
                  </span>
                </div>

                {/* Floating Weather Insight Card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[#E8E8E3] bg-white/95 backdrop-blur-md p-4 shadow-lg text-xs text-[#17201D] space-y-2 animate-fade-in-up" style={{ animationDelay: "280ms" }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-[#173D32]">
                      <CloudSun className="h-4 w-4 text-[#C99B43] animate-sun-flare" />
                      <span>Tomorrow's Farm Outlook</span>
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-[#173D32] bg-[#DCE8DD] px-2 py-0.5 rounded-md transition-all">
                      {countTemp}°C · Light rain after 2 PM
                    </span>
                  </div>
                  <p className="text-[11px] text-[#576561] leading-relaxed animate-fade-in-up" style={{ animationDelay: "450ms" }}>
                    <strong>Recommended:</strong> Schedule tomato pickup from Malihabad before noon to avoid transit moisture delays.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS: 5-STEP REFINED WORKFLOW */}
      <section className="py-14 bg-white border-b border-[#E8E8E3] relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="max-w-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-[#173D32] font-semibold">
                The FarmLink Sequence
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#17201D] font-normal tracking-tight mt-1">
                How produce moves from soil to market
              </h2>
            </div>
            <span className="text-xs font-mono text-[#576561] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#173D32]" />
              Farmer → FPO → Buyer → Delivery → Settlement
            </span>
          </div>

          {/* Sequential Route Connection Line on Desktop */}
          <div className="relative hidden lg:block px-8 py-2">
            <svg className="w-full h-4 overflow-visible" viewBox="0 0 1000 16" fill="none">
              {/* Background Guideline */}
              <line x1="20" y1="8" x2="980" y2="8" stroke="#E8E8E3" strokeWidth="2" strokeDasharray="4 4" />
              {/* Animated Progress Line */}
              <line
                x1="20"
                y1="8"
                x2="980"
                y2="8"
                stroke="#173D32"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-line-draw"
                style={{ strokeDasharray: "960", strokeDashoffset: "960" }}
              />
              {/* Waypoint Nodes */}
              {[20, 260, 500, 740, 980].map((cx, idx) => (
                <circle
                  key={idx}
                  cx={cx}
                  cy="8"
                  r="5"
                  className="fill-[#F7F5EF] stroke-[#173D32] stroke-2"
                />
              ))}
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "01", title: "List Harvest", desc: "Farmer or FPO records crop, grade, and harvest date." },
              { num: "02", title: "Match with Buyer", desc: "Commercial kitchens reserve lots at transparent APMC rates." },
              { num: "03", title: "Plan by Weather", desc: "Harvest-window and rainfall forecasts reduce spoilage risk." },
              { num: "04", title: "Pickup & Deliver", desc: "GPS-optimized fleet dispatches with live proof of loading." },
              { num: "05", title: "Settlement Ready", desc: "Instant escrow disbursement directly to bank accounts." },
            ].map((step, idx) => (
              <div
                key={step.num}
                className="p-5 rounded-2xl bg-[#F7F5EF]/60 border border-[#E8E8E3] space-y-2.5 editorial-card-interactive transition-all"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl text-[#C99B43] block leading-none font-normal">
                    {step.num}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#173D32]/30" />
                </div>
                <h3 className="font-semibold text-xs text-[#17201D]">{step.title}</h3>
                <p className="text-[11px] text-[#576561] leading-relaxed font-sans">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. STAKEHOLDER PORTALS & WORKSPACES */}
      <section className="py-14 bg-[#F7F5EF] border-b border-[#E8E8E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#E8E8E3] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#173D32] font-mono">
                {t.dashboardShowcaseTag}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#17201D] font-normal tracking-tight mt-1">
                {t.dashboardShowcaseTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#576561] mt-0.5 max-w-2xl font-sans">
                {t.dashboardShowcaseSubtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PORTAL_CARDS.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.id}
                  className="editorial-card-interactive p-5 flex flex-col justify-between space-y-4 group bg-white rounded-2xl border border-[#E8E8E3]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`agri-stamp ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                      <div className="h-8 w-8 rounded-xl bg-[#F7F5EF] border border-[#E8E8E3] flex items-center justify-center text-[#173D32] group-hover:border-[#173D32]/30 transition">
                        <Icon className="h-4 w-4 text-[#173D32]" />
                      </div>
                    </div>

                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#F7F5EF] border border-[#E8E8E3]">
                      <img
                        src={portal.image}
                        alt={portal.title}
                        className="photo-zoom h-full w-full object-cover"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-semibold text-[#173D32] uppercase tracking-wider block">
                        {portal.role}
                      </span>
                      <h3 className="font-serif text-lg text-[#17201D] font-normal mt-0.5 tracking-tight">
                        {portal.title}
                      </h3>
                    </div>

                    <p className="text-xs text-[#576561] font-sans font-normal leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  <div className="border-t border-[#E8E8E3] pt-3">
                    <Link
                      href={portal.href}
                      className="flex items-center justify-between rounded-xl bg-[#F7F5EF] hover:bg-[#DCE8DD]/50 border border-[#E8E8E3] px-3.5 py-2 text-xs font-semibold text-[#17201D] hover:text-[#173D32] transition cursor-pointer"
                    >
                      <span>{lang === "hi" ? "पोर्टल में प्रवेश करें" : `Enter ${portal.role}`}</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-[#173D32]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CORE ARCHITECTURE & LOGISTICS TRUST PILLARS */}
      <section className="py-14 bg-white border-b border-[#E8E8E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl border-b border-[#E8E8E3] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#173D32] font-mono">
              {lang === "hi" ? "तकनीक एवं बुनियादी ढांचा" : "SYSTEM ARCHITECTURE & TRUST"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#17201D] font-normal tracking-tight mt-1">
              {t.techTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#576561] mt-1 font-normal font-sans">
              {t.techSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#F7F5EF]/60 border border-[#E8E8E3] space-y-2.5 hover:border-[#173D32]/30 transition">
              <div className="h-9 w-9 rounded-xl bg-[#DCE8DD] flex items-center justify-center text-[#173D32]">
                <Navigation2 className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-semibold text-[#17201D]">{t.featureGmapsTitle}</h3>
              <p className="text-xs text-[#576561] font-sans font-normal leading-relaxed">
                {t.featureGmapsDesc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F5EF]/60 border border-[#E8E8E3] space-y-2.5 hover:border-[#173D32]/30 transition">
              <div className="h-9 w-9 rounded-xl bg-[#DCE8DD] flex items-center justify-center text-[#173D32]">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-semibold text-[#17201D]">{t.featureGpsTitle}</h3>
              <p className="text-xs text-[#576561] font-sans font-normal leading-relaxed">
                {t.featureGpsDesc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F5EF]/60 border border-[#E8E8E3] space-y-2.5 hover:border-[#173D32]/30 transition">
              <div className="h-9 w-9 rounded-xl bg-[#DCE8DD] flex items-center justify-center text-[#173D32]">
                <Building className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-semibold text-[#17201D]">{t.featurePoolingTitle}</h3>
              <p className="text-xs text-[#576561] font-sans font-normal leading-relaxed">
                {t.featurePoolingDesc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F5EF]/60 border border-[#E8E8E3] space-y-2.5 hover:border-[#173D32]/30 transition">
              <div className="h-9 w-9 rounded-xl bg-[#DCE8DD] flex items-center justify-center text-[#173D32]">
                <Coins className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-semibold text-[#17201D]">{t.featureSettlementsTitle}</h3>
              <p className="text-xs text-[#576561] font-sans font-normal leading-relaxed">
                {t.featureSettlementsDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REFINED GROUNDING FOOTER */}
      <footer className="border-t border-[#0F2820] bg-[#173D32] text-[#DCE8DD] py-10 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#235445] pb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C99B43] border border-white/20">
                <Sprout className="h-4 w-4" />
              </div>
              <div>
                <span className="font-serif text-lg text-white">FarmLink</span>
                <p className="text-[11px] text-[#BFD8E5]">Direct B2B Fresh Produce Network</p>
              </div>
            </div>
            <div className="text-[#DCE8DD]/80 font-mono text-[11px]">
              Smart India Hackathon (SIH) 26033 • Lucknow Regional Agri-Cluster
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#DCE8DD]/70">
            <p>© 2026 FarmLink Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-4 font-mono">
              <span>APMC Dubagga</span>
              <span>•</span>
              <span>Malihabad Feeder</span>
              <span>•</span>
              <span>Sitapur Rd Hub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
