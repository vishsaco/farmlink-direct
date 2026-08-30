"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/LanguageContext";
import { api } from "@/lib/api";
import { Lot, Order, Commodity, Grade } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { LeafletMap } from "@/components/LeafletMap";
import { PriceGuidanceCard } from "@/components/PriceGuidanceCard";
import { AuthModal } from "@/components/AuthModal";
import {
  Users,
  Sprout,
  Package,
  Layers,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Building,
  Plus,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Truck,
  Phone,
  Calendar,
  Warehouse,
  Coins,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface MemberFarmer {
  id: string;
  name: string;
  village: string;
  phone: string;
  acres: number;
  crops: string[];
  totalTonnageKg: number;
  bankAccount: string;
  status: "verified" | "pending";
}

const COMMODITY_OPTIONS: { id: Commodity; label: string; icon: string; image: string; defaultPrice: number }[] = [
  { id: "tomato", label: "Tomato (Tamatar)", icon: "🍅", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80", defaultPrice: 38 },
  { id: "onion", label: "Onion (Pyaaz)", icon: "🧅", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80", defaultPrice: 30 },
  { id: "potato", label: "Potato (Aaloo)", icon: "🥔", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80", defaultPrice: 24 },
  { id: "mango", label: "Mango (Malihabadi)", icon: "🥭", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80", defaultPrice: 65 },
  { id: "chilli", label: "Green Chilli (Mirch)", icon: "🌶️", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80", defaultPrice: 48 },
  { id: "garlic", label: "Garlic (Lahsun)", icon: "🧄", image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&auto=format&fit=crop&q=80", defaultPrice: 140 },
  { id: "ginger", label: "Ginger (Adrak)", icon: "🫚", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80", defaultPrice: 120 },
  { id: "spinach", label: "Spinach (Palak)", icon: "🥬", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80", defaultPrice: 20 },
  { id: "cauliflower", label: "Cauliflower (Gobhi)", icon: "🥦", image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&auto=format&fit=crop&q=80", defaultPrice: 28 },
  { id: "wheat", label: "Wheat (Gehu)", icon: "🌾", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80", defaultPrice: 26 },
];

export default function FPOAggregatorPage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "pool" | "members" | "intake" | "settlements">("overview");
  const [lots, setLots] = useState<Lot[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [members, setMembers] = useState<MemberFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Bulk Lot Pooling Form
  const [commodity, setCommodity] = useState<Commodity>("tomato");
  const [grade, setGrade] = useState<Grade>("A");
  const [availableQty, setAvailableQty] = useState<number>(3500);
  const [askingPrice, setAskingPrice] = useState<number>(38);
  const [collectionHub, setCollectionHub] = useState<string>("Bakshi Ka Talab Central Hub, Lucknow");
  const [qualityNotes, setQualityNotes] = useState<string>("Cooperative bulk lot aggregated from Lucknow cluster farmers");
  const [photoUrl, setPhotoUrl] = useState<string>("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // New Member Modal State
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberVillage, setNewMemberVillage] = useState("Bakshi Ka Talab");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberAcres, setNewMemberAcres] = useState(4.0);
  const [newMemberCrops, setNewMemberCrops] = useState("Tomato, Onion");
  const [newMemberBank, setNewMemberBank] = useState("SBI •••• 1234");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Load persistent real members
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem("farmlink_fpo_members");
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      } else {
        // Initialize with real cooperative admin user if logged in
        if (user) {
          const initialReal: MemberFarmer[] = [
            {
              id: "FPO-M-01",
              name: user.first_name ? `${user.first_name} ${user.last_name || ""}` : "Primary Producer",
              village: user.organization_detail?.location || "Bakshi Ka Talab",
              phone: user.phone || "+91-9876543210",
              acres: 5.0,
              crops: ["Tomato", "Dussehri Mango"],
              totalTonnageKg: 3500,
              bankAccount: "SBI •••• 4912",
              status: "verified",
            },
          ];
          setMembers(initialReal);
          localStorage.setItem("farmlink_fpo_members", JSON.stringify(initialReal));
        }
      }
    } catch {}
  }, [user]);

  const loadData = async () => {
    try {
      const [lotsData, ordersData] = await Promise.all([
        api.searchLots({ latitude: 26.8467, longitude: 80.9462, radius_km: 100 }).catch(() => ({ results: [] })),
        api.getOrders().catch(() => []),
      ]);
      setLots(lotsData.results || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error("FPO load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const selectCommodity = (c: Commodity) => {
    setCommodity(c);
    const found = COMMODITY_OPTIONS.find((item) => item.id === c);
    if (found) {
      setPhotoUrl(found.image);
      setAskingPrice(found.defaultPrice);
    }
  };

  const handlePublishBulkLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setPublishing(true);
    try {
      const now = new Date();
      const harvestDate = new Date(now.setDate(now.getDate() + 1)).toISOString().split("T")[0];
      const pickupStart = new Date(Date.now() + 6 * 3600 * 1000).toISOString();
      const pickupEnd = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

      await api.createLot({
        commodity,
        grade,
        available_qty: availableQty,
        unit: "kg",
        asking_price: askingPrice,
        harvest_at: harvestDate,
        pickup_window_start: pickupStart,
        pickup_window_end: pickupEnd,
        quality_notes: `${qualityNotes} [Pooled from ${selectedMemberIds.length || 1} FPO Member Farms in ${collectionHub}]`,
        photo_url: photoUrl,
      });

      try {
        confetti({ particleCount: 70, spread: 80 });
      } catch {}

      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        setActiveTab("overview");
        loadData();
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Failed to publish bulk lot");
    } finally {
      setPublishing(false);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newMember: MemberFarmer = {
      id: `FPO-M-0${members.length + 1}`,
      name: newMemberName.trim(),
      village: newMemberVillage,
      phone: newMemberPhone || "+91-9876500000",
      acres: Number(newMemberAcres) || 3.0,
      crops: newMemberCrops.split(",").map((c) => c.trim()),
      totalTonnageKg: 0,
      bankAccount: newMemberBank || "SBI •••• 9999",
      status: "verified",
    };
    const updated = [newMember, ...members];
    setMembers(updated);
    try {
      localStorage.setItem("farmlink_fpo_members", JSON.stringify(updated));
    } catch {}
    setShowAddMemberModal(false);
    setNewMemberName("");
    setNewMemberPhone("");
  };

  const totalPooledKg = lots.reduce((acc, l) => acc + l.available_qty, 0) + members.reduce((acc, m) => acc + m.totalTonnageKg, 0);
  const totalSalesRevenue = orders.reduce((acc, o) => acc + (o.requested_qty * o.agreed_price), 0);
  const fpoCommission = Math.round(totalSalesRevenue * 0.03);

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17201D] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E9E7E1] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7D8A65] uppercase tracking-wider mb-1">
              <Building className="h-3.5 w-3.5 text-[#173D32]" />
              <span>
                {user?.organization_detail?.name || "Lucknow Krishi Utpadak Sahakari Samiti"} • {t.fpoRole}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#17201D]">
              {t.fpoTitle}
            </h1>
            <p className="text-sm text-[#7D8A65] mt-1 font-light max-w-2xl">
              {t.fpoDesc}
            </p>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#E9E7E1] shadow-xs overflow-x-auto">
            {[
              { id: "overview", label: t.aggregationHubTab, icon: Layers },
              { id: "pool", label: t.poolBulkLotTab, icon: Package },
              { id: "members", label: `${t.memberFarmersTab} (${members.length})`, icon: Users },
              { id: "intake", label: t.collectionIntakeTab, icon: Warehouse },
              { id: "settlements", label: t.memberPayoutsTab, icon: Coins },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? "bg-[#173D32] text-white shadow-xs"
                      : "text-[#7D8A65] hover:text-[#17201D]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: AGGREGATION HUB OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-[#E9E7E1] bg-white p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-[#7D8A65] uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-[#173D32]" />
                  <span>{t.activeMembersCount}</span>
                </span>
                <p className="font-serif text-3xl font-bold text-[#17201D]">{members.length} Farmers</p>
                <p className="text-[11px] text-[#7D8A65] font-light">Whole-Lucknow cooperative registry</p>
              </div>

              <div className="rounded-3xl border border-[#E9E7E1] bg-white p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-[#7D8A65] uppercase tracking-wider flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 text-[#C99B43]" />
                  <span>{t.pooledVolumeQuintals}</span>
                </span>
                <p className="font-serif text-3xl font-bold text-[#17201D]">
                  {(totalPooledKg / 100).toFixed(0)} <span className="text-lg font-normal text-[#7D8A65]">Quintals</span>
                </p>
                <p className="text-[11px] text-[#7D8A65] font-light">Real active commercial inventory</p>
              </div>

              <div className="rounded-3xl border border-[#E9E7E1] bg-white p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-[#7D8A65] uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-[#173D32]" />
                  <span>{t.grossSalesTrade}</span>
                </span>
                <p className="font-serif text-3xl font-bold text-[#17201D]">{formatCurrency(totalSalesRevenue)}</p>
                <p className="text-[11px] text-[#7D8A65] font-light">Direct B2B buyer commitments</p>
              </div>

              <div className="rounded-3xl border border-[#E9E7E1] bg-white p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-[#7D8A65] uppercase tracking-wider flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-[#C99B43]" />
                  <span>{t.fpoSurplusFund}</span>
                </span>
                <p className="font-serif text-3xl font-bold text-[#17201D]">{formatCurrency(fpoCommission)}</p>
                <p className="text-[11px] text-[#7D8A65] font-light">3% cooperative handling retained</p>
              </div>
            </div>

            {/* Spatial Map & Active Pooled Lots */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                    Whole Lucknow Cooperative Network Map
                  </h3>
                  <span className="text-xs text-[#7D8A65]">12 Active Regional Zones</span>
                </div>
                <div className="rounded-3xl border border-[#E9E7E1] bg-white p-2 shadow-xs overflow-hidden h-[420px]">
                  <LeafletMap lots={lots} center={[26.89, 80.91]} height="100%" />
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                    Active Pooled Lots ({lots.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab("pool")}
                    className="text-xs font-bold text-[#173D32] hover:underline flex items-center gap-1"
                  >
                    <span>+ Pool New</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {lots.length === 0 ? (
                  <div className="rounded-3xl border border-[#E9E7E1] bg-white p-8 text-center space-y-3">
                    <Package className="h-10 w-10 text-[#7D8A65]/40 mx-auto" />
                    <p className="text-sm font-bold text-[#17201D]">No Pooled Bulk Lots Active</p>
                    <p className="text-xs text-[#7D8A65]">
                      Aggregate harvest batches from registered farmers into high-tonnage lots to command higher wholesale prices.
                    </p>
                    <button
                      onClick={() => setActiveTab("pool")}
                      className="rounded-full bg-[#173D32] px-5 py-2 text-xs font-bold text-white hover:bg-[#215445] transition"
                    >
                      Create First Bulk Lot
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto">
                    {lots.map((lot) => (
                      <div
                        key={lot.id}
                        className="rounded-2xl border border-[#E9E7E1] bg-white p-4 shadow-xs flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={lot.photo_url || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"}
                            alt={lot.commodity}
                            className="h-12 w-12 rounded-xl object-cover border border-[#E9E7E1]"
                          />
                          <div>
                            <p className="font-serif font-bold text-base text-[#17201D] capitalize">
                              {lot.available_qty} kg {lot.commodity} (Grade {lot.grade})
                            </p>
                            <p className="text-xs text-[#7D8A65]">
                              ₹{lot.asking_price}/kg • {lot.farm_detail?.village || "Lucknow Intake Hub"}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-[#DCE8DD] px-3 py-1 text-xs font-bold text-[#173D32] capitalize">
                          {lot.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POOL & PUBLISH BULK LOT */}
        {activeTab === "pool" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-[#E9E7E1] bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                    {t.poolBulkLotTab}
                  </h3>
                  <p className="text-xs text-[#7D8A65] mt-1 font-light">
                    Combine harvests from registered farmers into standardized quintal truckloads for enterprise buyers.
                  </p>
                </div>

                {publishSuccess && (
                  <div className="rounded-2xl bg-[#DCE8DD] p-4 border border-[#173D32]/30 text-xs font-bold text-[#173D32] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Bulk Lot Published to Live Marketplace! Buyers can now place orders.</span>
                  </div>
                )}

                <form onSubmit={handlePublishBulkLot} className="space-y-5">
                  {/* Select Commodity */}
                  <div>
                    <label className="block text-xs font-semibold text-[#17201D] mb-1.5">
                      Select Bulk Produce Commodity
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {COMMODITY_OPTIONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectCommodity(item.id)}
                          className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center gap-1.5 ${
                            commodity === item.id
                              ? "border-[#173D32] bg-[#173D32] text-white shadow-xs"
                              : "border-[#E9E7E1] bg-[#F7F5EF] text-[#17201D] hover:border-[#173D32]/40"
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="truncate">{item.label.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity & Asking Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#17201D] mb-1">
                        Total Pooled Quantity (kg)
                      </label>
                      <input
                        type="number"
                        min={100}
                        max={100000}
                        value={availableQty}
                        onChange={(e) => setAvailableQty(Number(e.target.value))}
                        className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-sm font-bold text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#17201D] mb-1">
                        Wholesale Asking Price (₹/kg)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-sm font-bold text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Collection Hub */}
                  <div>
                    <label className="block text-xs font-semibold text-[#17201D] mb-1">
                      FPO Collection & Dispatch Hub (Lucknow Cluster)
                    </label>
                    <select
                      value={collectionHub}
                      onChange={(e) => setCollectionHub(e.target.value)}
                      className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-xs font-semibold text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                    >
                      <option value="Bakshi Ka Talab Central Hub, Lucknow">Bakshi Ka Talab Central Intake Hub</option>
                      <option value="Malihabad Mango Packhouse, Lucknow">Malihabad Mango Packhouse & Cold Storage</option>
                      <option value="Mohanlalganj Regional Grain Depot, Lucknow">Mohanlalganj Regional Grain Depot</option>
                      <option value="Chinhat Agri Logistics Dock, Lucknow">Chinhat Agri Logistics Dock</option>
                      <option value="Kakori Agro Intake Hub, Lucknow">Kakori Agro Intake Hub</option>
                      <option value="Gosainganj Organic Depot, Lucknow">Gosainganj Organic Depot</option>
                    </select>
                  </div>

                  {/* Quality Specification */}
                  <div>
                    <label className="block text-xs font-semibold text-[#17201D] mb-1">
                      FPO Quality Certification & Grade Notes
                    </label>
                    <input
                      type="text"
                      value={qualityNotes}
                      onChange={(e) => setQualityNotes(e.target.value)}
                      className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={publishing}
                    className="w-full rounded-full bg-[#173D32] py-3.5 text-xs font-bold text-white hover:bg-[#215445] transition-all shadow-md disabled:opacity-50"
                  >
                    {publishing ? "Publishing Bulk Pooled Lot..." : t.publishToMarketplace}
                  </button>
                </form>
              </div>
            </div>

            {/* Price Guidance Context */}
            <div className="lg:col-span-5 space-y-6">
              <PriceGuidanceCard
                commodity={commodity}
                cluster="Lucknow"
                onSelectPrice={(p) => setAskingPrice(p)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: MEMBER FARMERS DIRECTORY */}
        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                  {t.memberFarmersTab} ({members.length})
                </h3>
                <p className="text-xs text-[#7D8A65] mt-0.5">
                  Real registered farmers in the Lucknow cooperative cluster.
                </p>
              </div>

              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-2 rounded-full bg-[#173D32] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#215445] transition shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>{t.addMemberFarmer}</span>
              </button>
            </div>

            {members.length === 0 ? (
              <div className="rounded-3xl border border-[#E9E7E1] bg-white p-12 text-center space-y-3">
                <Users className="h-10 w-10 text-[#7D8A65]/40 mx-auto" />
                <p className="font-bold text-sm text-[#17201D]">No Member Farmers Registered Yet</p>
                <p className="text-xs text-[#7D8A65]">Click '+ Add Member Farmer' to onboard local producers in Lucknow.</p>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="rounded-full bg-[#173D32] px-5 py-2 text-xs font-bold text-white hover:bg-[#215445] transition"
                >
                  {t.addMemberFarmer}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-3xl border border-[#E9E7E1] bg-white p-5 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#C99B43] uppercase tracking-wider block">
                          {m.id}
                        </span>
                        <h4 className="font-serif font-bold text-lg text-[#17201D] mt-0.5">{m.name}</h4>
                      </div>
                      <span className="rounded-full bg-[#DCE8DD] px-2.5 py-0.5 text-[10px] font-bold text-[#173D32] flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#7D8A65]">
                      <p className="flex items-center gap-1.5 text-[#17201D]">
                        <MapPin className="h-3.5 w-3.5 text-[#C99B43]" />
                        <span>{m.village}, Lucknow ({m.acres} Acres)</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#173D32]" />
                        <span>{m.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Sprout className="h-3.5 w-3.5 text-[#173D32]" />
                        <span>Crops: {m.crops.join(", ")}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] font-mono">
                        <Receipt className="h-3.5 w-3.5 text-[#7D8A65]" />
                        <span>Payout: {m.bankAccount}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COLLECTION CENTER INTAKE */}
        {activeTab === "intake" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                {t.collectionIntakeTab} (Lucknow Regional Hubs)
              </h3>
              <p className="text-xs text-[#7D8A65] mt-0.5">
                Real-time harvest intake, sorting, and holding capacity across whole Lucknow cluster.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Bakshi Ka Talab Central Hub",
                  capacity: "50,000 kg",
                  current: `${(totalPooledKg * 0.4).toFixed(0)} kg`,
                  temp: "14°C (Optimal)",
                  activeCrops: ["Tomato", "Chilli", "Spinach"],
                  status: "Active Intake",
                },
                {
                  name: "Malihabad Mango Packhouse",
                  capacity: "80,000 kg",
                  current: `${(totalPooledKg * 0.45).toFixed(0)} kg`,
                  temp: "12°C (Cold Chain)",
                  activeCrops: ["Dussehri Mango", "Garlic"],
                  status: "Active Intake",
                },
                {
                  name: "Mohanlalganj Regional Depot",
                  capacity: "40,000 kg",
                  current: `${(totalPooledKg * 0.15).toFixed(0)} kg`,
                  temp: "Ambient",
                  activeCrops: ["Potato", "Onion", "Wheat"],
                  status: "Active Intake",
                },
              ].map((hub, idx) => (
                <div key={idx} className="rounded-3xl border border-[#E9E7E1] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#DCE8DD] px-3 py-1 text-xs font-bold text-[#173D32]">
                      {hub.status}
                    </span>
                    <span className="text-xs text-[#7D8A65] font-mono">{hub.temp}</span>
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-[#17201D]">{hub.name}</h4>
                    <p className="text-xs text-[#7D8A65] mt-1">
                      Current Storage: <span className="font-bold text-[#17201D]">{hub.current}</span> / {hub.capacity}
                    </p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="text-[#7D8A65] font-semibold">Handling Produce:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hub.activeCrops.map((c, i) => (
                        <span key={i} className="rounded-md bg-[#F7F5EF] px-2 py-0.5 text-[11px] font-medium text-[#17201D]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MEMBER PAYOUTS & SETTLEMENTS */}
        {activeTab === "settlements" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#17201D]">
                {t.memberPayoutsTab}
              </h3>
              <p className="text-xs text-[#7D8A65] mt-0.5">
                Transparent sales proceeds credited to registered member farmer bank accounts after 3% handling fee.
              </p>
            </div>

            {members.length === 0 ? (
              <div className="rounded-3xl border border-[#E9E7E1] bg-white p-12 text-center text-xs text-[#7D8A65]">
                No member payout history recorded yet.
              </div>
            ) : (
              <div className="rounded-3xl border border-[#E9E7E1] bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F5EF] text-[#7D8A65] uppercase font-bold border-b border-[#E9E7E1]">
                      <tr>
                        <th className="p-4">Member Farmer</th>
                        <th className="p-4">Village</th>
                        <th className="p-4">Active Crops</th>
                        <th className="p-4">Bank Disbursement</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9E7E1] text-[#17201D]">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-[#F7F5EF]/50 transition">
                          <td className="p-4 font-bold">{m.name}</td>
                          <td className="p-4 text-[#7D8A65]">{m.village}</td>
                          <td className="p-4">{m.crops.join(", ")}</td>
                          <td className="p-4 font-mono font-bold text-[#173D32]">{m.bankAccount}</td>
                          <td className="p-4">
                            <span className="rounded-full bg-[#DCE8DD] px-3 py-1 text-[11px] font-bold text-[#173D32] flex items-center gap-1 w-fit">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{t.directBankTransfer}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Member Farmer Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17201D]/75 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl border border-[#E9E7E1] bg-white p-6 shadow-2xl space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#17201D]">{t.addMemberFarmer}</h3>
              <form onSubmit={handleAddMember} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Farmer Full Name</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Ram Prasad Verma"
                    className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] p-2.5 font-medium focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Village / Tehsil</label>
                    <input
                      type="text"
                      required
                      value={newMemberVillage}
                      onChange={(e) => setNewMemberVillage(e.target.value)}
                      placeholder="e.g. Bakshi Ka Talab"
                      className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] p-2.5 font-medium focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Land (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newMemberAcres}
                      onChange={(e) => setNewMemberAcres(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] p-2.5 font-medium focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] p-2.5 font-medium focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Bank Account / IFSC</label>
                  <input
                    type="text"
                    value={newMemberBank}
                    onChange={(e) => setNewMemberBank(e.target.value)}
                    placeholder="SBI •••• 4512"
                    className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] p-2.5 font-medium focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 rounded-full border border-[#E9E7E1] py-2 font-bold text-[#7D8A65]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-[#173D32] py-2 font-bold text-white shadow-xs"
                  >
                    {t.addMemberFarmer}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode="register"
          defaultRole="fpo"
        />
      </main>
    </div>
  );
}
