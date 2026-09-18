"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Building,
  ShieldAlert,
  CloudSun,
  CloudRain,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  BarChart3,
  Zap,
  Lock,
  Eye,
  ArrowUpRight,
  ChevronRight,
  Quote,
  Leaf,
  Droplets,
  Thermometer,
  Timer,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Intersection Observer Hook for Scroll Reveals
   ────────────────────────────────────────────────────────────── */
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* ──────────────────────────────────────────────────────────────
   Animated Counter Hook
   ────────────────────────────────────────────────────────────── */
function useCounter(target: number, duration = 1200, trigger = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(interval); }
      else setValue(start);
    }, 16);
    return () => clearInterval(interval);
  }, [target, trigger, duration]);
  return value;
}

/* ──────────────────────────────────────────────────────────────
   Market Data
   ────────────────────────────────────────────────────────────── */
const MARKET_DATA = [
  { name: "Tomato", hindi: "टमाटर", price: 40.4, change: +9.4, market: "Dubagga APMC", status: "Rain-sensitive", emoji: "🍅" },
  { name: "Onion", hindi: "प्याज़", price: 30.0, change: +6.7, market: "Sitapur Rd", status: "Stable", emoji: "🧅" },
  { name: "Dussehri Mango", hindi: "दशहरी आम", price: 65.0, change: +21.5, market: "Malihabad", status: "Harvest Window", emoji: "🥭" },
  { name: "Potato", hindi: "आलू", price: 24.0, change: +12.5, market: "Mohanlalganj", status: "Surplus", emoji: "🥔" },
  { name: "Spinach", hindi: "पालक", price: 22.0, change: -9.1, market: "BKT Feeder", status: "High Humidity", emoji: "🥬" },
];

