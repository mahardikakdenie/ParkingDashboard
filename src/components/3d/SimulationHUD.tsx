"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { SimulationState, SimulationPhase } from "@/hooks/useParkingSimulation";

interface SimulationHUDProps {
  state: SimulationState;
  onReset: () => void;
}

const phaseLabels: Record<SimulationPhase, string> = {
  IDLE: "Siap – Gerakkan mobil ke Gate Masuk",
  APPROACHING_ENTRY: "Mendekati Gate Masuk…",
  OCR_SCANNING: "Memindai Plat Nomor…",
  ENTRY_GATE_OPEN: "Gate Terbuka – Silakan Masuk!",
  PARKED: "Di Dalam Area Parkir – Gerak ke Gate Keluar",
  APPROACHING_EXIT: "Mendekati Gate Keluar…",
  EXIT_OCR_SCANNING: "Verifikasi Kendaraan…",
  EXIT_PAYMENT: "Kalkulasi Tarif – Silakan Bayar",
  EXIT_GATE_OPEN: "Gate Keluar Terbuka – Selamat Jalan!",
  COMPLETED: "Simulasi Selesai! Tekan Reset untuk Ulangi",
};

const phaseColors: Record<SimulationPhase, string> = {
  IDLE: "#94A3B8",
  APPROACHING_ENTRY: "#60A5FA",
  OCR_SCANNING: "#A78BFA",
  ENTRY_GATE_OPEN: "#34D399",
  PARKED: "#60A5FA",
  APPROACHING_EXIT: "#FBBF24",
  EXIT_OCR_SCANNING: "#A78BFA",
  EXIT_PAYMENT: "#FBBF24",
  EXIT_GATE_OPEN: "#34D399",
  COMPLETED: "#34D399",
};

