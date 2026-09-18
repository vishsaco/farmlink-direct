"use client";

import React, { useState, useEffect } from "react";
import {
  Sprout,
  Truck,
  Building,
  Sun,
  Sunset,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Navigation,
  Wind,
} from "lucide-react";

type JourneyStage = "farm" | "transit" | "dock";

export function AnimatedFarmCanvas() {
  const [activeStage, setActiveStage] = useState<JourneyStage>("transit");
  const [timeOfDay, setTimeOfDay] = useState<"day" | "sunset">("day");
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle stages gently every 5.5 seconds if not actively hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveStage((prev) => {
        if (prev === "farm") return "transit";
        if (prev === "transit") return "dock";
        return "farm";
      });
    }, 5500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const isSunset = timeOfDay === "sunset";

  return (
    <div
      className="relative rounded-[28px] overflow-hidden bg-white border border-[#E4E2DD] shadow-2xl transition-all duration-700 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── TOP FLOATING ACCENT BADGES ── */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="glass-card px-3 py-1.5 text-xs flex items-center gap-2 shadow-sm border border-white/60 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#718A68] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#718A68]"></span>
          </span>
          <span className="font-heading font-medium text-[#262238] text-[11px] sm:text-xs">
            Lucknow Organic Belt • Direct Gate
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setTimeOfDay((prev) => (prev === "day" ? "sunset" : "day"))}
          className="glass-card px-2.5 py-1.5 text-xs flex items-center gap-1.5 shadow-sm border border-white/60 hover:bg-white/90 transition cursor-pointer text-[#262238]"
          title="Toggle Golden Hour Lighting"
        >
          {isSunset ? (
            <>
              <Sunset className="h-3.5 w-3.5 text-[#C99B43]" />
              <span className="text-[10px] font-medium">Sunset</span>
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5 text-[#C99B43] animate-spin-slow" />
              <span className="text-[10px] font-medium">Daylight</span>
            </>
          )}
        </button>
      </div>

      {/* ── MAIN SVG ANIMATED LANDSCAPE ── */}
      <div className="relative h-[430px] sm:h-[490px] w-full overflow-hidden">
        <svg
          viewBox="0 0 800 520"
          className="w-full h-full object-cover transition-colors duration-1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Sky Gradients */}
            <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4E6F1" />
              <stop offset="45%" stopColor="#EAF2F8" />
              <stop offset="85%" stopColor="#F9FAF5" />
              <stop offset="100%" stopColor="#EBF5EC" />
            </linearGradient>

            <linearGradient id="skySunset" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FAD7A0" />
              <stop offset="35%" stopColor="#F8C471" />
              <stop offset="70%" stopColor="#EDBB99" />
              <stop offset="100%" stopColor="#D5D8DC" />
            </linearGradient>

            {/* Hill Gradients */}
            <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8FA887" />
              <stop offset="100%" stopColor="#6C8664" />
            </linearGradient>

            <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7B9973" />
              <stop offset="100%" stopColor="#536E4D" />
            </linearGradient>

            {/* Field Crop Gradients */}
            <linearGradient id="fieldWheat" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E8C371" />
              <stop offset="50%" stopColor="#DCB257" />
              <stop offset="100%" stopColor="#BF9539" />
            </linearGradient>

            <linearGradient id="fieldTomato" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B7853" />
              <stop offset="100%" stopColor="#3F5A37" />
            </linearGradient>

            {/* Road Gradient */}
            <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4A475A" />
              <stop offset="50%" stopColor="#393549" />
              <stop offset="100%" stopColor="#262238" />
            </linearGradient>

            {/* River Gradient */}
            <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#85C1E9" />
              <stop offset="50%" stopColor="#5DADE2" />
              <stop offset="100%" stopColor="#3498DB" />
            </linearGradient>

            {/* Sun Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="spotlightGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── 1. SKY BACKGROUND ── */}
          <rect
            x="0"
            y="0"
            width="800"
            height="520"
            fill={isSunset ? "url(#skySunset)" : "url(#skyDay)"}
            className="transition-all duration-1000"
          />

          {/* ── 2. CELESTIAL SUN & ROTATING CORONA ── */}
          <g transform={isSunset ? "translate(650, 140)" : "translate(130, 95)"} className="transition-all duration-1000">
            {/* Outer Pulsing Corona */}
            <circle
              r="48"
              fill={isSunset ? "#E74C3C" : "#F39C12"}
              opacity="0.18"
              className="animate-pulse"
            />
            {/* Rotating Sunrays */}
            <g className="animate-spin-slow">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1="0"
                  y1="-38"
                  x2="0"
                  y2="-48"
                  stroke={isSunset ? "#E67E22" : "#F1C40F"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${angle})`}
                  opacity="0.6"
                />
              ))}
            </g>
            {/* Core Sun Disc */}
            <circle
              r="26"
              fill={isSunset ? "#E67E22" : "#F7DC6F"}
              filter="url(#glow)"
            />
            <circle
              r="21"
              fill={isSunset ? "#F39C12" : "#FFF7D6"}
            />
          </g>

          {/* ── 3. DRIFTING CLOUDS (Layered Parallax) ── */}
          <g className="opacity-80">
            {/* Cloud 1 (High & Slow) */}
            <g className="animate-cloud-drift-1">
              <path
                d="M40 70 q20 -20 40 0 q15 -10 30 5 q20 0 25 15 q-5 15 -25 15 h-65 q-20 0 -20 -15 q0 -15 15 -20 z"
                fill="#FFFFFF"
                opacity="0.85"
              />
            </g>
            {/* Cloud 2 (Mid Horizon) */}
            <g className="animate-cloud-drift-2">
              <path
                d="M420 85 q25 -25 50 0 q20 -12 40 5 q25 0 30 20 q-5 18 -30 18 h-85 q-25 0 -25 -20 q0 -18 20 -23 z"
                fill="#FFFFFF"
                opacity="0.7"
              />
            </g>
            {/* Cloud 3 (Right) */}
            <g className="animate-cloud-drift-3">
              <path
                d="M620 60 q18 -18 36 0 q15 -10 28 5 q20 0 22 15 q-5 12 -22 12 h-60 q-18 0 -18 -15 q0 -12 14 -17 z"
                fill="#FFFFFF"
                opacity="0.6"
              />
            </g>
          </g>

          {/* ── 4. BIRDS / MIGRATION (Subtle ambient flight) ── */}
          <g className="animate-bird-flight opacity-50" stroke="#4A475A" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M220 110 q5 -6 10 0 q5 -6 10 0" />
            <path d="M245 122 q4 -5 8 0 q4 -5 8 0" />
            <path d="M232 135 q3.5 -4 7 0 q3.5 -4 7 0" />
          </g>

          {/* ── 5. DISTANT LUCKNOW HILLS & ORCHARD BELT ── */}
          {/* Back mountain ridge */}
          <path
            d="M0 240 Q160 170 340 220 T700 190 T800 230 L800 520 L0 520 Z"
            fill={isSunset ? "#6E5B70" : "url(#hillFar)"}
            opacity="0.65"
            className="transition-colors duration-1000"
          />
          {/* Malihabad Mango Tree silhouettes on ridge */}
          {[120, 160, 210, 270, 310, 480, 520, 580, 640].map((x, i) => (
            <ellipse
              key={i}
              cx={x}
              cy={205 + (i % 3) * 6}
              rx={16 + (i % 4) * 3}
              ry={12 + (i % 3) * 2}
              fill={isSunset ? "#4D3D4E" : "#455E3D"}
              opacity="0.75"
            />
          ))}

          {/* Midground rolling organic hills */}
          <path
            d="M0 270 Q200 210 420 260 T800 240 L800 520 L0 520 Z"
            fill={isSunset ? "#584852" : "url(#hillMid)"}
            opacity="0.85"
            className="transition-colors duration-1000"
          />

          {/* Renewable Wind Turbine on Hilltop */}
          <g transform="translate(460, 225)">
            <path d="M-1.5 35 L-0.8 0 L0.8 0 L1.5 35 Z" fill="#E8E4F2" opacity="0.85" />
            <circle cx="0" cy="0" r="2.5" fill="#262238" />
            <g className="animate-windmill-spin origin-center">
              <path d="M0 0 L-0.8 -22 L0.8 -22 Z" fill="#FFFFFF" opacity="0.95" />
              <path d="M0 0 L19 11 L20 13 Z" fill="#FFFFFF" opacity="0.95" />
              <path d="M0 0 L-19 11 L-20 13 Z" fill="#FFFFFF" opacity="0.95" />
            </g>
          </g>

          {/* ── 6. GOMTI RIVER TRIBUTARY & STONE BRIDGE ── */}
          {/* Meandering river */}
          <path
            d="M320 280 C360 320 340 370 410 410 C460 440 430 490 480 520 L420 520 C380 480 390 440 350 410 C300 370 310 320 280 280 Z"
            fill="url(#riverGrad)"
            opacity="0.75"
          />
          {/* Animated river ripple waves */}
          <g stroke="#EBF5FB" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" className="animate-river-shimmer">
            <path d="M330 320 q15 3 30 0" />
            <path d="M350 360 q20 4 35 0" />
            <path d="M380 420 q20 3 40 0" />
            <path d="M420 470 q20 3 40 0" />
          </g>

          {/* ── 7. THE LEFT SIDE: ORGANIC FARM GATE (MALIHABAD / BKT) ── */}
          {/* Terraced Crop Field Soil */}
          <path
            d="M0 310 Q140 280 310 330 L270 520 L0 520 Z"
            fill="#5E7D56"
            className="transition-colors duration-700"
          />

          {/* Spotlight aura if activeStage === "farm" */}
          {activeStage === "farm" && (
            <ellipse
              cx="160"
              cy="410"
              rx="150"
              ry="90"
              fill="#F9E79F"
              opacity="0.22"
              filter="url(#spotlightGlow)"
            />
          )}

          {/* ── ORGANIC TOMATO CROP FIELD ROWS ── */}
          <g className="origin-bottom">
            {/* Field Row 1 (Back) */}
            <path
              d="M10 345 Q120 320 260 355"
              stroke="#435C3B"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            {/* Field Row 2 (Mid) */}
            <path
              d="M0 385 Q130 355 275 395"
              stroke="#3A5233"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            {/* Field Row 3 (Front) */}
            <path
              d="M0 435 Q140 405 285 450"
              stroke="#334A2D"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />

            {/* SWAYING TOMATO PLANTS & RIPE PRODUCE */}
            {[
              { x: 35, y: 340, delay: "0s" },
              { x: 75, y: 334, delay: "0.4s" },
              { x: 120, y: 330, delay: "0.8s" },
              { x: 165, y: 332, delay: "0.2s" },
              { x: 210, y: 340, delay: "0.6s" },

              { x: 25, y: 378, delay: "0.3s" },
              { x: 70, y: 372, delay: "0.7s" },
              { x: 115, y: 368, delay: "0.1s" },
              { x: 165, y: 370, delay: "0.5s" },
              { x: 220, y: 382, delay: "0.9s" },

              { x: 20, y: 428, delay: "0.5s" },
              { x: 65, y: 420, delay: "0.2s" },
              { x: 115, y: 415, delay: "0.6s" },
              { x: 170, y: 418, delay: "0.1s" },
              { x: 230, y: 432, delay: "0.8s" },
            ].map((plant, i) => (
              <g key={i} transform={`translate(${plant.x}, ${plant.y})`}>
                <g className="animate-crop-sway" style={{ animationDelay: plant.delay }}>
                  {/* Stem & Leaves */}
                  <path
                    d="M0 0 Q-4 -14 0 -22 Q4 -14 0 0"
                    fill="#718A68"
                  />
                  <ellipse cx="-5" cy="-14" rx="5" ry="3" fill="#88A87E" transform="rotate(-25 -5 -14)" />
                  <ellipse cx="6" cy="-17" rx="5" ry="3" fill="#88A87E" transform="rotate(25 6 -17)" />
                  <ellipse cx="0" cy="-24" rx="4" ry="2.5" fill="#A1C497" />

                  {/* Ripe Glossy Tomatoes */}
                  <circle cx="-3" cy="-11" r="4.2" fill="#E74C3C" />
                  <circle cx="-4" cy="-12" r="1.3" fill="#F5B7B1" opacity="0.8" />
                  <circle cx="4" cy="-9" r="3.8" fill="#C0392B" />
                  <circle cx="1" cy="-16" r="3.2" fill="#E74C3C" />
                </g>
              </g>
            ))}
          </g>

          {/* ── GOLDEN WHEAT BORDER SECTION (SWAYING EARS) ── */}
          <g className="origin-bottom">
            {[260, 272, 284, 296, 308].map((wx, idx) => (
              <g key={idx} transform={`translate(${wx}, 360)`}>
                <g className="animate-wheat-sway" style={{ animationDelay: `${idx * 0.25}s` }}>
                  <path d="M0 0 Q3 -22 1 -36" stroke="#C99B43" strokeWidth="2" fill="none" />
                  {/* Wheat grains */}
                  {[-10, -18, -26, -34].map((gy, gi) => (
                    <ellipse
                      key={gi}
                      cx={gi % 2 === 0 ? 3 : -2}
                      cy={gy}
                      rx="2"
                      ry="4"
                      fill="#E5B25D"
                      transform={`rotate(${gi % 2 === 0 ? 25 : -25} ${gi % 2 === 0 ? 3 : -2} ${gy})`}
                    />
                  ))}
                </g>
              </g>
            ))}
          </g>

          {/* ── MODERN ECO-FARM PACKHOUSE / SHED ── */}
          <g transform="translate(60, 240)">
            {/* Barn Walls */}
            <path d="M0 45 L0 15 L32 0 L64 15 L64 45 Z" fill="#262238" />
            {/* Barn Roof with Solar Panels */}
            <path d="M-4 15 L32 -3 L68 15 Z" fill="#3D3759" />
            <polygon points="4,13 32,0 60,13 32,2" fill="#2E4053" opacity="0.8" />
            <line x1="18" y1="9" x2="46" y2="9" stroke="#5DADE2" strokeWidth="1" opacity="0.7" />
            {/* Barn Door */}
            <rect x="22" y="24" width="20" height="21" rx="2" fill="#E8E4F2" />
            <rect x="25" y="27" width="14" height="18" fill="#262238" opacity="0.3" />
            {/* Smart IoT Sensor Beacon (Blinking green) */}
            <circle cx="32" cy="-6" r="3" fill="#718A68" className="animate-ping" />
            <circle cx="32" cy="-6" r="2.5" fill="#718A68" />
            <line x1="32" y1="-3" x2="32" y2="0" stroke="#718A68" strokeWidth="1.5" />
          </g>

          {/* ── HARVEST CRATES AT FARM GATE ── */}
          <g transform="translate(185, 360)">
            {/* Wooden Crate 1 */}
            <rect x="0" y="0" width="24" height="14" rx="2" fill="#AF601A" stroke="#7E420C" strokeWidth="1" />
            <line x1="0" y1="7" x2="24" y2="7" stroke="#7E420C" strokeWidth="0.8" />
            {/* Produce inside Crate 1 */}
            <circle cx="6" cy="1" r="3.5" fill="#E74C3C" />
            <circle cx="12" cy="0" r="3.8" fill="#C0392B" />
            <circle cx="18" cy="1" r="3.5" fill="#E74C3C" />

            {/* Wooden Crate 2 (Stacked) */}
            <rect x="18" y="6" width="22" height="14" rx="2" fill="#AF601A" stroke="#7E420C" strokeWidth="1" />
            <circle cx="23" cy="7" r="3.2" fill="#27AE60" />
            <circle cx="29" cy="6" r="3.5" fill="#F39C12" />
            <circle cx="35" cy="7" r="3.2" fill="#E74C3C" />
          </g>

          {/* ── ACTIVE FARMER CHARACTER (HARVESTING MOTION) ── */}
          <g transform="translate(130, 365) scale(1.3)">
            <g className="animate-farmer-harvest">
              {/* Shadow */}
              <ellipse cx="8" cy="42" rx="14" ry="4" fill="#1C2833" opacity="0.3" />
              {/* Legs */}
              <path d="M3 24 L3 40 L0 42" stroke="#262238" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M12 24 L14 39 L17 41" stroke="#262238" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              {/* Torso / Kurta Shirt */}
              <path d="M-1 10 Q7 8 16 10 L14 26 L1 26 Z" fill="#E8E4F2" />
              {/* Farmer Waistband */}
              <line x1="1" y1="24" x2="14" y2="24" stroke="#718A68" strokeWidth="2.5" />
              {/* Left Arm reaching down to pick tomato */}
              <path d="M1 12 Q-6 20 -9 26" stroke="#E8E4F2" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <circle cx="-10" cy="27" r="2.5" fill="#D35400" />
              {/* Right Arm holding wicker basket */}
              <path d="M15 12 Q20 18 20 24" stroke="#E8E4F2" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              {/* Wicker Harvest Basket */}
              <path d="M16 23 Q22 23 27 23 L25 32 Q21.5 34 18 32 Z" fill="#D35400" stroke="#A04000" strokeWidth="1" />
              <circle cx="20" cy="22" r="2.5" fill="#E74C3C" />
              <circle cx="24" cy="22" r="2.5" fill="#C0392B" />
              {/* Head & Traditional Pagdi / Turban */}
              <circle cx="7" cy="4" r="5.5" fill="#BA4A00" />
              {/* Wide Straw Hat / Pagdi */}
              <ellipse cx="7" cy="0" rx="13" ry="4" fill="#C99B43" stroke="#9A7D0A" strokeWidth="1" />
              <ellipse cx="7" cy="-2" rx="7" ry="3.5" fill="#E5B25D" />
            </g>
          </g>

          {/* ── 8. THE CONNECTING WINDING HIGHWAY & BRIDGE ── */}
          {/* Main Paved Asphalt Highway */}
          <path
            d="M230 390 C290 380 340 375 390 380 C470 390 520 405 600 420 C680 435 730 440 800 445"
            stroke="#262238"
            strokeWidth="38"
            strokeLinecap="round"
            fill="none"
          />
          {/* Smooth Road Curb Edges */}
          <path
            d="M230 390 C290 380 340 375 390 380 C470 390 520 405 600 420 C680 435 730 440 800 445"
            stroke="#4A4465"
            strokeWidth="34"
            strokeLinecap="round"
            fill="none"
          />
          {/* Animated Dashed Center Road Line */}
          <path
            d="M230 390 C290 380 340 375 390 380 C470 390 520 405 600 420 C680 435 730 440 800 445"
            stroke="#F7DC6F"
            strokeWidth="2.5"
            strokeDasharray="14 12"
            fill="none"
            className="animate-road-dashes"
          />

          {/* Stone Arch Bridge over River */}
          <g transform="translate(350, 362)">
            <rect x="0" y="0" width="65" height="10" rx="2" fill="#7F8C8D" />
            <circle cx="16" cy="18" r="10" fill="#2C3E50" opacity="0.2" />
            <circle cx="48" cy="18" r="10" fill="#2C3E50" opacity="0.2" />
            <path d="M0 0 L65 0" stroke="#BDC3C7" strokeWidth="2" />
          </g>

          {/* ── 9. THE RIGHT SIDE: INSTITUTIONAL BUYER DOCK (LUCKNOW HUB) ── */}
          <g transform="translate(630, 260)">
            {/* Spotlight aura if activeStage === "dock" */}
            {activeStage === "dock" && (
              <ellipse
                cx="70"
                cy="120"
                rx="140"
                ry="90"
                fill="#A9DFBF"
                opacity="0.25"
                filter="url(#spotlightGlow)"
              />
            )}

            {/* Modern Institutional Terminal Architecture */}
            {/* Building 1: Main High-Tech Cold Storage Facility */}
            <rect x="30" y="20" width="130" height="160" rx="6" fill="#262238" />
            <rect x="35" y="25" width="120" height="15" fill="#3D3759" rx="2" />
            <text x="50" y="36" fill="#718A68" fontSize="8" fontWeight="bold" letterSpacing="1">
              CENTRAL BUYER DOCK
            </text>

            {/* Illuminated Grid Windows */}
            {[0, 1, 2, 3].map((row) => (
              <g key={row} transform={`translate(45, ${50 + row * 22})`}>
                <rect x="0" y="0" width="18" height="12" rx="1.5" fill="#718A68" opacity="0.8" />
                <rect x="25" y="0" width="18" height="12" rx="1.5" fill="#E8E4F2" opacity="0.9" />
                <rect x="50" y="0" width="18" height="12" rx="1.5" fill="#718A68" opacity="0.8" />
                <rect x="75" y="0" width="18" height="12" rx="1.5" fill="#FAD7A0" opacity="0.9" />
              </g>
            ))}

            {/* Loading Bay & Dock Door */}
            <rect x="40" y="142" width="60" height="38" rx="3" fill="#1C1829" stroke="#718A68" strokeWidth="1.5" />
            <line x1="40" y1="152" x2="100" y2="152" stroke="#3D3759" strokeWidth="1" />
            <line x1="40" y1="162" x2="100" y2="162" stroke="#3D3759" strokeWidth="1" />
            <line x1="40" y1="172" x2="100" y2="172" stroke="#3D3759" strokeWidth="1" />

            {/* Green Arrival Sensor Beacon */}
            <circle cx="70" cy="138" r="4" fill="#2ECC71" className="animate-ping" />
            <circle cx="70" cy="138" r="3" fill="#2ECC71" />

            {/* Secondary Modern Glass Office Tower (Background) */}
            <rect x="110" y="-15" width="55" height="160" rx="4" fill="#342E4C" />
            <rect x="118" y="-5" width="40" height="8" fill="#5A7352" opacity="0.7" />
            {[0, 1, 2, 4].map((r) => (
              <rect key={r} x="118" y={15 + r * 16} width="38" height="9" fill="#E8E4F2" opacity="0.65" rx="1" />
            ))}
          </g>

          {/* ── 10. ANIMATED FARMLINK DIRECT ELECTRIC DELIVERY TRUCK ── */}
          {/* The vehicle smoothly traverses along the road path */}
          <g className="animate-truck-journey origin-center">
            {/* Spotlight aura if activeStage === "transit" */}
            {activeStage === "transit" && (
              <ellipse
                cx="0"
                cy="0"
                rx="60"
                ry="35"
                fill="#5DADE2"
                opacity="0.25"
                filter="url(#spotlightGlow)"
              />
            )}

            {/* Truck Shadow */}
            <ellipse cx="0" cy="18" rx="44" ry="7" fill="#17202A" opacity="0.38" />

            {/* Temperature-Controlled Cargo Container */}
            <rect x="-44" y="-22" width="52" height="34" rx="4" fill="#FFFFFF" stroke="#262238" strokeWidth="1.5" />
            {/* Refrigeration Unit on Front */}
            <rect x="-48" y="-18" width="6" height="14" rx="1" fill="#718A68" />
            {/* FarmLink Logo & Fresh Produce Leaf Decal */}
            <g transform="translate(-28, -8)">
              <text x="0" y="0" fill="#262238" fontSize="6.5" fontWeight="900" letterSpacing="0.5" fontFamily="sans-serif">
                FarmLink
              </text>
              <text x="1" y="7" fill="#718A68" fontSize="4.5" fontWeight="bold" letterSpacing="0.8">
                DIRECT TRANSIT
              </text>
              <circle cx="-5" cy="-2" r="3" fill="#718A68" />
              <path d="M-6 -4 Q-4 -2 -5 1" stroke="#FFFFFF" strokeWidth="0.8" fill="none" />
            </g>

            {/* Truck Cab (Aerodynamic Electric Design) */}
            <path
              d="M8 -14 L24 -14 Q32 -8 34 2 L34 12 L8 12 Z"
              fill="#262238"
              stroke="#262238"
              strokeWidth="1"
            />
            {/* Windshield with Sky Reflection */}
            <path
              d="M11 -11 L22 -11 Q28 -6 29 1 L11 1 Z"
              fill="#85C1E9"
              opacity="0.85"
            />
            {/* Driver Profile */}
            <circle cx="17" cy="-3" r="3" fill="#E8E4F2" />
            <rect x="15" y="0" width="5" height="5" fill="#718A68" rx="1" />

            {/* Headlights & Light Beam Cone */}
            <polygon
              points="34,6 80,0 80,22 34,11"
              fill="#F9E79F"
              opacity="0.3"
              className="pointer-events-none"
            />
            <circle cx="33" cy="8" r="2.5" fill="#F4D03F" />

            {/* Tail Light */}
            <rect x="-45" y="4" width="2" height="5" rx="0.5" fill="#E74C3C" />

            {/* Truck Wheels (Rotating Spoke Animation) */}
            {/* Rear Wheel 1 */}
            <g transform="translate(-32, 14)" className="animate-spin-wheel">
              <circle r="6.5" fill="#1C2833" />
              <circle r="4" fill="#7F8C8D" />
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#FFFFFF" strokeWidth="1" />
            </g>
            {/* Rear Wheel 2 */}
            <g transform="translate(-18, 14)" className="animate-spin-wheel">
              <circle r="6.5" fill="#1C2833" />
              <circle r="4" fill="#7F8C8D" />
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#FFFFFF" strokeWidth="1" />
            </g>
            {/* Front Wheel */}
            <g transform="translate(22, 14)" className="animate-spin-wheel">
              <circle r="6.5" fill="#1C2833" />
              <circle r="4" fill="#7F8C8D" />
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#FFFFFF" strokeWidth="1" />
            </g>
          </g>

          {/* ── 11. FLOATING AMBIENT GOLDEN POLLEN & PARTICLES ── */}
          <g className="pointer-events-none">
            {[
              { cx: 80, cy: 300, delay: "0s", r: 2.2 },
              { cx: 140, cy: 260, delay: "1.4s", r: 1.8 },
              { cx: 200, cy: 320, delay: "2.1s", r: 2.5 },
              { cx: 260, cy: 280, delay: "0.8s", r: 2.0 },
              { cx: 340, cy: 250, delay: "2.8s", r: 1.6 },
              { cx: 480, cy: 300, delay: "1.2s", r: 2.2 },
              { cx: 580, cy: 270, delay: "0.5s", r: 2.4 },
              { cx: 700, cy: 240, delay: "2.2s", r: 1.9 },
            ].map((p, idx) => (
              <circle
                key={idx}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill="#F7DC6F"
                className="animate-pollen-float"
                style={{ animationDelay: p.delay }}
                opacity="0.85"
                filter="url(#glow)"
              />
            ))}
          </g>
        </svg>

        {/* ── FLOATING STAGE TOOLTIP / SPOTLIGHT CARD ── */}
        <div className="absolute top-14 left-4 z-20 max-w-xs sm:max-w-sm pointer-events-none">
          <div className="glass-card px-3.5 py-2 text-xs flex items-center gap-2.5 shadow-lg border border-white/70 backdrop-blur-xl animate-fade-in-up">
            {activeStage === "farm" && (
              <>
                <div className="w-6 h-6 rounded-full bg-[#E3EBE0] flex items-center justify-center text-[#718A68] shrink-0">
                  <Sprout className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-heading font-semibold text-[#262238] flex items-center gap-1.5 flex-wrap">
                    <span>Farm Gate Harvest</span>
                    <span className="text-[10px] text-[#718A68] font-mono bg-[#E3EBE0] px-1.5 py-0.2 rounded font-semibold">
                      0% Middlemen
                    </span>
                  </div>
                  <p className="text-[10px] text-[#737184] leading-tight">
                    Hand-harvested & graded directly at verified Lucknow farms.
                  </p>
                </div>
              </>
            )}

            {activeStage === "transit" && (
              <>
                <div className="w-6 h-6 rounded-full bg-[#E8E4F2] flex items-center justify-center text-[#262238] shrink-0">
                  <Truck className="h-3.5 w-3.5 text-[#718A68]" />
                </div>
                <div>
                  <div className="font-heading font-semibold text-[#262238] flex items-center gap-1.5 flex-wrap">
                    <span>Direct Cold-Chain Transit</span>
                    <span className="text-[10px] text-[#262238] font-mono bg-[#E8E4F2] px-1.5 py-0.2 rounded font-semibold">
                      Zero Mandi Loss
                    </span>
                  </div>
                  <p className="text-[10px] text-[#737184] leading-tight">
                    GPS-tracked refrigerated fleet bypasses APMC congestion.
                  </p>
                </div>
              </>
            )}

            {activeStage === "dock" && (
              <>
                <div className="w-6 h-6 rounded-full bg-[#E3EBE0] flex items-center justify-center text-[#718A68] shrink-0">
                  <Building className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-heading font-semibold text-[#262238] flex items-center gap-1.5 flex-wrap">
                    <span>Buyer Dock & Escrow</span>
                    <span className="text-[10px] text-[#718A68] font-mono bg-[#E3EBE0] px-1.5 py-0.2 rounded font-semibold">
                      Instant Payout
                    </span>
                  </div>
                  <p className="text-[10px] text-[#737184] leading-tight">
                    OTP delivery unlocks 93% net revenue directly to farmer bank.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── BOTTOM INTERACTIVE STAGE STEPPER ── */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl p-3 sm:p-3.5 border-t border-[#E4E2DD] z-20">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#737184] hidden sm:block">
              Journey Flow:
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 flex-1 max-w-lg mx-auto">
              <button
                type="button"
                onClick={() => setActiveStage("farm")}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeStage === "farm"
                    ? "bg-[#262238] text-white shadow-xs"
                    : "bg-[#F6F5F1] text-[#737184] hover:bg-[#E8E4F2] hover:text-[#262238]"
                }`}
              >
                <Sprout className="h-3 w-3 text-[#718A68]" />
                <span className="truncate text-[11px]">1. Farm Gate</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStage("transit")}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeStage === "transit"
                    ? "bg-[#262238] text-white shadow-xs"
                    : "bg-[#F6F5F1] text-[#737184] hover:bg-[#E8E4F2] hover:text-[#262238]"
                }`}
              >
                <Truck className="h-3 w-3 text-[#718A68]" />
                <span className="truncate text-[11px]">2. Direct Transit</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStage("dock")}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeStage === "dock"
                    ? "bg-[#262238] text-white shadow-xs"
                    : "bg-[#F6F5F1] text-[#737184] hover:bg-[#E8E4F2] hover:text-[#262238]"
                }`}
              >
                <Building className="h-3 w-3 text-[#718A68]" />
                <span className="truncate text-[11px]">3. Buyer Dock</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
