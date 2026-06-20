"use client";

import { useEffect, useState } from "react";
import { SimulationState } from "@/hooks/useParkingSimulation";

interface OcrOverlayProps {
  state: SimulationState;
}

export function OcrOverlay({ state }: OcrOverlayProps) {
  const [scanLineY, setScanLineY] = useState(0);
  const [displayedChars, setDisplayedChars] = useState("");

  const isScanning =
    state.phase === "OCR_SCANNING" || state.phase === "EXIT_OCR_SCANNING";

  // Animate scan line
  useEffect(() => {
    if (!isScanning) return;
    let frame: number;
    let startTime: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;
      setScanLineY((Math.sin(elapsed * 2) * 0.5 + 0.5) * 100);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isScanning]);

  // Animate plate number reveal character by character
  useEffect(() => {
    if (!state.ocrResult) {
      setDisplayedChars("");
      return;
    }
    const full = state.ocrResult;
    let i = 0;
    setDisplayedChars("");
    const interval = setInterval(() => {
      i++;
      setDisplayedChars(full.slice(0, i));
      if (i >= full.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, [state.ocrResult]);

  if (!isScanning) return null;

  const isEntry = state.phase === "OCR_SCANNING";
  const accentColor = isEntry ? "#22C55E" : "#F59E0B";
  const glowColor = isEntry ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
      {/* Backdrop blur */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      />

      {/* OCR Panel */}
      <div
        className="relative z-10 w-[420px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 0 60px ${glowColor}, 0 0 120px ${glowColor}`,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{
            background: `linear-gradient(90deg, ${accentColor}20 0%, transparent 100%)`,
            borderBottom: `1px solid ${accentColor}30`,
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: `${accentColor}25`, border: `1px solid ${accentColor}50` }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" style={{ color: accentColor }}>
              <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" d="M9 9H4v5h5V9zm11 0h-5v5h5V9zM9 20H4v-5h5v5zm11 0h-5v-5h5v5z" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">
              {isEntry ? "SISTEM OCR – GATE MASUK" : "SISTEM OCR – GATE KELUAR"}
            </div>
            <div className="text-[10px] tracking-widest uppercase" style={{ color: accentColor }}>
              PARKFLOW.AI · Optical Character Recognition
            </div>
          </div>
          {/* Animated indicator */}
          <div className="ml-auto flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: accentColor }}
            />
            <span className="text-[9px] uppercase tracking-widest" style={{ color: accentColor }}>
              SCANNING
            </span>
          </div>
        </div>

        {/* Camera View Area */}
        <div className="px-6 py-4">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              height: "140px",
              background: "#000814",
              border: `1px solid ${accentColor}30`,
            }}
          >
            {/* Grid overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(${accentColor}10 1px, transparent 1px), linear-gradient(90deg, ${accentColor}10 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Scanning line */}
            <div
              className="absolute left-0 right-0 h-0.5 transition-none"
              style={{
                top: `${scanLineY}%`,
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                boxShadow: `0 0 8px ${accentColor}`,
              }}
            />

            {/* Corner brackets */}
            {[
              { top: 10, left: 10, borderTop: "2px solid", borderLeft: "2px solid" },
              { top: 10, right: 10, borderTop: "2px solid", borderRight: "2px solid" },
              { bottom: 10, left: 10, borderBottom: "2px solid", borderLeft: "2px solid" },
              { bottom: 10, right: 10, borderBottom: "2px solid", borderRight: "2px solid" },
            ].map((style, i) => (
              <div
                key={i}
                className="absolute w-6 h-6"
                style={{ ...style, borderColor: accentColor }}
              />
            ))}

            {/* Plate display area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                Deteksi Plat Nomor
              </div>
              <div
                className="px-6 py-2 rounded font-mono font-bold text-2xl tracking-widest text-white"
                style={{
                  background: "#111827",
                  border: `2px solid ${state.ocrResult ? accentColor : "#334155"}`,
                  minWidth: "220px",
                  textAlign: "center",
                  boxShadow: state.ocrResult ? `0 0 20px ${glowColor}` : "none",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
              >
                {displayedChars || (
                  <span className="text-slate-600 animate-pulse">· · · · · · · · ·</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-2">
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="text-slate-500 uppercase tracking-widest">Progress Analisis</span>
            <span style={{ color: accentColor }} className="font-mono">
              {state.ocrProgress.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${state.ocrProgress}%`,
                background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})`,
                boxShadow: `0 0 8px ${accentColor}`,
              }}
            />
          </div>
        </div>

        {/* Confidence Score */}
        <div className="px-6 pb-4 pt-2 flex items-center justify-between">
          <div className="flex gap-4">
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Confidence</div>
              <div className="font-mono text-sm font-bold" style={{ color: accentColor }}>
                {state.ocrConfidence > 0 ? `${state.ocrConfidence}%` : "—"}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Engine</div>
              <div className="font-mono text-sm font-bold text-slate-300">ANPR v3</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Mode</div>
              <div className="font-mono text-sm font-bold text-slate-300">
                {isEntry ? "ENTRY" : "EXIT"}
              </div>
            </div>
          </div>
          {state.ocrResult && (
            <div
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide"
              style={{
                background: `${accentColor}20`,
                border: `1px solid ${accentColor}50`,
                color: accentColor,
              }}
            >
              ✓ Terdeteksi
            </div>
          )}
        </div>

        {/* Status bar */}
        <div
          className="px-6 py-2 text-center text-[10px] text-slate-500 uppercase tracking-widest"
          style={{ borderTop: `1px solid ${accentColor}20` }}
        >
          {state.ocrResult
            ? `Plat ${state.ocrResult} berhasil diverifikasi · Gate akan terbuka`
            : "Memindai kendaraan yang mendekat..."}
        </div>
      </div>
    </div>
  );
}
