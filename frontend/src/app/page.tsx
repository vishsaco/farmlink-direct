"use client";

import React, { useState } from "react";
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
      id: "fpo",
      title: t.fpoTitle,
      role: t.fpoRole,
      description: t.fpoDesc,
      href: "/fpo",
      icon: Building,
      badge: t.fpoBadge,
      badgeColor: "bg-[#C99B43] text-[#17201D]",
      image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80",
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
      id: "farmer",
      title: t.farmerTitle,
      role: t.farmerRole,
      description: t.farmerDesc,
      href: "/farmer",
      icon: Sprout,
      badge: t.farmerBadge,
      badgeColor: "bg-[#173D32] text-white",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
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
  ];

  const LIVE_MANDI_FEEDS = [
    { mandi: "Dubagga Mandi", crop: "Tomato (टमाटर)", price: "₹34.0/kg", change: "+12% Direct Gain" },
    { mandi: "Sitapur Road Mandi", crop: "Onion (प्याज)", price: "₹28.5/kg", change: "+9% Direct Gain" },
    { mandi: "Naveen Mandi Sthal", crop: "Potato (आलू)", price: "₹22.0/kg", change: "+14% Direct Gain" },
    { mandi: "Malihabad Hub", crop: "Dussehri Mango", price: "₹65.0/kg", change: "+18% Direct Gain" },
    { mandi: "Bakshi Ka Talab", crop: "Green Chilli", price: "₹48.0/kg", change: "+11% Direct Gain" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col selection:bg-[#DCE8DD] selection:text-[#173D32]">
      {/* Editorial Floating Navbar */}
      <Navbar />

      {/* Live Mandi Ticker Strip */}
      <div className="bg-[#0f2720] border-b border-white/10 py-2 px-4 overflow-x-auto shadow-inner">
        <div className="mx-auto max-w-7xl flex items-center gap-6 text-xs whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-bold text-[#C99B43] uppercase text-[10px] tracking-wider shrink-0">
            <Zap className="h-3.5 w-3.5 fill-[#C99B43]" />
            <span>Lucknow Live Mandi Benchmarks:</span>
          </span>
          <div className="flex items-center gap-6 text-xs text-[#DCE8DD]">
            {LIVE_MANDI_FEEDS.map((feed, i) => (
              <span key={i} className="flex items-center gap-1.5 font-medium">
                <span className="text-white font-bold">{feed.crop}:</span>
                <span>{feed.price}</span>
                <span className="rounded bg-[#DCE8DD]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#C99B43]">
                  {feed.change}
                </span>
                <span className="text-white/30">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#173D32] text-[#F7F5EF] pt-10 pb-20 lg:pt-14 lg:pb-28">
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&auto=format&fit=crop&q=80"
            alt="Lush agricultural farmland"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#173D32] via-[#173D32]/85 to-transparent z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Title & Value Prop */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md text-[#DCE8DD]">
              <Compass className="h-3.5 w-3.5 text-[#C99B43]" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-none">
              {t.heroTitleLine1} <br />
              <span className="italic font-light text-[#DCE8DD]">{t.heroTitleLine2}</span>
            </h1>

            <p className="text-sm sm:text-base text-[#DCE8DD]/80 font-light leading-relaxed max-w-2xl">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Quick Direct Portal Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold text-[#C99B43] uppercase tracking-wider mr-1">
              {t.directPortalsLabel}
            </span>
            <Link
              href="/fpo"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <Building className="h-3.5 w-3.5" />
              <span>{t.fpoTitle}</span>
            </Link>
            <Link
              href="/ops"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{t.opsTitle}</span>
            </Link>
            <Link
              href="/driver"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <Truck className="h-3.5 w-3.5" />
              <span>{t.driverTitle}</span>
            </Link>
            <Link
              href="/farmer"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <Sprout className="h-3.5 w-3.5" />
              <span>{t.farmerTitle}</span>
            </Link>
            <Link
              href="/buyer"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{t.buyerTitle}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED PERSONA DASHBOARDS GRID */}
      <section className="py-16 bg-[#F7F5EF] border-b border-[#E9E7E1]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#173D32]">
                {t.dashboardShowcaseTag}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#17201D] mt-1">
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
                  className="rounded-3xl border border-[#E9E7E1] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                      <Icon className="h-5 w-5 text-[#173D32] group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-[#F7F5EF]">
                      <img
                        src={portal.image}
                        alt={portal.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-[#173D32] py-2.5 text-xs font-bold text-white hover:bg-[#215445] transition-all shadow-xs"
                    >
                      <span>{t.openPortal} {portal.title}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECTURE FEATURES */}
      <section className="py-20 bg-[#173D32] text-[#F7F5EF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99B43]">
              Technical Innovation
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white mt-1">
              {t.techTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#DCE8DD]/80 mt-2 font-light">
              {t.techSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <Navigation2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.featureGmapsTitle}</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                {t.featureGmapsDesc}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.featureGpsTitle}</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                {t.featureGpsDesc}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.featurePoolingTitle}</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                {t.featurePoolingDesc}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
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

      {/* Footer */}
      <footer className="border-t border-[#E9E7E1] bg-[#17201D] text-[#F7F5EF] py-10 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
              <img
                src="/logo.png"
                alt="FarmLink Direct"
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="text-[#7D8A65]">·</span>
            <span className="text-[#DCE8DD]/70 font-medium">Better markets for every harvest.</span>
          </div>
          <div className="text-[#DCE8DD]/60">
            Smart India Hackathon (SIH) 26033 • Whole Lucknow Regional Agri-Cluster
          </div>
        </div>
      </footer>
    </div>
  );
}