function ElapsedTimer({ startTime }: { startTime: Date | null }) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!startTime) {
      setElapsed("00:00:00");
      return;
    }
    const update = () => {
      const now = Date.now();
      // Apply time multiplier for display
      const diffMs = (now - startTime.getTime()) * 300;
      const totalSecs = Math.floor(diffMs / 1000);
      const h = Math.floor(totalSecs / 3600).toString().padStart(2, "0");
      const m = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, "0");
      const s = (totalSecs % 60).toString().padStart(2, "0");
      setElapsed(`${h}:${m}:${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono">{elapsed}</span>;
}

// Minimap: top-down 2D minimap
function Minimap() {
  const SIZE = 120;
  const WORLD = 36; // world radius
  const scale = SIZE / (WORLD * 2);

  const dotRef = useRef<HTMLDivElement>(null);

  // Initial position: x = -4.5, z = 24
  const initialCx = SIZE / 2 + (-4.5) * scale;
  const initialCy = SIZE / 2 + 24 * scale;

  useEffect(() => {
    const handleCarMoved = (e: Event) => {
      const { x, z, rot } = (e as CustomEvent).detail;
      if (dotRef.current) {
        const cx = SIZE / 2 + x * scale;
        const cy = SIZE / 2 + z * scale;
        dotRef.current.style.left = `${cx - 6}px`;
        dotRef.current.style.top = `${cy - 8}px`;
        dotRef.current.style.transform = `rotate(${rot}rad)`;
      }
    };

    window.addEventListener("car-moved", handleCarMoved);
    return () => window.removeEventListener("car-moved", handleCarMoved);
  }, [scale]);

  // Entry gate at ~(-4.5, 20), exit gate at ~(8.5, 20) in world space
  const entryGateX = SIZE / 2 + (-4.5) * scale;
  const exitGateX = SIZE / 2 + 8.5 * scale;
  const gateY = SIZE / 2 + 20 * scale;

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        width: SIZE,
        height: SIZE,
        background: "#0F172A",
        border: "1px solid rgba(59,130,246,0.3)",
      }}
    >
      {/* Parking lot area */}
      <div
        className="absolute"
        style={{
          left: SIZE / 2 - 16 * scale,
          top: SIZE / 2 - 18 * scale,
          width: 32 * scale,
          height: 36 * scale,
          background: "rgba(30,41,59,0.8)",
          border: "1px solid rgba(59,130,246,0.2)",
        }}
      />
      {/* Driving lane */}
      <div
        className="absolute"
        style={{
          left: SIZE / 2 - 4 * scale,
          top: SIZE / 2 - 18 * scale,
          width: 8 * scale,
          height: 36 * scale,
          background: "rgba(15,23,42,0.9)",
        }}
      />
      {/* Entry gate marker */}
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{
          left: entryGateX - 4,
          top: gateY - 4,
          background: "#22C55E",
          boxShadow: "0 0 6px #22C55E",
        }}
      />
      {/* Exit gate marker */}
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{
          left: exitGateX - 4,
          top: gateY - 4,
          background: "#EF4444",
          boxShadow: "0 0 6px #EF4444",
        }}
      />
      {/* Car dot */}
      <div
        ref={dotRef}
        className="absolute w-3 h-4 rounded-sm"
        style={{
          left: initialCx - 6,
          top: initialCy - 8,
          background: "#DC2626",
          boxShadow: "0 0 8px rgba(220,38,38,0.8)",
          transform: `rotate(${Math.PI}rad)`,
          transformOrigin: "center",
          border: "1px solid #FCA5A5",
        }}
      />
      {/* Labels */}
      <div className="absolute bottom-1 left-1 text-[7px] text-slate-500 uppercase tracking-widest">
        Minimap
      </div>
      {/* Legend */}
      <div className="absolute bottom-1 right-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[6px] text-slate-500">IN</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="text-[6px] text-slate-500">OUT</span>
        </div>
      </div>
    </div>
  );
}

export function SimulationHUD({ state, onReset }: SimulationHUDProps) {
  const phaseColor = phaseColors[state.phase];
  const phaseLabel = phaseLabels[state.phase];
  const isCompleted = state.phase === "COMPLETED";

  return (
    <div className="fixed inset-0 pointer-events-none z-20">

      {/* ===== TOP BAR ===== */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
        }}
      >
        {/* Back button + Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
            style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(100,116,139,0.4)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">3D PARKING DEMO</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest">Udin Park · Simulation</div>
          </div>
        </div>

        {/* Timer & Gate Status */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          {state.entryTime && (
            <div
              className="px-3 py-1.5 rounded-lg text-center"
              style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(100,116,139,0.3)" }}
            >
              <div className="text-[8px] text-slate-500 uppercase tracking-widest">Durasi (sim)</div>
              <div className="text-blue-400 text-sm font-bold">
                <ElapsedTimer startTime={state.entryTime} />
              </div>
            </div>
          )}

          {/* Gate Status */}
          <div
            className="flex gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(100,116,139,0.3)" }}
          >
            <div className="text-center">
              <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">IN</div>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{
                  background: state.entryGateOpen ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                  border: `1px solid ${state.entryGateOpen ? "#22C55E" : "#EF4444"}`,
                  color: state.entryGateOpen ? "#22C55E" : "#EF4444",
                }}
              >
                {state.entryGateOpen ? "▲" : "—"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">OUT</div>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{
                  background: state.exitGateOpen ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                  border: `1px solid ${state.exitGateOpen ? "#22C55E" : "#EF4444"}`,
                  color: state.exitGateOpen ? "#22C55E" : "#EF4444",
                }}
              >
                {state.exitGateOpen ? "▲" : "—"}
              </div>
            </div>
          </div>

          {/* Reset button (if completed) */}
          {isCompleted && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-black pointer-events-auto transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)" }}
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* ===== PHASE STATUS BAR ===== */}
      <div
        className="absolute top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-center"
        style={{
          background: "rgba(0,0,0,0.75)",
          border: `1px solid ${phaseColor}40`,
          boxShadow: `0 0 20px ${phaseColor}20`,
          minWidth: "320px",
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: phaseColor }}
          />
          <span className="text-xs font-medium" style={{ color: phaseColor }}>
            {phaseLabel}
          </span>
        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-5 pt-10"
        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
      >
        {/* Minimap */}
        <div className="pointer-events-none">
          <Minimap />
        </div>

        {/* Controls Guide */}
        <div
          className="px-4 py-3 rounded-xl"
          style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(100,116,139,0.3)" }}
        >
          <div className="text-[9px] text-slate-500 uppercase tracking-widest text-center mb-2">Kontrol Keyboard</div>
          <div className="flex flex-col items-center gap-1">
            {/* Up arrow */}
            <div className="flex justify-center">
              <kbd
                className="w-8 h-7 flex items-center justify-center rounded text-sm font-bold text-slate-300"
                style={{ background: "rgba(51,65,85,0.9)", border: "1px solid rgba(100,116,139,0.5)" }}
              >
                ↑
              </kbd>
            </div>
            {/* Left / Down / Right */}
            <div className="flex gap-1">
              {["←", "↓", "→"].map((key) => (
                <kbd
                  key={key}
                  className="w-8 h-7 flex items-center justify-center rounded text-sm font-bold text-slate-300"
                  style={{ background: "rgba(51,65,85,0.9)", border: "1px solid rgba(100,116,139,0.5)" }}
                >
                  {key}
                </kbd>
              ))}
            </div>
            {/* Space */}
            <div className="flex justify-center mt-1">
              <kbd
                className="px-4 h-7 flex items-center justify-center rounded text-[10px] font-bold text-slate-300"
                style={{ background: "rgba(51,65,85,0.9)", border: "1px solid rgba(100,116,139,0.5)" }}
              >
                SPACE – Rem
              </kbd>
            </div>
          </div>
        </div>

        {/* Plate Info */}
        <div
          className="px-4 py-3 rounded-xl"
          style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(100,116,139,0.3)" }}
        >
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5">Kendaraan</div>
          <div className="font-mono text-sm font-bold text-white tracking-widest mb-1">
            {state.plateNumber}
          </div>
          <div className="text-[9px] text-slate-400">Daihatsu Ayla · Merah</div>
          <div className="mt-2 flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: phaseColor }}
            />
            <span className="text-[9px] uppercase tracking-widest" style={{ color: phaseColor }}>
              {state.phase.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* ===== COMPLETED OVERLAY ===== */}
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div
            className="text-center px-10 py-8 rounded-2xl"
            style={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(34,197,94,0.4)",
              boxShadow: "0 0 60px rgba(34,197,94,0.2)",
            }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Simulasi Selesai!</h2>
            <p className="text-slate-400 text-sm mb-6">
              Kendaraan B 8789 DI telah berhasil keluar dari area parkir.
            </p>
            <button
              onClick={onReset}
              className="px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-black transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)", boxShadow: "0 4px 24px rgba(251,191,36,0.4)" }}
            >
              ↺ Ulangi Simulasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