const PRODUCE_CARDS = [
  { name: "Tomatoes", origin: "Dubagga, Lucknow", price: 40, qty: 320, emoji: "🍅", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80" },
  { name: "Onions", origin: "Sitapur Road", price: 30, qty: 580, emoji: "🧅", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80" },
  { name: "Dussehri Mangoes", origin: "Malihabad", price: 65, qty: 480, emoji: "🥭", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80" },
  { name: "Potatoes", origin: "Mohanlalganj", price: 24, qty: 750, emoji: "🥔", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80" },
  { name: "Spinach", origin: "BKT, Lucknow", price: 22, qty: 120, emoji: "🥬", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80" },
  { name: "Green Chilli", origin: "Kakori", price: 48, qty: 200, emoji: "🌶️", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80" },
];

export default function HomePage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // Scroll-reveal refs
  const heroRef = useInView();
  const marketRef = useInView();
  const problemRef = useInView();
  const howItWorksRef = useInView();
  const marketplaceRef = useInView();
  const predictRef = useInView();
  const farmerRef = useInView();
  const buyerRef = useInView();
  const weatherRef = useInView();
  const ecosystemRef = useInView();
  const traceRef = useInView();
  const statsRef = useInView();
  const testimonialRef = useInView();
  const blogRef = useInView();
  const ctaRef = useInView();

  // Counter for stats section
  const commodityCount = useCounter(10, 1000, statsRef.inView);
  const workspaceCount = useCounter(5, 800, statsRef.inView);
  const payoutPct = useCounter(93, 1200, statsRef.inView);
  const traceablePct = useCounter(100, 1400, statsRef.inView);

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#262238] flex flex-col selection:bg-[#E8E4F2] selection:text-[#262238]">
      <Navbar />

      {/* ════════════════════════════════════════════════════════
          1. HERO SECTION
          ════════════════════════════════════════════════════════ */}
      <section ref={heroRef.ref} className="relative pt-8 pb-20 lg:pt-16 lg:pb-32 overflow-hidden">
        {/* Abstract organic blobs */}
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full bg-[#E8E4F2]/40 blur-[100px] animate-blob-float pointer-events-none" />
        <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] rounded-full bg-[#E3EBE0]/40 blur-[80px] animate-blob-float-delayed pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div className={`space-y-8 ${heroRef.inView ? "animate-fade-in-up" : "opacity-0"}`}>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E4F2] bg-white/80 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-[#737184]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#718A68] animate-pulse" />
                <span>{lang === "hi" ? "लखनऊ का सीधा उत्पाद नेटवर्क" : "LUCKNOW'S DIRECT PRODUCE NETWORK"}</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-[1.08] tracking-[-0.03em]">
                <span className="block">
                  {lang === "hi" ? "ताज़ी फसलें।" : "Fresh Produce."}
                </span>
                <span className="block">
                  <span className="text-[#718A68]">{lang === "hi" ? "सही दाम।" : "Fair Prices."}</span>
                </span>
                <span className="block">
                  <span className="bg-[#E8E4F2] rounded-xl px-3 py-0.5 inline-block">{lang === "hi" ? "सीधे किसान से।" : "Directly From the Farm."}</span>
                </span>
              </h1>

              {/* Supporting text */}
              <p className="text-base sm:text-lg text-[#737184] font-normal leading-relaxed max-w-xl">
                {lang === "hi"
                  ? "FarmLink सत्यापित किसानों और FPOs को वाणिज्यिक खरीदारों से पारदर्शी मूल्य, मौसम-जागरूक योजना और ट्रेस करने योग्य पूर्ति के माध्यम से जोड़ता है।"
                  : "FarmLink connects verified farmers and FPOs with commercial buyers through transparent pricing, weather-aware planning and traceable fulfillment."}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/buyer" className="btn-primary text-sm">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{lang === "hi" ? "बाज़ार देखें" : "Browse Marketplace"}</span>
                </Link>
                <Link href="/farmer" className="btn-secondary text-sm">
                  <Sprout className="h-4 w-4 text-[#718A68]" />
                  <span>{lang === "hi" ? "अपनी फसल बेचें" : "Sell Your Harvest"}</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#737184]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#718A68]" />
                  <span>Verified Farmers & FPOs</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#718A68]" />
                  <span>Transparent Market Prices</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#718A68]" />
                  <span>Traceable Delivery</span>
                </span>
              </div>
            </div>

            {/* Right Column — Premium Visual Composition */}
            <div className={`relative ${heroRef.inView ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
              {/* Main produce image */}
              <div className="relative rounded-[28px] overflow-hidden bg-white border border-[#E4E2DD] shadow-2xl group">
                <div className="relative h-[400px] sm:h-[480px] w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1200&auto=format&fit=crop&q=85"
                    alt="Fresh produce from Lucknow farms"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="animate-shimmer-once" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#262238]/60 via-transparent to-transparent" />
                </div>

                {/* Floating micro-info cards */}
                <div className="absolute top-4 left-4 glass-card px-3 py-2 text-xs animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-medium text-[#262238]">APMC Tomato</span>
                    <span className="font-mono font-semibold text-[#718A68]">₹40.4/kg</span>
                    <span className="text-[10px] font-semibold text-[#718A68]">+9.4%</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 glass-card px-3 py-2 text-xs animate-fade-in-up" style={{ animationDelay: "500ms" }}>
                  <div className="flex items-center gap-2">
                    <CloudSun className="h-3.5 w-3.5 text-[#C99B43]" />
                    <span className="text-[#737184]">Rain after 2 PM</span>
                  </div>
                </div>

                <div className="absolute bottom-20 left-4 glass-card px-3 py-2 text-xs animate-fade-in-up" style={{ animationDelay: "600ms" }}>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#718A68]" />
                    <span className="text-[#262238] font-medium">Harvest Window</span>
                    <span className="text-[#718A68] font-semibold">Optimal</span>
                  </div>
                </div>

                <div className="absolute bottom-20 right-4 glass-card px-3 py-2 text-xs animate-fade-in-up" style={{ animationDelay: "700ms" }}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#718A68]" />
                    <span className="text-[#262238] font-medium">Verified Farm</span>
                    <span className="text-[#737184]">Malihabad</span>
                  </div>
                </div>

                {/* Bottom weather bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl p-4 border-t border-[#E4E2DD]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[#262238]">
                      <CloudSun className="h-4 w-4 text-[#C99B43]" />
                      Tomorrow's Farm Outlook
                    </span>
                    <span className="font-mono text-[11px] text-[#718A68] bg-[#E3EBE0] px-2.5 py-0.5 rounded-full">
                      26°C · Light rain after 2 PM
                    </span>
                  </div>
                  <p className="text-[11px] text-[#737184] mt-1.5">
                    <strong className="text-[#262238]">Recommended:</strong> Schedule tomato pickup from Malihabad before noon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2. LIVE MARKET SNAPSHOT (Ticker)
          ════════════════════════════════════════════════════════ */}
      <section ref={marketRef.ref} className="py-6 border-y border-[#E4E2DD] bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#718A68] animate-pulse" />
            <span className="font-heading text-sm font-medium text-[#262238]">Today's Farm Market</span>
            <span className="text-xs text-[#737184]">APMC Lucknow Cluster</span>
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="animate-ticker-smooth">
            {[...MARKET_DATA, ...MARKET_DATA].map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 px-8 border-r border-[#E4E2DD] last:border-0 shrink-0">
                <span className="text-2xl">{item.emoji}</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-medium text-[#262238]">{item.name}</span>
                    <span className="font-mono text-sm font-semibold text-[#262238]">₹{item.price}/kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`font-mono font-semibold ${item.change >= 0 ? "text-[#718A68]" : "text-[#C86B4A]"}`}>
                      {item.change >= 0 ? "▲" : "▼"} {item.change >= 0 ? "+" : ""}{item.change}%
                    </span>
                    <span className="text-[#737184]">{item.market}</span>
                    <span className="text-[#9D9AAE]">· {item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          3. PROBLEM / VALUE PROPOSITION
          ════════════════════════════════════════════════════════ */}
      <section ref={problemRef.ref} className="py-20 lg:py-28">
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${problemRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <h2 className="font-heading text-[clamp(1.75rem,3.5vw,3rem)] font-normal tracking-[-0.02em] text-[#262238] leading-[1.15]">
              {lang === "hi"
                ? "पुरानी खेत-से-बाज़ार यात्रा पारदर्शिता के लिए नहीं बनी थी।"
                : "The old farm-to-market journey wasn't built for transparency."}
            </h2>

            {/* Before/After Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="editorial-card p-8 space-y-4">
                <span className="text-xs font-medium text-[#C86B4A] uppercase tracking-wider">Before</span>
                <div className="space-y-3">
                  {["Farmer", "Middleman", "Wholesaler", "Retailer", "Buyer"].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-semibold ${
                        step === "Middleman" || step === "Wholesaler" || step === "Retailer"
                          ? "bg-[#F8ECE8] text-[#C86B4A]"
                          : "bg-[#E8E4F2] text-[#262238]"
                      }`}>
                        {i + 1}
                      </div>
                      <span className={`text-sm ${
                        step === "Middleman" || step === "Wholesaler" || step === "Retailer"
                          ? "text-[#C86B4A] line-through"
                          : "text-[#262238] font-medium"
                      }`}>{step}</span>
                      {i < 4 && <span className="text-[#D1CEC8] ml-auto">↓</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* After */}
              <div className="editorial-card p-8 space-y-4 border-[#718A68]/30 bg-[#E3EBE0]/20">
                <span className="text-xs font-medium text-[#718A68] uppercase tracking-wider">With FarmLink</span>
                <div className="space-y-5">
                  {[
                    { label: "Farmer", icon: Sprout },
                    { label: "FarmLink", icon: Zap },
                    { label: "Buyer", icon: ShoppingBag },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                        step.label === "FarmLink"
                          ? "bg-[#262238] text-white"
                          : "bg-[#E3EBE0] text-[#718A68]"
                      }`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className={`text-sm font-medium ${step.label === "FarmLink" ? "text-[#262238] font-semibold" : "text-[#262238]"}`}>
                        {step.label}
                      </span>
                      {i < 2 && <span className="text-[#718A68] ml-auto">↓</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-lg text-[#737184] max-w-xl mx-auto leading-relaxed">
              {lang === "hi"
                ? "एक जुड़ा हुआ नेटवर्क। बेहतर दृश्यता। कम अनावश्यक परतें।"
                : "One connected network. Better visibility. Fewer unnecessary layers."}
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. HOW FARMLINK WORKS
          ════════════════════════════════════════════════════════ */}
      <section ref={howItWorksRef.ref} className="py-20 lg:py-28 bg-white border-y border-[#E4E2DD]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className={`text-center max-w-2xl mx-auto ${howItWorksRef.inView ? "scroll-reveal" : "opacity-0"}`}>
            <span className="text-xs font-medium text-[#718A68] uppercase tracking-widest">The Process</span>
            <h2 className="font-heading text-[clamp(1.75rem,3.5vw,3rem)] font-normal tracking-[-0.02em] text-[#262238] mt-3">
              {lang === "hi" ? "मिट्टी से निपटान तक" : "From Soil to Settlement"}
            </h2>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 ${howItWorksRef.inView ? "scroll-reveal" : "opacity-0"}`}>
            {[
              { num: "01", title: "List Harvest", desc: "Farmer or FPO records crop, grade and harvest date.", icon: Sprout },
              { num: "02", title: "Match with Buyer", desc: "Commercial buyers discover relevant produce lots.", icon: ShoppingBag },
              { num: "03", title: "Plan by Weather", desc: "Forecast intelligence optimizes harvest and pickup timing.", icon: CloudSun },
              { num: "04", title: "Pickup & Deliver", desc: "Logistics partners manage optimized pickup and delivery.", icon: Truck },
              { num: "05", title: "Settle", desc: "Transparent settlement and payout confirmation.", icon: CheckCircle2 },
            ].map((step, idx) => (
              <div
                key={step.num}
                className={`relative p-6 rounded-[24px] bg-[#F6F5F1] border border-[#E4E2DD] space-y-4 editorial-card-interactive scroll-reveal scroll-reveal-delay-${idx + 1}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-3xl text-[#D4CEE8] font-light">{step.num}</span>
                  <div className="h-10 w-10 rounded-2xl bg-white border border-[#E4E2DD] flex items-center justify-center text-[#718A68]">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-base font-medium text-[#262238]">{step.title}</h3>
                  <p className="text-sm text-[#737184] mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          5. MARKETPLACE PREVIEW
          ════════════════════════════════════════════════════════ */}
      <section ref={marketplaceRef.ref} className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${marketplaceRef.inView ? "scroll-reveal" : "opacity-0"}`}>
            <div>
              <span className="text-xs font-medium text-[#718A68] uppercase tracking-widest">Marketplace</span>
              <h2 className="font-heading text-[clamp(1.75rem,3.5vw,3rem)] font-normal tracking-[-0.02em] text-[#262238] mt-3">
                {lang === "hi" ? "लखनऊ के खेतों से ताज़ा" : "Fresh from farms around Lucknow."}
              </h2>
            </div>
            <Link href="/buyer" className="btn-secondary text-sm">
              <span>View All Lots</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${marketplaceRef.inView ? "scroll-reveal" : "opacity-0"}`}>
            {PRODUCE_CARDS.map((item, idx) => (
              <Link
                key={item.name}
                href="/buyer"
                className={`editorial-card editorial-card-interactive overflow-hidden group scroll-reveal scroll-reveal-delay-${Math.min(idx + 1, 5)}`}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="photo-zoom h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 glass-card px-2.5 py-1 text-[11px] font-semibold text-[#718A68] flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-heading text-base font-medium text-[#262238]">{item.name}</h3>
                    <p className="text-xs text-[#737184] flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {item.origin}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-semibold text-[#262238]">₹{item.price}/kg</span>
                    <span className="text-xs text-[#737184]">{item.qty} kg available</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E4E2DD]">
                    <span className="text-xs font-medium text-[#718A68]">View Lot</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#718A68] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          6. PREDICTIVE INTELLIGENCE (Dark Section)
          ════════════════════════════════════════════════════════ */}
      <section ref={predictRef.ref} className="py-20 lg:py-28 bg-[#28243D] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 800 400" fill="none">
            <path d="M0 300 Q200 100 400 250 T800 200" stroke="white" strokeWidth="1" />
            <path d="M0 350 Q200 150 400 300 T800 250" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${predictRef.inView ? "scroll-reveal" : "opacity-0"}`}>
            <div className="space-y-6">
              <span className="text-xs font-medium text-[#D4CEE8] uppercase tracking-widest">Predictive Intelligence</span>
              <h2 className="font-heading text-[clamp(1.75rem,3.5vw,3rem)] font-normal tracking-[-0.02em] text-white leading-[1.15]">
                {lang === "hi"
                  ? "सिर्फ बाज़ार देखें नहीं। समझें क्या आने वाला है।"
                  : "Don't just see the market. Understand what's coming."}
              </h2>
              <p className="text-base text-[#9D9AAE] leading-relaxed max-w-lg">
                7-day and 14-day price outlook powered by Holt-Winters ML models. Hold/sell guidance, market movement analysis, and estimated payout simulation.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "7-Day Outlook", value: "ML Forecast" },
                  { label: "Market Movement", value: "Real-time" },
                  { label: "Hold/Sell Guidance", value: "AI-Powered" },
                  { label: "Payout Estimate", value: "Simulated" },
                ].map((item) => (
                  <div key={item.label} className="dark-card p-4 space-y-1">
                    <span className="text-[11px] text-[#9D9AAE] uppercase tracking-wider">{item.label}</span>
                    <span className="block text-sm font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/predict" className="btn-green text-sm inline-flex">
                <Sparkles className="h-4 w-4" />
                <span>Explore Market Predictor</span>
              </Link>
            </div>

            {/* Chart visualization */}
            <div className="dark-card p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Tomato — 7-Day Price Outlook</span>
                <span className="text-[#9D9AAE] font-mono">Dubagga APMC</span>
              </div>
              <div className="relative h-48">
                <svg className="w-full h-full" viewBox="0 0 400 160" fill="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#718A68" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#718A68" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[40, 80, 120].map(y => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  ))}
                  {/* Area fill */}
                  <path
                    d="M0 120 Q50 100 100 90 T200 70 T300 60 T400 50 L400 160 L0 160Z"
                    fill="url(#chartGrad)"
                  />
                  {/* Line */}
                  <path
                    d="M0 120 Q50 100 100 90 T200 70 T300 60 T400 50"
                    stroke="#718A68"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    className={predictRef.inView ? "animate-chart-line" : ""}
                  />
                  {/* Data points */}
                  {[[0,120],[100,90],[200,70],[300,60],[400,50]].map(([x,y], i) => (
                    <circle key={i} cx={x} cy={y} r="4" fill="#28243D" stroke="#718A68" strokeWidth="2" />
                  ))}
                </svg>
                {/* Price labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[#9D9AAE] font-mono pt-2">
                  <span>Today</span><span>Day 2</span><span>Day 4</span><span>Day 5</span><span>Day 7</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-[#718A68]">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Rising trend
                </span>
                <span className="text-[#9D9AAE]">Hold recommended for 3 more days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          7. FOR FARMERS (Split-screen)
          ════════════════════════════════════════════════════════ */}
      <section ref={farmerRef.ref} className="py-20 lg:py-28">
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${farmerRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-[28px] overflow-hidden h-[400px] lg:h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=85"
                alt="Indian farmer in field"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#262238]/30 to-transparent" />
            </div>
            <div className="space-y-6">
              <span className="text-xs font-medium text-[#718A68] uppercase tracking-widest">For Farmers</span>
              <h2 className="font-heading text-[clamp(1.5rem,3vw,2.5rem)] font-normal tracking-[-0.02em] text-[#262238]">
                {lang === "hi"
                  ? "किसानों के लिए, FarmLink सिर्फ एक बाज़ार से कहीं अधिक है।"
                  : "For farmers, FarmLink is more than a marketplace."}
              </h2>
              <div className="space-y-3">
                {[
                  "Sell directly to commercial buyers",
                  "Understand fair market prices in real-time",
                  "Find verified commercial buyers",
                  "Track every order from field to dock",
                  "Plan harvests with weather intelligence",
                  "Receive transparent settlements (93% net)"
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#718A68] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#737184]">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/farmer" className="btn-primary text-sm inline-flex">
                <Sprout className="h-4 w-4" />
                <span>Start Selling</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          8. FOR BUYERS (Reverse split-screen)
          ════════════════════════════════════════════════════════ */}
      <section ref={buyerRef.ref} className="py-20 lg:py-28 bg-white border-y border-[#E4E2DD]">
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${buyerRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 lg:order-1">
              <span className="text-xs font-medium text-[#718A68] uppercase tracking-widest">For Buyers</span>
              <h2 className="font-heading text-[clamp(1.5rem,3vw,2.5rem)] font-normal tracking-[-0.02em] text-[#262238]">
                {lang === "hi"
                  ? "खरीदारों के लिए, सोर्सिंग आसान हो जाती है।"
                  : "For buyers, sourcing becomes simpler."}
              </h2>
              <div className="space-y-3">
                {[
                  "Verified suppliers with quality grades",
                  "Fresh local produce from regional farms",
                  "Transparent pricing linked to APMC rates",
                  "Lot-level visibility and traceability",
                  "Real-time delivery tracking with GPS",
                  "Digital OTP confirmation on delivery"
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#718A68] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#737184]">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/buyer" className="btn-primary text-sm inline-flex">
                <ShoppingBag className="h-4 w-4" />
                <span>Browse Produce</span>
              </Link>
            </div>
            <div className="relative rounded-[28px] overflow-hidden h-[400px] lg:h-[500px] lg:order-2">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=85"
                alt="Fresh produce market display"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#262238]/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          9. WEATHER INTELLIGENCE
          ════════════════════════════════════════════════════════ */}
      <section ref={weatherRef.ref} className="py-20 lg:py-28">
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${weatherRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-14">
            <span className="text-xs font-medium text-[#718A68] uppercase tracking-widest">Weather Intelligence</span>
            <h2 className="font-heading text-[clamp(1.75rem,3.5vw,3rem)] font-normal tracking-[-0.02em] text-[#262238]">
              {lang === "hi"
                ? "मौसम आपका नुकसान तय नहीं करना चाहिए।"
                : "Weather shouldn't decide your losses."}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: CloudRain, label: "Rain Forecast", value: "2:00 PM", sublabel: "Expected", color: "bg-blue-50 text-blue-600" },
              { icon: Timer, label: "Recommended Pickup", value: "Before 12:00 PM", sublabel: "Optimal window", color: "bg-[#E3EBE0] text-[#718A68]" },
              { icon: Thermometer, label: "Transit Risk", value: "Moisture", sublabel: "Monitor humidity", color: "bg-[#F8ECE8] text-[#C86B4A]" },
              { icon: Leaf, label: "Harvest Window", value: "Optimal", sublabel: "Next 4 hours", color: "bg-[#E8E4F2] text-[#262238]" },
            ].map(item => (
              <div key={item.label} className="editorial-card p-6 space-y-4 editorial-card-interactive">
                <div className={`h-12 w-12 rounded-2xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-[#737184] uppercase tracking-wider">{item.label}</span>
                  <h3 className="font-heading text-xl font-medium text-[#262238] mt-1">{item.value}</h3>
                  <p className="text-xs text-[#737184] mt-0.5">{item.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          10. FARMLINK ECOSYSTEM
          ════════════════════════════════════════════════════════ */}
      <section ref={ecosystemRef.ref} className="py-20 lg:py-28 bg-white border-y border-[#E4E2DD]">
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${ecosystemRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
            <span className="text-xs font-medium text-[#718A68] uppercase tracking-widest">Ecosystem</span>
            <h2 className="font-heading text-[clamp(1.75rem,3.5vw,3rem)] font-normal tracking-[-0.02em] text-[#262238]">
              Five workspaces. One network.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {[
              { role: "Farmer", icon: Sprout, href: "/farmer", desc: "List & sell harvest" },
              { role: "FPO", icon: Building, href: "/fpo", desc: "Aggregate & pool" },
              { role: "Buyer", icon: ShoppingBag, href: "/buyer", desc: "Source & procure" },
              { role: "Logistics", icon: Truck, href: "/driver", desc: "Pickup & deliver" },
              { role: "Operations", icon: ShieldAlert, href: "/ops", desc: "Monitor & settle" },
            ].map((item, idx) => (
              <Link
                key={item.role}
                href={item.href}
                className={`editorial-card editorial-card-interactive p-6 text-center space-y-4 group scroll-reveal scroll-reveal-delay-${idx + 1}`}
              >
                <div className="mx-auto h-14 w-14 rounded-[20px] bg-[#F6F5F1] border border-[#E4E2DD] flex items-center justify-center text-[#718A68] group-hover:bg-[#E8E4F2] group-hover:border-[#D4CEE8] transition">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-medium text-[#262238]">{item.role}</h3>
                  <p className="text-xs text-[#737184] mt-0.5">{item.desc}</p>
                </div>
                <div className="text-xs font-medium text-[#718A68] flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          11. TRUST / TRACEABILITY
          ════════════════════════════════════════════════════════ */}
      <section ref={traceRef.ref} className="py-20 lg:py-28">
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${traceRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="text-xs font-medium text-[#718A68] uppercase tracking-widest">Traceability</span>
              <h2 className="font-heading text-[clamp(1.75rem,3.5vw,3rem)] font-normal tracking-[-0.02em] text-[#262238]">
                {lang === "hi"
                  ? "जानें कि आपकी उपज कहाँ से आई।"
                  : "Know where your produce came from."}
              </h2>
              <p className="text-base text-[#737184] leading-relaxed">
                Every stage of the journey — from farm collection to buyer dock — is GPS-verified, timestamped, and visible to all parties.
              </p>
            </div>

            {/* Vertical Timeline */}
            <div className="space-y-0">
              {[
                { stage: "Farm", icon: Sprout, detail: "GPS-verified collection point" },
                { stage: "Collection", icon: Building, detail: "FPO aggregation & grading" },
                { stage: "Pickup", icon: Truck, detail: "Driver loading confirmation" },
                { stage: "Transit", icon: MapPin, detail: "Live GPS route tracking" },
                { stage: "Buyer Dock", icon: ShoppingBag, detail: "OTP delivery verification" },
                { stage: "Settlement", icon: CheckCircle2, detail: "93% net farmer payout" },
              ].map((item, idx) => (
                <div key={item.stage} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                      idx === 0 ? "bg-[#718A68] text-white" : "bg-[#E8E4F2] text-[#262238]"
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    {idx < 5 && <div className="w-px h-10 bg-[#E4E2DD]" />}
                  </div>
                  <div className="pb-6">
                    <h4 className="font-heading text-sm font-medium text-[#262238]">{item.stage}</h4>
                    <p className="text-xs text-[#737184] mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          12. STATISTICS
          ════════════════════════════════════════════════════════ */}
      <section ref={statsRef.ref} className="py-20 lg:py-28 bg-white border-y border-[#E4E2DD]">
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${statsRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: commodityCount, label: "Regional Commodities", suffix: "" },
              { value: workspaceCount, label: "Connected Workspaces", suffix: "" },
              { value: payoutPct, label: "Net Farmer Payout*", suffix: "%" },
              { value: traceablePct, label: "Traceable Fulfillment", suffix: "%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <span className="font-heading text-[clamp(2.5rem,5vw,4rem)] font-light text-[#262238] tracking-[-0.03em] animate-number-reveal">
                  {stat.value}{stat.suffix}
                </span>
                <p className="text-sm text-[#737184]">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-[#9D9AAE] mt-8">
            *Net farmer payout after 5% logistics fee and 2% platform fee. Based on FarmLink settlement model.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          13. TESTIMONIALS
          ════════════════════════════════════════════════════════ */}
      <section ref={testimonialRef.ref} className="py-20 lg:py-28">
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${testimonialRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-[#718A68] uppercase tracking-widest">From the Field</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Direct selling through FarmLink gave me 30% better returns on my tomato harvest. No middleman takes.", name: "Ramesh Kumar", role: "Farmer", location: "Malihabad" },
              { quote: "We source fresh produce for 200+ daily meals. FarmLink's lot visibility and delivery tracking changed our procurement.", name: "Priya Singh", role: "Restaurant Buyer", location: "Gomti Nagar" },
              { quote: "Aggregating from 50+ farmers into bulk lots is seamless. Our cooperative payout transparency improved dramatically.", name: "Suresh Patel", role: "FPO Manager", location: "Kakori" },
            ].map(t => (
              <div key={t.name} className="editorial-card p-8 space-y-6">
                <Quote className="h-8 w-8 text-[#D4CEE8]" />
                <p className="text-base text-[#262238] leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E4E2DD]">
                  <div className="h-10 w-10 rounded-full bg-[#E8E4F2] flex items-center justify-center text-sm font-semibold text-[#262238]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#262238]">{t.name}</p>
                    <p className="text-xs text-[#737184]">{t.role} · {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          14. BLOG / AGRICULTURAL INSIGHTS
          ════════════════════════════════════════════════════════ */}
      <section ref={blogRef.ref} className="py-20 lg:py-28 bg-white border-y border-[#E4E2DD]">
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 ${blogRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-[#718A68] uppercase tracking-widest">Insights</span>
              <h2 className="font-heading text-[clamp(1.5rem,3vw,2.5rem)] font-normal tracking-[-0.02em] text-[#262238] mt-3">
                Agricultural Intelligence
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "How weather affects harvest timing", category: "Weather", image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop&q=80", desc: "Understanding rainfall patterns and their direct impact on Lucknow's crop pickup schedules." },
              { title: "Understanding APMC prices", category: "Market", image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80", desc: "How mandi modal rates are set and why direct FarmLink pricing benefits both farmers and buyers." },
              { title: "How direct procurement changes farmer margins", category: "Economics", image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80", desc: "The financial impact of removing intermediary layers on smallholder farmer income." },
            ].map(article => (
              <div key={article.title} className="editorial-card editorial-card-interactive overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img src={article.image} alt={article.title} className="photo-zoom h-full w-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="glass-card px-2.5 py-1 text-[10px] font-medium text-[#262238] uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-heading text-base font-medium text-[#262238] group-hover:text-[#718A68] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#737184] leading-relaxed">{article.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-[#718A68] pt-2">
                    <span>Read article</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          15. FINAL CTA
          ════════════════════════════════════════════════════════ */}
      <section ref={ctaRef.ref} className="py-24 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8E4F2]/50 via-[#F6F5F1] to-[#E3EBE0]/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E8E4F2]/30 blur-[120px] pointer-events-none" />

        <div className={`mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative text-center space-y-8 ${ctaRef.inView ? "scroll-reveal" : "opacity-0"}`}>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-normal tracking-[-0.03em] text-[#262238] leading-[1.1]">
            {lang === "hi"
              ? "आइए एक बेहतर खेत-से-बाज़ार नेटवर्क बनाएं।"
              : "Let's build a fairer farm-to-market network."}
          </h2>
          <p className="text-lg text-[#737184] max-w-xl mx-auto leading-relaxed">
            For farmers, buyers and the people moving produce between them.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/buyer" className="btn-primary text-sm">
              <ShoppingBag className="h-4 w-4" />
              <span>Browse Marketplace</span>
            </Link>
            <Link href="/farmer" className="btn-secondary text-sm">
              <Sprout className="h-4 w-4 text-[#718A68]" />
              <span>Sell Your Harvest</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          16. FOOTER
          ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#262238]/10 bg-[#262238] text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
                  <svg className="h-5 w-5 text-[#E8E4F2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#718A68" />
                  </svg>
                </div>
                <span className="font-heading text-xl font-medium text-white tracking-tight">
                  Farm<span className="text-[#718A68]">Link</span>
                </span>
              </div>
              <p className="text-sm text-white/50 max-w-sm leading-relaxed">
                Direct from the farm.<br />Built for better markets.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-3 text-sm text-white/60">
              <Link href="/buyer" className="hover:text-white transition">Marketplace</Link>
              <Link href="/farmer" className="hover:text-white transition">For Farmers</Link>
              <Link href="/predict" className="hover:text-white transition">Insights</Link>
              <Link href="/fpo" className="hover:text-white transition">FPO Hub</Link>
              <Link href="/driver" className="hover:text-white transition">Logistics</Link>
              <Link href="/ops" className="hover:text-white transition">Operations</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-xs text-white/40">
            <p>© 2026 FarmLink Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-4 font-mono text-[11px]">
              <span>SIH 26033</span>
              <span>•</span>
              <span>Lucknow Agri-Cluster</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
