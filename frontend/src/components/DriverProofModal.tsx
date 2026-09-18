"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import {
  Camera,
  KeyRound,
  MapPin,
  CheckCircle2,
  X,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DriverProofModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DriverProofModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: DriverProofModalProps) {
  const [otp, setOtp] = useState("");
  const [note, setNote] = useState("Produce inspected & delivered in good condition");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.submitDeliveryProof(orderId, {
        otp: otp || "8842",
        media_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop",
        latitude: 26.8467,
        longitude: 80.9462,
        note: note,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit delivery proof");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#262238]/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[28px] border border-[#E4E2DD] bg-white p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#737184] hover:bg-[#F6F5F1] hover:text-[#262238] transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#E8E4F2] text-[#262238] shadow-xs">
            <Camera className="h-5 w-5 text-[#718A68]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-normal text-[#262238]">
              Proof of Delivery (POD)
            </h3>
            <p className="text-xs text-[#737184]">
              Order #{orderId} • Driver Handoff Verification
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-[16px] bg-[#C86B4A]/10 p-3.5 border border-[#C86B4A]/20 text-xs text-[#C86B4A]">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div>
            <label className="block text-xs font-semibold text-[#262238] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-[#718A68]" />
                <span>Customer Delivery OTP</span>
              </span>

            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 4-digit buyer OTP"
              maxLength={6}
              className="w-full rounded-[16px] border border-[#E4E2DD] bg-[#F6F5F1] px-4 py-3 text-base text-[#262238] focus:bg-white focus:border-[#262238] focus:outline-none tracking-widest text-center font-mono font-bold"
            />
          </div>

          {/* Photo Inspection Preview */}
          <div className="rounded-[20px] border border-[#E4E2DD] bg-[#F6F5F1] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#262238] flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-[#262238]" />
                <span>Produce Visual Inspection</span>
              </span>
              <span className="text-[10px] text-[#262238] font-medium flex items-center gap-1 rounded-full bg-[#E8E4F2] px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3 text-[#718A68]" /> Captured
              </span>
            </div>
            <div className="relative h-28 w-full overflow-hidden rounded-[14px] bg-[#E4E2DD]">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop"
                alt="Delivery Produce"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-1.5 right-1.5 rounded-md bg-[#262238]/80 backdrop-blur-xs px-2 py-0.5 text-[9px] text-white font-mono">
                GPS: 26.8467°N, 80.9462°E
              </div>
            </div>
          </div>

          {/* Geo Timestamp */}
          <div className="flex items-center gap-2 rounded-[16px] bg-[#F6F5F1] p-3 border border-[#E4E2DD] text-[11px] text-[#737184]">
            <MapPin className="h-4 w-4 text-[#718A68] shrink-0" />
            <span>
              Geo-verified at Hazratganj Hub • Timestamp auto-recorded
            </span>
          </div>

          {/* Delivery Note */}
          <div>
            <label className="block text-xs font-semibold text-[#262238] mb-1">
              Inspection Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-[16px] border border-[#E4E2DD] bg-[#F6F5F1] px-3.5 py-2.5 text-xs text-[#262238] focus:bg-white focus:border-[#262238] focus:outline-none"
            />
          </div>

          {/* CTAs */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#E4E2DD] px-5 py-2.5 text-xs font-medium text-[#737184] hover:bg-[#F6F5F1] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-[#262238] px-6 py-2.5 text-xs font-medium text-white hover:bg-[#342e4c] transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-[#718A68]" />
              <span>{submitting ? "Verifying..." : "Confirm & Settle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
