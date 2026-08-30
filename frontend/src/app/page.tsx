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
} from "lucide-react";

export default function HomePage() {
  const [lang, setLang] = useState<Language>("en");
  const { login } = useAuth();
  const router = useRouter();
  const t = translations[lang];

  const handleRoleSelect = async (username: string, path: string) => {
    try {
      await login(username, "farm1234");
      router.push(path);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const sampleLots = [
    {
      id: 1,
      crop: "Grade A Tomatoes",
      tag: "High demand",
      fpo: "Lucknow Kisan FPO",
      farmer: "Ramesh Kumar",
      village: "Bakshi Ka Talab, Lucknow",
      qty: "500 kg",
      price: "₹38/kg",
      distance: "12 km away",
      pickup: "Tomorrow, 7:00 – 10:00 AM",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      crop: "Grade A Red Onions",
      tag: "Harvested today",
      fpo: "Mohanlalganj Producers",
      farmer: "Arvind Singh",
      village: "Mohanlalganj, Lucknow",
      qty: "800 kg",
      price: "₹30/kg",
      distance: "18 km away",
      pickup: "Today, 4:00 – 7:00 PM",
      image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      crop: "Grade A Chipsona Potatoes",
      tag: "Bulk Lot",
      fpo: "Malihabad Agro Cluster",
      farmer: "Sunita Devi",
      village: "Malihabad, Lucknow",
      qty: "1,000 kg",
      price: "₹24/kg",
      distance: "24 km away",
      pickup: "Tomorrow, 6:00 – 9:00 AM",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col selection:bg-[#DCE8DD] selection:text-[#173D32]">
      {/* Editorial Floating Navbar */}
      <Navbar lang={lang} onLanguageChange={setLang} />

      {/* 1. HERO SECTION (Editorial, Layered Composition) */}
      <section className="relative overflow-hidden bg-[#173D32] text-[#F7F5EF] pt-10 pb-28 lg:pt-16 lg:pb-36">
        {/* Subtle background photo overlay */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&auto=format&fit=crop&q=80"
            alt="Lush agricultural farmland"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#173D32] via-[#173D32]/80 to-transparent z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Typography & Intent */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F7F5EF]/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#DCE8DD] backdrop-blur-md border border-white/10">
                <span className="h-2 w-2 rounded-full bg-[#C99B43] animate-pulse" />
                <span>Verified B2B Fresh Produce Infrastructure</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-white">
                Better markets for every harvest.
              </h1>

              <p className="text-base sm:text-lg text-[#DCE8DD]/90 max-w-xl font-light leading-relaxed">
                FarmLink Direct connects verified farmers and FPOs with reliable institutional buyers, transparent price intelligence, and smarter fulfillment — proving every handoff.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/buyer"
                  className="flex items-center gap-2.5 rounded-full bg-[#C99B43] px-7 py-3.5 text-sm font-bold text-[#17201D] hover:bg-[#d8a94d] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/farmer"
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  <span>Sell Your Produce</span>
                </Link>
              </div>

              {/* Credibility Strip */}
              <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#DCE8DD]/70 font-medium border-t border-white/10">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#C99B43]" />
                  <span>Verified FPOs</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#C99B43]" />
                  <span>Transparent Pricing</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#C99B43]" />
                  <span>Traceable Fulfillment</span>
                </span>
              </div>
            </div>

            {/* Right Column: Layered Editorial Composition */}
            <div className="lg:col-span-5 relative">
              {/* Main Visual Image Card */}
              <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-white/5 shadow-2xl p-2.5 backdrop-blur-md">
                <div className="relative h-96 w-full rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80"
                    alt="Fresh crates of harvest tomatoes ready for dispatch"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Top Origin Tag */}
                  <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/20 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-[#C99B43]" />
                    <span>Bakshi Ka Talab, Lucknow</span>
                  </div>
                </div>

                {/* Floating Lot Detail Card */}
                <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-[#FFFFFF] p-4 text-[#17201D] shadow-2xl border border-[#E9E7E1]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="rounded-md bg-[#DCE8DD] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#173D32]">
                        Grade A • Lucknow Kisan FPO
                      </span>
                      <h4 className="font-serif text-lg font-bold text-[#17201D] mt-1">
                        Fresh Farm Tomatoes
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-[#173D32]">₹38</span>
                      <span className="text-xs text-[#7D8A65]">/kg</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-[#E9E7E1] pt-2.5 text-[#17201D]/70">
                    <div>
                      <span className="text-[10px] text-[#7D8A65] block">Available Volume</span>
                      <span className="font-semibold text-[#17201D]">500 kg batch</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7D8A65] block">Fulfillment Window</span>
                      <span className="font-semibold text-[#17201D]">Tomorrow, 7:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MINIMAL IMPACT METRICS SECTION (Generous Whitespace & Editorial Typography) */}
      <section className="py-20 bg-[#F7F5EF] border-b border-[#E9E7E1]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div>
              <p className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#173D32] tracking-tight">
                12,000+
              </p>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#7D8A65] mt-2">
                Farmers Connected
              </p>
              <p className="text-xs text-[#17201D]/60 mt-1">
                Direct village cluster onboarding across Uttar Pradesh.
              </p>
            </div>

            <div>
              <p className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#173D32] tracking-tight">
                300+
              </p>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#7D8A65] mt-2">
                Institutional Buyers
              </p>
              <p className="text-xs text-[#17201D]/60 mt-1">
                Retailers, cloud kitchens, food processors, and caterers.
              </p>
            </div>

            <div>
              <p className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#C86B4A] tracking-tight">
                25%
              </p>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#7D8A65] mt-2">
                Faster Market Access
              </p>
              <p className="text-xs text-[#17201D]/60 mt-1">
                From field harvest to kitchen receiving within 24 hours.
              </p>
            </div>

            <div>
              <p className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#173D32] tracking-tight">
                100%
              </p>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#7D8A65] mt-2">
                Traceable Events
              </p>
              <p className="text-xs text-[#17201D]/60 mt-1">
                Immutable audit ledger from farm gate to settlement payout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Horizontal Process Timeline with Agritech Labels) */}
      <section className="py-24 bg-[#FFFFFF] border-b border-[#E9E7E1]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C86B4A]">
              Operational Lifecycle
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#17201D] mt-2">
              From harvest to settlement in five clear steps.
            </h2>
            <p className="text-sm text-[#17201D]/70 mt-2 font-light">
              We eliminate unnecessary middlemen by orchestrating direct trade with spatial discovery, capacity-aware logistics, and automated proof of delivery.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {/* Step 01 */}
            <div className="p-6 rounded-2xl bg-[#F7F5EF] border border-[#E9E7E1] space-y-3 relative group hover:border-[#173D32]/30 transition-all">
              <span className="font-serif text-3xl font-bold text-[#C99B43]">01</span>
              <h3 className="text-base font-bold text-[#17201D]">List Harvest</h3>
              <p className="text-xs text-[#17201D]/70 leading-relaxed font-light">
                Farmers or FPO operators list crop lots using voice in Hindi or guided forms with price guidance.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-2xl bg-[#F7F5EF] border border-[#E9E7E1] space-y-3 relative group hover:border-[#173D32]/30 transition-all">
              <span className="font-serif text-3xl font-bold text-[#173D32]">02</span>
              <h3 className="text-base font-bold text-[#17201D]">Match With Buyer</h3>
              <p className="text-xs text-[#17201D]/70 leading-relaxed font-light">
                Buyers discover verified lots within 50 km service radius and commit orders atomically.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-2xl bg-[#F7F5EF] border border-[#E9E7E1] space-y-3 relative group hover:border-[#173D32]/30 transition-all">
              <span className="font-serif text-3xl font-bold text-[#173D32]">03</span>
              <h3 className="text-base font-bold text-[#17201D]">Coordinate Pickup</h3>
              <p className="text-xs text-[#17201D]/70 leading-relaxed font-light">
                Our routing engine assigns local vehicles (Tata Ace) with load and time-window constraints.
              </p>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-2xl bg-[#F7F5EF] border border-[#E9E7E1] space-y-3 relative group hover:border-[#173D32]/30 transition-all">
              <span className="font-serif text-3xl font-bold text-[#C86B4A]">04</span>
              <h3 className="text-base font-bold text-[#17201D]">Track Delivery</h3>
              <p className="text-xs text-[#17201D]/70 leading-relaxed font-light">
                Driver completes checklist and captures customer OTP, photo inspection, and geo-timestamp.
              </p>
            </div>

            {/* Step 05 */}
            <div className="p-6 rounded-2xl bg-[#F7F5EF] border border-[#E9E7E1] space-y-3 relative group hover:border-[#173D32]/30 transition-all">
              <span className="font-serif text-3xl font-bold text-[#173D32]">05</span>
              <h3 className="text-base font-bold text-[#17201D]">Settlement Ready</h3>
              <p className="text-xs text-[#17201D]/70 leading-relaxed font-light">
                Transparent statement generates automatically with 5% logistics and 2% platform facilitation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MARKETPLACE TEASER (Live Produce Lots in Lucknow) */}
      <section className="py-24 bg-[#F7F5EF] border-b border-[#E9E7E1]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7D8A65]">
                Available Produce Batches
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#17201D] mt-1">
                Harvests ready for dispatch.
              </h2>
            </div>
            <Link
              href="/buyer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173D32] hover:text-[#C86B4A] transition"
            >
              <span>View all marketplace lots</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleLots.map((lot) => (
              <div
                key={lot.id}
                className="agri-card group flex flex-col overflow-hidden rounded-2xl"
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden bg-[#E9E7E1]">
                  <img
                    src={lot.image}
                    alt={lot.crop}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-[#173D32] px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    {lot.tag}
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-md bg-white/95 backdrop-blur-md px-2 py-1 text-[11px] font-bold text-[#173D32] shadow-sm">
                    {lot.distance}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#17201D]">
                        {lot.crop}
                      </h3>
                      <span className="text-base font-bold text-[#173D32]">
                        {lot.price}
                      </span>
                    </div>

                    <p className="text-xs text-[#7D8A65] mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{lot.village}</span>
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-[#F7F5EF] p-2.5 rounded-xl border border-[#E9E7E1]">
                      <div>
                        <span className="text-[10px] text-[#7D8A65] block">Available</span>
                        <span className="font-semibold text-[#17201D]">{lot.qty}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7D8A65] block">Supplier</span>
                        <span className="font-semibold text-[#17201D] truncate block">{lot.fpo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E9E7E1] flex items-center justify-between">
                    <span className="text-[11px] text-[#7D8A65] font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{lot.pickup}</span>
                    </span>
                    <Link
                      href="/buyer"
                      className="inline-flex items-center gap-1 rounded-full bg-[#173D32] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#215445] transition"
                    >
                      <span>View Lot</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRUST SECTION (Dark Forest Green Full-Width Panel) */}
      <section className="py-24 bg-[#173D32] text-[#F7F5EF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C99B43]">
              Integrity by Design
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white mt-2">
              Built for trust at every handoff.
            </h2>
            <p className="text-sm sm:text-base text-[#DCE8DD]/80 mt-3 font-light leading-relaxed">
              Agritech marketplaces fail when physical fulfillment detaches from digital promises. We anchor every interaction in verifiable reality.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <Sprout className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Verified Supply</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                Direct aggregation through registered FPO operators with quality grading and photo evidence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Price Guidance</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                Deterministic 7-day price forecasting with transparent confidence labels — never a black-box AI number.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Optimized Pickup</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                Multi-stop route planning respecting 2,000 kg vehicle capacity and tight harvest morning windows.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#C99B43]/20 flex items-center justify-center text-[#C99B43]">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Proof-of-Delivery</h3>
              <p className="text-xs text-[#DCE8DD]/70 font-light leading-relaxed">
                Delivery proof via customer OTP and geo-timestamp moves funds transparently to Settlement Ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA SECTION (Warm Ivory / Soft Sage) */}
      <section className="py-24 bg-[#ECE8DE] border-t border-[#E9E7E1] text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#173D32]">
            Join the Network
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#17201D]">
            Bring your harvest closer to demand.
          </h2>
          <p className="text-sm text-[#17201D]/70 font-light max-w-lg mx-auto">
            Experience fair farmer discovery, predictable institutional procurement, and end-to-end operational traceability.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleRoleSelect("ramesh", "/farmer")}
              className="rounded-full bg-[#173D32] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#215445] transition-all shadow-md"
            >
              Join as Farmer / FPO
            </button>

            <button
              onClick={() => handleRoleSelect("buyer1", "/buyer")}
              className="rounded-full border border-[#173D32] bg-white px-8 py-3.5 text-sm font-bold text-[#173D32] hover:bg-[#F7F5EF] transition-all shadow-xs"
            >
              Register as Buyer
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E9E7E1] bg-[#17201D] text-[#F7F5EF] py-12 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-bold text-white">FarmLink Direct</span>
            <span className="text-[#7D8A65]">·</span>
            <span className="text-[#DCE8DD]/70">Better markets for every harvest.</span>
          </div>
          <div className="text-[#DCE8DD]/60">
            Smart India Hackathon (SIH) 26033 • Lucknow Agri-Cluster Prototype
          </div>
        </div>
      </footer>
    </div>
  );
}
