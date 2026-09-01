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
  Award,
  Scale,
} from "lucide-react";

export default function HomePage() {
  const { lang, t } = useLanguage();
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
      badgeColor: "border-emerald-600/40 text-emerald-800 bg-emerald-50",
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
      badgeColor: "border-emerald-600/40 text-emerald-800 bg-emerald-50",
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
      badgeColor: "border-emerald-600/40 text-emerald-800 bg-emerald-50",
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
      badgeColor: "border-emerald-600/40 text-emerald-800 bg-emerald-50",
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
      badgeColor: "border-emerald-600/40 text-emerald-800 bg-emerald-50",
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
      badgeColor: "border-emerald-600/40 text-emerald-800 bg-emerald-50",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Floating Navbar */}
      <Navbar />

      {/* 1. HIGH-CONTRAST FOREST GREEN HERO SECTION WITH ANTIQUE GOLD CONTOUR ACCENTS */}
      <section className="relative bg-[#064E3B] text-white pt-10 pb-16 lg:pt-14 lg:pb-20 border-b border-emerald-950/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: High-Contrast Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-200">
                <Compass className="h-3.5 w-3.5 text-emerald-300" />
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {t.heroTitleLine1} <br />
                <span className="text-emerald-200 font-normal">{t.heroTitleLine2}</span>
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 font-normal leading-relaxed max-w-xl">
                {t.heroSubtitle}
              </p>

              {/* Primary Call To Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/predict"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-600 transition-all shadow-md active:scale-98"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{lang === "hi" ? "फसल भाव का सही अनुमान लगाएं 🔮" : "Produce Market Predictor 🔮"}</span>
                </Link>

                <Link
                  href="/buyer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-all"
                >
                  <ShoppingBag className="h-4 w-4 text-emerald-300" />
                  <span>{lang === "hi" ? "ताज़ी फसलें खरीदें" : "Browse Fresh Marketplace"}</span>
                </Link>
              </div>

              {/* Trust Credentials Strip */}
              <div className="pt-5 border-t border-emerald-600/30 flex flex-wrap items-center gap-6 text-xs text-emerald-100/90 font-medium font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>12 Lucknow Agri Zones</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>0% Middleman Deduction</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>E-NAM Escrow Audited</span>
                </span>
              </div>
            </div>

            {/* Right Column: Sharp Real Agricultural Image Frame with Crate Stamp Overlay */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-600/40 bg-[#064E3B] shadow-2xl group">
                <div className="relative h-72 sm:h-96 w-full">
                  <img
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1200&auto=format&fit=crop&q=85"
                    alt="Fresh produce harvest in Lucknow"
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B]/85 via-transparent to-transparent" />
                </div>

                {/* Physical Lot Stamp Header */}
                <div className="absolute top-4 left-4">
                  <span className="agri-stamp bg-[#064E3B]/90 text-emerald-200 border-emerald-400/50 backdrop-blur-xs">
                    APMC LOT #UP-LK-2026
                  </span>
                </div>

                {/* Overlay Stat Card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-md flex items-center justify-between text-xs text-slate-800">
                  <div>
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                      Live APMC Benchmark
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-1">Lucknow Cluster • 0% Broker Cut</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-500 block">Farmer Extra Net</span>
                    <span className="text-lg font-bold text-emerald-700">+22.4%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. RECTANGULAR EDITORIAL DASHBOARDS GRID */}
      <section className="py-14 bg-[#FAFAF8] border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                {t.dashboardShowcaseTag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                {t.dashboardShowcaseTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
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
                  className="editorial-card p-5 flex flex-col justify-between space-y-4 group bg-white"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`agri-stamp ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                      <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-700 group-hover:border-emerald-300 transition">
                        <Icon className="h-4 w-4 text-emerald-700" />
                      </div>
                    </div>

                    <div className="relative h-40 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={portal.image}
                        alt={portal.title}
                        className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                        {portal.role}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5 tracking-tight">
                        {portal.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <Link
                      href={portal.href}
                      className="flex items-center justify-between rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3.5 py-2 text-xs font-bold text-slate-800 hover:text-emerald-800 transition cursor-pointer"
                    >
                      <span>{lang === "hi" ? "पोर्टल में प्रवेश करें" : `Enter ${portal.role}`}</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-emerald-700" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECTURE & LOGISTICS TRUST PILLARS */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              {lang === "hi" ? "तकनीक एवं बुनियादी ढांचा" : "SYSTEM ARCHITECTURE & TRUST"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              {t.techTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
              {t.techSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 hover:border-emerald-300 transition">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Navigation2 className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t.featureGmapsTitle}</h3>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                {t.featureGmapsDesc}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 hover:border-emerald-300 transition">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t.featureGpsTitle}</h3>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                {t.featureGpsDesc}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 hover:border-emerald-300 transition">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Building className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t.featurePoolingTitle}</h3>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                {t.featurePoolingDesc}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 hover:border-emerald-300 transition">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Receipt className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t.featureSettlementsTitle}</h3>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                {t.featureSettlementsDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="border-t border-slate-200 bg-[#064E3B] text-slate-200 py-8 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md">
              <img
                src="/logo.png"
                alt="FarmLink Direct"
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="text-emerald-400">·</span>
            <span className="text-emerald-100 font-medium">Direct B2B Fresh Produce Platform</span>
          </div>
          <div className="text-emerald-200/80 font-mono text-[11px]">
            Smart India Hackathon (SIH) 26033 • Lucknow Regional Agri-Cluster
          </div>
        </div>
      </footer>
    </div>
  );
}
