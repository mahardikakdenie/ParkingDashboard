"use client";

import React from "react";

interface CompanyLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon-only";
  showStatusDot?: boolean;
  className?: string;
}

export function CompanyLogo({
  size = "md",
  variant = "full",
  showStatusDot = false,
  className = "",
}: CompanyLogoProps) {
  // Mapping Ukuran Komponen
  const sizeMap = {
    sm: { icon: "w-8 h-8", svg: 32, text: "text-base", subtext: "text-[9px]" },
    md: { icon: "w-10 h-10", svg: 40, text: "text-lg", subtext: "text-[10px]" },
    lg: { icon: "w-12 h-12", svg: 48, text: "text-xl", subtext: "text-[11px]" },
    xl: { icon: "w-16 h-16", svg: 64, text: "text-2xl", subtext: "text-xs" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Container Emblem Logo Utama */}
      <div className="relative group flex items-center justify-center shrink-0">
        {/* Layer Ambient Glow Halo */}
        <div className="absolute -inset-1.5 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-40 blur-md group-hover:opacity-85 group-hover:blur-lg transition-all duration-300 pointer-events-none" />

        {/* Emblem Shield Geometric Vector SVG */}
        <div className={`relative ${currentSize.icon} rounded-2xl bg-slate-950/90 border border-slate-700/80 p-2 flex items-center justify-center shadow-2xl shadow-indigo-950/80 backdrop-blur-md group-hover:scale-105 transition-transform duration-300`}>
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="logo-grad-primary" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="0.5" stopColor="#6366F1" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="logo-grad-accent" x1="40" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="1" stopColor="#A855F7" />
              </linearGradient>
            </defs>

            {/* Frame Outer Hex Shield */}
            <path
              d="M20 3L35 11.55V28.45L20 37L5 28.45V11.55L20 3Z"
              stroke="url(#logo-grad-primary)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            />

            {/* Futuristic Gate Barrier Lines */}
            <path
              d="M12 16L20 21L28 16"
              stroke="url(#logo-grad-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 24L20 29L28 24"
              stroke="url(#logo-grad-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active Core Laser Pulse Dot */}
            <circle cx="20" cy="20" r="2.5" fill="#38BDF8" className="animate-pulse" />
          </svg>
        </div>

        {/* Indikator Online Status Dot */}
        {showStatusDot && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse z-10 shadow-md shadow-emerald-950/50" />
        )}
      </div>

      {/* Teks Judul Brand Enterprise */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`${currentSize.text} font-black tracking-tight text-white font-sans drop-shadow-sm`}>
              Nex<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-cyan-300">Gate</span>
            </span>
          </div>
          <span className={`${currentSize.subtext} font-mono tracking-widest text-slate-400 uppercase font-semibold mt-1`}>
            Parking Subsystem
          </span>
        </div>
      )}
    </div>
  );
}
