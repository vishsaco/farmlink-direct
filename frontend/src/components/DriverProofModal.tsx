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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17201D]/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-[#E9E7E1] bg-[#FFFFFF] p-6 sm:p-8 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#7D8A65] hover:bg-[#F7F5EF] hover:text-[#17201D] transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#173D32] text-white shadow-sm">
            <Camera className="h-5 w-5 text-[#C99B43]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#17201D]">
              Proof of Delivery (POD)
            </h3>
            <p className="text-xs text-[#7D8A65]">
              Order #{orderId} • Driver Handoff Verification
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-[#C86B4A]/10 p-3 border border-[#C86B4A]/30 text-xs text-[#C86B4A]">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-[#173D32]" />
                <span>Customer Delivery OTP</span>
              </span>
              <span className="text-[10px] text-[#7D8A65]">
                Demo Code: <strong>8842</strong>
              </span>
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 4-digit buyer OTP"
              maxLength={6}
              className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3.5 py-2.5 text-base text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none tracking-widest text-center font-mono font-bold"
            />
          </div>

          {/* Photo Inspection Preview */}
          <div className="rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#17201D] flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-[#173D32]" />
                <span>Produce Visual Inspection</span>
              </span>
              <span className="text-[10px] text-[#173D32] font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Captured
              </span>
            </div>
            <div className="relative h-28 w-full overflow-hidden rounded-lg bg-[#E9E7E1]">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop"
                alt="Delivery Produce"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white font-mono">
                GPS: 26.8467°N, 80.9462°E
              </div>
            </div>
          </div>

          {/* Geo Timestamp */}
          <div className="flex items-center gap-2 rounded-xl bg-[#F7F5EF] p-2.5 border border-[#E9E7E1] text-[11px] text-[#7D8A65]">
            <MapPin className="h-4 w-4 text-[#173D32] shrink-0" />
            <span>
              Geo-verified at Hazratganj Hub • Timestamp auto-recorded
            </span>
          </div>

          {/* Delivery Note */}
          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">
              Inspection Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-[#E9E7E1] bg-[#F7F5EF] px-3 py-2 text-xs text-[#17201D] focus:bg-white focus:border-[#173D32] focus:outline-none"
            />
          </div>

          {/* CTAs */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#E9E7E1] px-5 py-2 text-xs font-semibold text-[#17201D] hover:bg-[#F7F5EF] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-[#173D32] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#215445] transition shadow-md disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{submitting ? "Verifying..." : "Confirm & Settle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
