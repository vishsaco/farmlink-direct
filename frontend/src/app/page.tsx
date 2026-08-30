"use client";

import React from "react";
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
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ArrowUpRight,
  Receipt,
  Building,
  ShieldAlert,
  Navigation2,
  Compass,
  Activity,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const PORTAL_CARDS = [
    {
      id: "predict",
      title: lang === "hi" ? "बाज़ार पूर्वानुमान एवं फसल सलाह" : "Produce Market Predictor & AI Advisory",
      role: lang === "hi" ? "पूर्वानुमान इंजन" : "Predictive Intelligence",
      description: lang === "hi"
        ? "7 और 14 दिनों के भाव का सही अनुमान, फसल रोकने बनाम बेचने की सलाह और लाइव कमाई सिमुलेटर।"
        : "7 & 14-day APMC price forecasting, hold vs sell harvest timing advice, and batch payout simulator.",
      href: "/predict",
      icon: Sparkles,
      badge: lang === "hi" ? "एआई पावर्ड" : "AI Powered",
      badgeColor: "bg-[#C99B43] text-[#17201D]",
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
      badgeColor: "bg-[#173D32] text-white",
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
      badgeColor: "bg-[#173D32] text-white",
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
      badgeColor: "bg-[#173D32] text-white",
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
      badgeColor: "bg-[#173D32] text-white",
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
      badgeColor: "bg-[#173D32] text-white",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const LIVE_MANDI_FEEDS = [
    { mandi: "Dubagga Mandi", crop: "Tomato (टमाटर)", price: "₹38.0/kg", change: "+12% Direct Gain" },
    { mandi: "Sitapur Road Mandi", crop: "Onion (प्याज)", price: "₹30.0/kg", change: "+9% Direct Gain" },
    { mandi: "Naveen Mandi Sthal", crop: "Potato (आलू)", price: "₹24.0/kg", change: "+14% Direct Gain" },
    { mandi: "Malihabad Hub", crop: "Dussehri Mango", price: "₹65.0/kg", change: "+18% Direct Gain" },
    { mandi: "Bakshi Ka Talab", crop: "Green Chilli", price: "₹48.0/kg", change: "+11% Direct Gain" },
    { mandi: "Dubagga Mandi", crop: "Tomato (टमाटर)", price: "₹38.0/kg", change: "+12% Direct Gain" },
    { mandi: "Sitapur Road Mandi", crop: "Onion (प्याज)", price: "₹30.0/kg", change: "+9% Direct Gain" },
    { mandi: "Naveen Mandi Sthal", crop: "Potato (आलू)", price: "₹24.0/kg", change: "+14% Direct Gain" },
    { mandi: "Malihabad Hub", crop: "Dussehri Mango", price: "₹65.0/kg", change: "+18% Direct Gain" },
    { mandi: "Bakshi Ka Talab", crop: "Green Chilli", price: "₹48.0/kg", change: "+11% Direct Gain" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#17201D] flex flex-col selection:bg-[#DCE8DD] selection:text-[#173D32]">
      {/* Floating Navbar */}
      <Navbar />

      {/* 0. CALM CONTINUOUS MANDI TICKER STRIP */}
      <div className="bg-[#0f2720] border-b border-white/10 py-2.5 overflow-hidden shadow-inner">
        <div className="flex items-center">
          <div className="bg-[#0f2720] z-10 px-4 flex items-center gap-1.5 font-bold text-[#C99B43] uppercase text-[10px] tracking-wider shrink-0 border-r border-white/10 shadow-md">
            <Zap className="h-3.5 w-3.5 fill-[#C99B43]" />
            <span>Lucknow Live Mandi Feed:</span>
          </div>

          <div className="overflow-hidden flex-1">
            <div className="animate-ticker-smooth text-xs text-[#DCE8DD] flex items-center gap-8 pl-4">
              {LIVE_MANDI_FEEDS.map((feed, i) => (
                <span key={i} className="flex items-center gap-2 shrink-0">
                  <span className="text-white font-bold">{feed.crop}:</span>
                  <span className="font-mono text-[#FAF9F5]">{feed.price}</span>
                  <span className="rounded-full bg-[#DCE8DD]/20 px-2 py-0.5 text-[9px] font-bold text-[#C99B43] border border-[#C99B43]/30">
                    {feed.change}
                  </span>
                  <span className="text-white/20 ml-2">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 1. HIGH-CONTRAST EDITORIAL HERO SECTION */}
      <section className="relative bg-[#0F2720] text-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#C99B43]/20 map-contour-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: High-Contrast Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C99B43]/40 bg-[#C99B43]/15 px-3.5 py-1 text-xs font-bold text-[#C99B43] backdrop-blur-md">
                <Compass className="h-3.5 w-3.5" />
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
                {t.heroTitleLine1} <br />
                <span className="italic font-light text-[#DCE8DD]">{t.heroTitleLine2}</span>
              </h1>

              <p className="text-sm sm:text-base text-[#DCE8DD]/90 font-light leading-relaxed max-w-xl">
                {t.heroSubtitle}
              </p>

              {/* Primary Call To Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/predict"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#C99B43] px-7 py-3.5 text-xs font-bold text-[#17201D] hover:bg-[#d8a84b] transition-all shadow-lg hover:scale-102 active:scale-98"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{lang === "hi" ? "फसल भाव का सही अनुमान लगाएं 🔮" : "Produce Market Predictor 🔮"}</span>
                </Link>

                <Link
                  href="/buyer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  <ShoppingBag className="h-4 w-4 text-[#C99B43]" />
                  <span>{lang === "hi" ? "ताज़ी फसलें खरीदें" : "Browse Fresh Marketplace"}</span>
                </Link>
              </div>

              {/* Thin Warm-Gold Feature Line & Badges */}
              <div className="pt-6 border-t border-[#C99B43]/20 flex flex-wrap items-center gap-6 text-xs text-[#DCE8DD]/80">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#C99B43]" />
                  <span>12 Lucknow Agri Zones</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#C99B43]" />
                  <span>Digital Escrow Payments</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#C99B43]" />
                  <span>Direct GPS Farm Logistics</span>
                </span>
              </div>
            </div>

            {/* Right Column: ONE Sharp, Pristine Real Agricultural Image Frame */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#C99B43]/30 bg-[#173D32] shadow-2xl group">
                <div className="relative h-72 sm:h-96 w-full">
                  <img
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1200&auto=format&fit=crop&q=85"
                    alt="Fresh produce harvest in Lucknow"
                    className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2720] via-transparent to-transparent opacity-80" />
                </div>

                {/* Overlay Editorial Stat Card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-[#0F2720]/90 p-3.5 backdrop-blur-md flex items-center justify-between text-xs">
                  <div>
                    <span className="rounded-full bg-[#C99B43] px-2 py-0.5 text-[9px] font-bold text-[#17201D] uppercase">
                      Live APMC Benchmark
                    </span>
                    <p className="font-bold text-white text-sm mt-1">Lucknow Cluster • 0% Broker Cut</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#DCE8DD]/70 block">Farmer Extra Net</span>
                    <span className="font-serif text-lg font-bold text-[#C99B43]">+22.4%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. RECTANGULAR EDITORIAL DASHBOARDS GRID (16px Radius) */}
      <section className="py-16 bg-[#FAF9F5] border-b border-[#E9E7E1] map-contour-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E9E7E1] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#173D32]">
                {t.dashboardShowcaseTag}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#17201D] mt-1">
                {t.dashboardShowcaseTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#7D8A65] mt-1 max-w-2xl font-light">
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
                  className="editorial-card p-6 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                      <div className="h-8 w-8 rounded-lg bg-[#FAF9F5] border border-[#E9E7E1] flex items-center justify-center text-[#173D32] group-hover:border-[#C99B43] transition">
                        <Icon className="h-4 w-4 text-[#173D32]" />
                      </div>
                    </div>

                    <div className="relative h-40 w-full rounded-xl overflow-hidden bg-[#FAF9F5] border border-[#E9E7E1]">
                      <img
                        src={portal.image}
                        alt={portal.title}
                        className="h-full w-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-[#7D8A65] uppercase tracking-wider block">
                        {portal.role}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#17201D] mt-0.5">
                        {portal.title}
                      </h3>
                    </div>

                    <p className="text-xs text-[#7D8A65] font-light leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  <div className="border-t border-[#E9E7E1] pt-4">
                    <Link
                      href={portal.href}
                      className="flex items-center justify-between rounded-xl bg-[#FAF9F5] hover:bg-[#DCE8DD] border border-[#E9E7E1] px-4 py-2.5 text-xs font-bold text-[#173D32] transition group-hover:border-[#173D32]/30"
                    >
                      <span>{lang === "hi" ? "पोर्टल में प्रवेश करें" : `Enter ${portal.role}`}</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECTURE & LOGISTICS TRUST PILLARS */}
      <section className="py-16 bg-[#173D32] text-[#FAF9F5] border-b border-[#C99B43]/20 map-contour-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl border-b border-[#C99B43]/20 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99B43]">
              {lang === "hi" ? "तकनीक एवं बुनियादी ढांचा" : "SYSTEM ARCHITECTURE"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              {t.techTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#DCE8DD]/80 mt-2 font-light">
              {t.techSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-[#C99B43]/40 transition">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43] border border-[#C99B43]/30">
                <Navigation2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.featureGmapsTitle}</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                {t.featureGmapsDesc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-[#C99B43]/40 transition">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43] border border-[#C99B43]/30">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.featureGpsTitle}</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                {t.featureGpsDesc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-[#C99B43]/40 transition">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43] border border-[#C99B43]/30">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.featurePoolingTitle}</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                {t.featurePoolingDesc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-[#C99B43]/40 transition">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43] border border-[#C99B43]/30">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.featureSettlementsTitle}</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                {t.featureSettlementsDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="border-t border-[#E9E7E1] bg-[#0F2720] text-[#FAF9F5] py-8 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
              <img
                src="/logo.png"
                alt="FarmLink Direct"
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="text-[#C99B43]">·</span>
            <span className="text-[#DCE8DD]/80 font-medium">Better markets for every harvest.</span>
          </div>
          <div className="text-[#DCE8DD]/60">
            Smart India Hackathon (SIH) 26033 • Whole Lucknow Regional Agri-Cluster
          </div>
        </div>
      </footer>
    </div>
  );
}
