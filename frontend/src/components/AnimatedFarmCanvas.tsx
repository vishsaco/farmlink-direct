"use client";

import React, { useState, useEffect } from "react";
import {
  Sprout,
  Truck,
  Building,
  Sun,
  Sunset,
} from "lucide-react";

type JourneyStage = "farm" | "transit" | "dock";

export function AnimatedFarmCanvas() {
  const [activeStage, setActiveStage] = useState<JourneyStage>("transit");
  const [timeOfDay, setTimeOfDay] = useState<"day" | "sunset">("day");
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle stages gently every 6 seconds if not actively hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveStage((prev) => {
        if (prev === "farm") return "transit";
        if (prev === "transit") return "dock";
        return "farm";
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const isSunset = timeOfDay === "sunset";

  return (
    <div
      className="relative w-full h-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── TOP RIGHT: DAYLIGHT / SUNSET TOGGLE ── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setTimeOfDay((prev) => (prev === "day" ? "sunset" : "day"))}
          className="glass-card px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-sm border border-[#E4E2DD]/90 hover:bg-white transition cursor-pointer text-[#262238] rounded-full backdrop-blur-md"
          title="Toggle Golden Hour Lighting"
        >
          {isSunset ? (
            <>
              <Sunset className="h-3.5 w-3.5 text-[#C99B43]" />
              <span className="text-[11px] font-medium">Sunset Mode</span>
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5 text-[#C99B43] animate-spin-slow" />
              <span className="text-[11px] font-medium">Daylight Mode</span>
            </>
          )}
        </button>
      </div>

      {/* ── MAIN WIDESCREEN PANORAMIC SVG (1200x520) ── */}
      <div className="w-full h-full">
        <svg
          viewBox="0 0 1200 520"
          className="w-full h-full object-cover transition-colors duration-1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Sky Gradients */}
            <linearGradient id="panoSkyDay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D5E6F2" />
              <stop offset="40%" stopColor="#E9F2F8" />
              <stop offset="80%" stopColor="#F4F8F3" />
              <stop offset="100%" stopColor="#F6F5F1" />
            </linearGradient>

            <linearGradient id="panoSkySunset" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FAD7A0" />
              <stop offset="35%" stopColor="#F8C471" />
              <stop offset="70%" stopColor="#EDBB99" />
              <stop offset="100%" stopColor="#F6F5F1" />
            </linearGradient>

            {/* Hill / Terrain Gradients */}
            <linearGradient id="panoHillFar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#859B80" />
              <stop offset="100%" stopColor="#6C8467" />
            </linearGradient>

            <linearGradient id="panoHillMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6A8A63" />
              <stop offset="100%" stopColor="#55754E" />
            </linearGradient>

            <linearGradient id="panoFieldSoil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5E7D56" />
              <stop offset="100%" stopColor="#435F3C" />
            </linearGradient>

            {/* Gomti River Gradient */}
            <linearGradient id="panoRiverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#85C1E9" />
              <stop offset="50%" stopColor="#5DADE2" />
              <stop offset="100%" stopColor="#3498DB" />
            </linearGradient>

            {/* Glowing Spotlight Filter for Interactive Focus */}
            <filter id="panoSpotlightGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Headlight Cone Gradient for Direct Logistics Truck */}
            <linearGradient id="panoHeadlightCone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#FFF59D" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFF59D" stopOpacity="0" />
            </linearGradient>

            {/* Sun Glow Filter */}
            <filter id="panoSunGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── 1. SKY BACKDROP ── */}
          <rect
            x="0"
            y="0"
            width="1200"
            height="520"
            fill={isSunset ? "url(#panoSkySunset)" : "url(#panoSkyDay)"}
            className="transition-colors duration-1000"
          />

          {/* ── 2. CELESTIAL SUN & ROTATING CORONA RAYS ── */}
          <g
            transform={isSunset ? "translate(960, 130)" : "translate(960, 85)"}
            className="transition-transform duration-1000"
          >
            {/* Ambient Warm Halo */}
            <circle
              r="70"
              fill={isSunset ? "#F5B041" : "#F7DC6F"}
              opacity={isSunset ? "0.35" : "0.25"}
              filter="url(#panoSunGlow)"
            />
            {/* Rotating Sun Rays (Daylight Only) */}
            {!isSunset && (
              <g className="animate-spin-slow origin-center opacity-40">
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1="0"
                    y1="-44"
                    x2="0"
                    y2="-58"
                    stroke="#F39C12"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    transform={`rotate(${deg})`}
                  />
                ))}
              </g>
            )}
            {/* Inner Sun Orb */}
            <circle
              r="34"
              fill={isSunset ? "#E67E22" : "#F1C40F"}
              filter="url(#panoSunGlow)"
            />
            <circle
              r="24"
              fill={isSunset ? "#F39C12" : "#FFF7D6"}
            />
          </g>

          {/* ── 3. PARALLAX DRIFTING CLOUDS ── */}
          <g className="opacity-75">
            {/* Cloud 1 (Slow & High) */}
            <g className="animate-cloud-drift-1">
              <path
                d="M120 70 q20 -20 40 0 q15 -10 30 5 q20 0 25 15 q-5 15 -25 15 h-65 q-20 0 -20 -15 q0 -15 15 -20 z"
                fill="#FFFFFF"
                opacity="0.85"
              />
            </g>
            {/* Cloud 2 (Mid Horizon) */}
            <g className="animate-cloud-drift-2">
              <path
                d="M620 90 q25 -25 50 0 q20 -12 40 5 q25 0 30 20 q-5 18 -30 18 h-85 q-25 0 -25 -20 q0 -18 20 -23 z"
                fill="#FFFFFF"
                opacity="0.7"
              />
            </g>
            {/* Cloud 3 (Right High) */}
            <g className="animate-cloud-drift-3">
              <path
                d="M920 65 q18 -18 36 0 q15 -10 28 5 q20 0 22 15 q-5 12 -22 12 h-60 q-18 0 -18 -15 q0 -12 14 -17 z"
                fill="#FFFFFF"
                opacity="0.6"
              />
            </g>
          </g>

          {/* ── 4. BIRDS / MIGRATION (Subtle ambient flight) ── */}
          <g className="animate-bird-flight opacity-40" stroke="#4A475A" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M420 110 q5 -6 10 0 q5 -6 10 0" />
            <path d="M445 122 q4 -5 8 0 q4 -5 8 0" />
            <path d="M432 135 q3.5 -4 7 0 q3.5 -4 7 0" />
          </g>

          {/* ── 5. DISTANT LUCKNOW ORCHARD RIDGES & HILLS ── */}
          {/* Back mountain ridge across full width */}
          <path
            d="M0 240 Q220 170 480 220 T940 185 T1200 230 L1200 520 L0 520 Z"
            fill={isSunset ? "#6E5B70" : "url(#panoHillFar)"}
            opacity="0.6"
            className="transition-colors duration-1000"
          />
          {/* Malihabad Mango Tree silhouettes along ridge */}
          {[160, 220, 310, 420, 520, 680, 760, 840, 940, 1060, 1140].map((x, i) => (
            <ellipse
              key={i}
              cx={x}
              cy={200 + (i % 3) * 6}
              rx={18 + (i % 4) * 3}
              ry={13 + (i % 3) * 2}
              fill={isSunset ? "#4D3D4E" : "#455E3D"}
              opacity="0.7"
            />
          ))}

          {/* Midground rolling organic hills */}
          <path
            d="M0 270 Q280 210 580 260 T1200 240 L1200 520 L0 520 Z"
            fill={isSunset ? "#584852" : "url(#panoHillMid)"}
            opacity="0.8"
            className="transition-colors duration-1000"
          />

          {/* Eco Wind Turbine on Ridge */}
          <g transform="translate(780, 205)">
            <path d="M-1.5 38 L-0.8 0 L0.8 0 L1.5 38 Z" fill="#E8E4F2" opacity="0.85" />
            <circle cx="0" cy="0" r="2.5" fill="#262238" />
            <g className="animate-windmill-spin origin-center">
              <path d="M0 0 L-0.8 -24 L0.8 -24 Z" fill="#FFFFFF" opacity="0.95" />
              <path d="M0 0 L21 12 L22 14 Z" fill="#FFFFFF" opacity="0.95" />
              <path d="M0 0 L-21 12 L-22 14 Z" fill="#FFFFFF" opacity="0.95" />
            </g>
          </g>

          {/* ── 6. GOMTI RIVER TRIBUTARY & STONE BRIDGE ── */}
          {/* Meandering river */}
          <path
            d="M600 280 C650 320 620 370 700 410 C760 440 730 490 790 520 L730 520 C670 480 680 440 640 410 C580 370 600 320 560 280 Z"
            fill="url(#panoRiverGrad)"
            opacity="0.75"
          />
          {/* Animated river ripple waves */}
          <g stroke="#EBF5FB" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" className="animate-river-shimmer">
            <path d="M610 320 q15 3 30 0" />
            <path d="M635 360 q20 4 35 0" />
            <path d="M670 420 q20 3 40 0" />
            <path d="M720 470 q20 3 40 0" />
          </g>

          {/* ── 7. THE RURAL FARM GATE (MALIHABAD / BKT) ── */}
          {/* Terraced Crop Field Soil */}
          <path
            d="M180 310 Q380 280 580 330 L520 520 L120 520 Z"
            fill="url(#panoFieldSoil)"
            className="transition-colors duration-700"
          />

          {/* Spotlight aura if activeStage === "farm" */}
          {activeStage === "farm" && (
            <ellipse
              cx="420"
              cy="390"
              rx="180"
              ry="110"
              fill="#F9E79F"
              opacity="0.28"
              filter="url(#panoSpotlightGlow)"
            />
          )}

          {/* ── ORGANIC TOMATO CROP FIELD ROWS ── */}
          <g className="origin-bottom">
            {/* Field Row 1 (Back) */}
            <path
              d="M240 345 Q360 320 500 355"
              stroke="#3D5636"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            {/* Field Row 2 (Mid) */}
            <path
              d="M220 385 Q360 355 520 395"
              stroke="#354D2F"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            {/* Field Row 3 (Front) */}
            <path
              d="M210 435 Q370 405 530 450"
              stroke="#2C4226"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />

            {/* SWAYING TOMATO PLANTS & RIPE PRODUCE */}
            {[
              { x: 260, y: 340, delay: "0s" },
              { x: 305, y: 334, delay: "0.4s" },
              { x: 355, y: 330, delay: "0.8s" },
              { x: 410, y: 332, delay: "0.2s" },
              { x: 465, y: 340, delay: "0.6s" },

              { x: 245, y: 378, delay: "0.3s" },
              { x: 295, y: 372, delay: "0.7s" },
              { x: 350, y: 368, delay: "0.1s" },
              { x: 415, y: 370, delay: "0.5s" },
              { x: 475, y: 382, delay: "0.9s" },

              { x: 235, y: 428, delay: "0.5s" },
              { x: 290, y: 420, delay: "0.2s" },
              { x: 345, y: 415, delay: "0.6s" },
              { x: 410, y: 418, delay: "0.1s" },
              { x: 480, y: 432, delay: "0.8s" },
            ].map((plant, i) => (
              <g key={i} transform={`translate(${plant.x}, ${plant.y})`}>
                <g className="animate-crop-sway" style={{ animationDelay: plant.delay }}>
                  {/* Stem & Leaves */}
                  <path d="M0 0 Q-4 -14 0 -22 Q4 -14 0 0" fill="#718A68" />
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
            {[495, 508, 520, 532, 545].map((wx, idx) => (
              <g key={idx} transform={`translate(${wx}, 360)`}>
                <g className="animate-wheat-sway" style={{ animationDelay: `${idx * 0.25}s` }}>
                  <path d="M0 0 Q3 -22 1 -36" stroke="#C99B43" strokeWidth="2" fill="none" />
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
          <g transform="translate(320, 245)">
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
          <g transform="translate(440, 360)">
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
          <g transform="translate(380, 365) scale(1.35)">
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
          {/* Main Paved Asphalt Highway spanning to Dock */}
          <path
            d="M480 395 C580 385 650 380 730 385 C830 395 910 410 1000 425 C1080 438 1140 442 1200 445"
            stroke="#262238"
            strokeWidth="42"
            strokeLinecap="round"
            fill="none"
          />
          {/* Smooth Road Curb Edges */}
          <path
            d="M480 395 C580 385 650 380 730 385 C830 395 910 410 1000 425 C1080 438 1140 442 1200 445"
            stroke="#4A4465"
            strokeWidth="36"
            strokeLinecap="round"
            fill="none"
          />
          {/* Animated Dashed Center Road Line */}
          <path
            d="M480 395 C580 385 650 380 730 385 C830 395 910 410 1000 425 C1080 438 1140 442 1200 445"
            stroke="#F7DC6F"
            strokeWidth="2.5"
            strokeDasharray="14 12"
            fill="none"
            className="animate-road-dashes"
          />

          {/* Stone Arch Bridge over River */}
          <g transform="translate(640, 368)">
            <rect x="0" y="0" width="70" height="10" rx="2" fill="#7F8C8D" />
            <circle cx="18" cy="18" r="10" fill="#2C3E50" opacity="0.2" />
            <circle cx="52" cy="18" r="10" fill="#2C3E50" opacity="0.2" />
            <path d="M0 0 L70 0" stroke="#BDC3C7" strokeWidth="2" />
          </g>

          {/* ── 9. THE INSTITUTIONAL BUYER DOCK (LUCKNOW HUB) ── */}
          <g transform="translate(1020, 240)">
            {/* Spotlight aura if activeStage === "dock" */}
            {activeStage === "dock" && (
              <ellipse
                cx="70"
                cy="130"
                rx="150"
                ry="95"
                fill="#A9DFBF"
                opacity="0.25"
                filter="url(#panoSpotlightGlow)"
              />
            )}

            {/* Building: Main High-Tech Cold Storage Facility */}
            <rect x="25" y="20" width="140" height="175" rx="6" fill="#262238" />
            <rect x="30" y="25" width="130" height="16" fill="#3D3759" rx="2" />
            <text x="44" y="37" fill="#718A68" fontSize="8.5" fontWeight="bold" letterSpacing="1">
              CENTRAL BUYER DOCK
            </text>

            {/* Illuminated Grid Windows */}
            {[0, 1, 2, 3].map((row) => (
              <g key={row} transform={`translate(42, ${52 + row * 24})`}>
                <rect x="0" y="0" width="20" height="13" rx="1.5" fill="#718A68" opacity="0.8" />
                <rect x="28" y="0" width="20" height="13" rx="1.5" fill="#E8E4F2" opacity="0.9" />
                <rect x="56" y="0" width="20" height="13" rx="1.5" fill="#718A68" opacity="0.8" />
                <rect x="84" y="0" width="20" height="13" rx="1.5" fill="#FAD7A0" opacity="0.9" />
              </g>
            ))}

            {/* Loading Bay & Dock Door */}
            <rect x="38" y="152" width="70" height="42" rx="3" fill="#1C1829" stroke="#718A68" strokeWidth="1.5" />
            <line x1="38" y1="162" x2="108" y2="162" stroke="#3D3759" strokeWidth="1" />
            <line x1="38" y1="172" x2="108" y2="172" stroke="#3D3759" strokeWidth="1" />
            <line x1="38" y1="182" x2="108" y2="182" stroke="#3D3759" strokeWidth="1" />

            {/* Green Operational Sensor Beacon */}
            <circle cx="100" cy="142" r="3.5" fill="#718A68" className="animate-pulse" />
            <rect x="32" y="194" width="82" height="6" fill="#7F8C8D" />
          </g>

          {/* ── 10. REFRIGERATED FARMLINK COLD-CHAIN TRUCK ── */}
          <g className="animate-truck-journey pointer-events-none">
            {/* Spotlight aura if activeStage === "transit" */}
            {activeStage === "transit" && (
              <ellipse
                cx="-10"
                cy="-6"
                rx="65"
                ry="35"
                fill="#E8E4F2"
                opacity="0.3"
                filter="url(#panoSpotlightGlow)"
              />
            )}

            {/* Projected Headlight Beam */}
            <polygon points="28,-4 105,-18 105,10 28,0" fill="url(#panoHeadlightCone)" />

            {/* Vehicle Shadow */}
            <ellipse cx="-10" cy="7" rx="38" ry="6" fill="#1C2833" opacity="0.4" />

            {/* Insulated Cargo Box */}
            <rect
              x="-48"
              y="-24"
              width="50"
              height="26"
              rx="3"
              fill="#FFFFFF"
              stroke="#262238"
              strokeWidth="1.2"
            />
            {/* Green Direct-Cold-Chain Accent Line */}
            <rect x="-48" y="-4" width="50" height="4" fill="#718A68" />

            {/* Crisp FarmLink Direct Logo */}
            <g transform="translate(-42, -18)">
              <circle cx="3" cy="4" r="2.5" fill="#718A68" />
              <text x="7" y="6.5" fill="#262238" fontSize="4.5" fontWeight="bold" fontFamily="sans-serif">
                FarmLink
              </text>
              <text x="7" y="10.5" fill="#737184" fontSize="2.8" fontWeight="600" letterSpacing="0.4">
                DIRECT
              </text>
            </g>

            {/* Refrigeration Unit on top */}
            <rect x="-45" y="-28" width="16" height="5" rx="1.5" fill="#BDC3C7" stroke="#262238" strokeWidth="0.8" />

            {/* Driver Cab */}
            <path
              d="M2 -20 L15 -20 Q22 -20 25 -13 L26 -2 Q26 2 22 2 L2 2 Z"
              fill="#262238"
            />
            {/* Windshield */}
            <path
              d="M4 -18 L14 -18 Q19 -18 21 -13 L22 -7 L4 -7 Z"
              fill="#A9CCE3"
              opacity="0.9"
            />
            {/* Cab Door Line */}
            <line x1="4" y1="-7" x2="4" y2="1" stroke="#3D3759" strokeWidth="1" />

            {/* Headlight Lamp */}
            <circle cx="26" cy="-2" r="2.2" fill="#F9E79F" />

            {/* Spinning Wheels with Rims */}
            <g transform="translate(-32, 2)">
              <circle cx="0" cy="0" r="5.5" fill="#262238" />
              <circle cx="0" cy="0" r="2.5" fill="#BDC3C7" />
              <g className="animate-spin-wheel origin-center">
                <line x1="-2" y1="0" x2="2" y2="0" stroke="#FFFFFF" strokeWidth="0.8" />
                <line x1="0" y1="-2" x2="0" y2="2" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            </g>

            <g transform="translate(-10, 2)">
              <circle cx="0" cy="0" r="5.5" fill="#262238" />
              <circle cx="0" cy="0" r="2.5" fill="#BDC3C7" />
              <g className="animate-spin-wheel origin-center">
                <line x1="-2" y1="0" x2="2" y2="0" stroke="#FFFFFF" strokeWidth="0.8" />
                <line x1="0" y1="-2" x2="0" y2="2" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            </g>

            <g transform="translate(18, 2)">
              <circle cx="0" cy="0" r="5.5" fill="#262238" />
              <circle cx="0" cy="0" r="2.5" fill="#BDC3C7" />
              <g className="animate-spin-wheel origin-center">
                <line x1="-2" y1="0" x2="2" y2="0" stroke="#FFFFFF" strokeWidth="0.8" />
                <line x1="0" y1="-2" x2="0" y2="2" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            </g>
          </g>

          {/* ── 11. FLOATING AMBIENT POLLEN PARTICLES ── */}
          <g>
            {[
              { cx: 340, cy: 320, delay: "0s", r: 1.8 },
              { cx: 460, cy: 360, delay: "1.2s", r: 2.2 },
              { cx: 580, cy: 300, delay: "2.4s", r: 1.5 },
              { cx: 720, cy: 340, delay: "0.8s", r: 2.0 },
              { cx: 890, cy: 280, delay: "1.6s", r: 1.7 },
              { cx: 1060, cy: 320, delay: "2.2s", r: 1.9 },
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
                filter="url(#panoSunGlow)"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* ── BOTTOM RIGHT: MINIMALIST GLASS JOURNEY STEPPER ── */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-30 pointer-events-auto">
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-[#E4E2DD]/90 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveStage("farm")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeStage === "farm"
                ? "bg-[#262238] text-white shadow-xs"
                : "text-[#737184] hover:bg-[#E8E4F2] hover:text-[#262238]"
            }`}
          >
            <Sprout className="h-3 w-3 text-[#718A68]" />
            <span className="text-[11px] sm:text-xs">1. Farm Gate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStage("transit")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeStage === "transit"
                ? "bg-[#262238] text-white shadow-xs"
                : "text-[#737184] hover:bg-[#E8E4F2] hover:text-[#262238]"
            }`}
          >
            <Truck className="h-3 w-3 text-[#718A68]" />
            <span className="text-[11px] sm:text-xs">2. Direct Transit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStage("dock")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeStage === "dock"
                ? "bg-[#262238] text-white shadow-xs"
                : "text-[#737184] hover:bg-[#E8E4F2] hover:text-[#262238]"
            }`}
          >
            <Building className="h-3 w-3 text-[#718A68]" />
            <span className="text-[11px] sm:text-xs">3. Buyer Dock</span>
          </button>
        </div>
      </div>
    </div>
  );
}
