"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { translations, Language } from "@/lib/translations";
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
} from "lucide-react";

export default function HomePage() {
  const [lang, setLang] = useState<Language>("en");
  const { user } = useAuth();
  const router = useRouter();
  const t = translations[lang];

  const PORTAL_CARDS = [
    {
      id: "fpo",
      title: "FPO Aggregator Hub",
      role: "Cooperative Aggregator",
      description: "Pool smallholder harvests into high-tonnage commercial lots, manage member farmer registries, collection center intakes, and transparent 3% cooperative payout ledgers.",
      href: "/fpo",
      icon: Building,
      badge: "Dedicated Aggregator Portal",
      badgeColor: "bg-[#C99B43] text-[#17201D]",
      image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "ops",
      title: "Operations Control Tower",
      role: "Ops Coordinator Command",
      description: "Real-time Lucknow fleet corridor telemetry, automated OR-Tools route solver, APMC Mandi price ingestion monitor, quality dispute resolution, and settlement clearing.",
      href: "/ops",
      icon: ShieldAlert,
      badge: "Real-Time Telemetry & Solvers",
      badgeColor: "bg-[#173D32] text-white",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "driver",
      title: "Driver Turn-by-Turn Dispatch",
      role: "Logistics Fleet Portal",
      description: "Sequential pickup-to-dock route manifests, 1-tap Google Maps turn-by-turn driving navigation deep-links, direct tap-to-call, and OTP proof-of-delivery verification.",
      href: "/driver",
      icon: Truck,
      badge: "1-Tap Google Maps Navigation",
      badgeColor: "bg-[#173D32] text-white",
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "farmer",
      title: "Farmer Discovery Portal",
      role: "Kisan Direct Producer",
      description: "List harvest batches with AI voice assistant, capture real GPS farm coordinates (Bakshi Ka Talab, Malihabad), receive fair mandi price guidance, and track bank payouts.",
      href: "/farmer",
      icon: Sprout,
      badge: "GPS Geolocation & Voice AI",
      badgeColor: "bg-[#173D32] text-white",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "buyer",
      title: "Institutional Marketplace",
      role: "Commercial Buyer Hub",
      description: "Direct procurement of 10 regional fresh produce commodities across Lucknow, live driver transit tracking, Google Maps route view, and secure OTP receipt confirmation.",
      href: "/buyer",
      icon: ShoppingBag,
      badge: "10 Regional Commodities",
      badgeColor: "bg-[#173D32] text-white",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col selection:bg-[#DCE8DD] selection:text-[#173D32]">
      {/* Editorial Floating Navbar */}
      <Navbar lang={lang} onLanguageChange={setLang} />

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
              <span>Lucknow Regional Agri-Cluster Direct Platform</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-none">
              Fair Markets. <br />
              <span className="italic font-light text-[#DCE8DD]">Verifiable Fulfillment.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#DCE8DD]/80 font-light leading-relaxed max-w-2xl">
              Connecting smallholder farmers, cooperative FPOs, logistics drivers, and institutional buyers with deterministic price guidance, real GPS geolocation, and turn-by-turn Google Maps routing.
            </p>
          </div>

          {/* Quick Direct Portal Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold text-[#C99B43] uppercase tracking-wider mr-1">
              Direct Portals:
            </span>
            <Link
              href="/fpo"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <Building className="h-3.5 w-3.5" />
              <span>FPO Aggregator Hub</span>
            </Link>
            <Link
              href="/ops"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Ops Control Tower</span>
            </Link>
            <Link
              href="/driver"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Driver GPS Dispatch</span>
            </Link>
            <Link
              href="/farmer"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <Sprout className="h-3.5 w-3.5" />
              <span>Farmer Portal</span>
            </Link>
            <Link
              href="/buyer"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-[#C99B43] hover:text-[#17201D] transition backdrop-blur-sm border border-white/20"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Buyer Marketplace</span>
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
                Customized Operations
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#17201D] mt-1">
                Explore All 5 Operational Dashboards
              </h2>
              <p className="text-xs sm:text-sm text-[#7D8A65] mt-1 max-w-2xl font-light">
                Every stakeholder has a purpose-built workspace engineered for their daily workflow.
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
                      <span>Open {portal.title}</span>
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
              Engineered for real-world agricultural logistics.
            </h2>
            <p className="text-xs sm:text-sm text-[#DCE8DD]/80 mt-2 font-light">
              Bridging farm gate collection with urban commercial receiving docks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <Navigation2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Google Maps Navigation</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                Direct 1-tap deep links opening native Google Maps turn-by-turn driving directions from farm gate to buyer docks.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">GPS Farm Geolocation</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                Instant browser GPS pin detection ensuring farm gate pickup coordinates are accurately mapped across Lucknow tehsils.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">FPO Bulk Pooling</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                Cooperative lot aggregation pooling smallholder yields into high-tonnage truckloads to maximize farmer earnings.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Transparent Settlements</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                Automated 93% net farmer payout, 5% logistics fee, and 2% platform reconciliation cleared instantly on OTP delivery.
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
            Smart India Hackathon (SIH) 26033 • Lucknow Agri-Cluster Production Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
