"use client";

import React, { useState, useEffect } from "react";
import { SimulationState } from "@/hooks/useParkingSimulation";
import {
  CheckCircle2,
  CreditCard,
  Car,
  Clock,
  Wallet,
  Wifi,
  Radio,
  Sparkles,
  ShieldCheck
} from "lucide-react";

interface CheckInOverlayProps {
  state: SimulationState;
  onClose: () => void;
}

export function formatWibDateTime(dateStrOrObj: string | Date | null): string {
  if (!dateStrOrObj) return "–";
  const date = typeof dateStrOrObj === "string" ? new Date(dateStrOrObj) : dateStrOrObj;

  const formatted = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return `${formatted} WIB`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function CheckInOverlay({ state, onClose }: CheckInOverlayProps) {
  const isLoading = state.phase === "ENTRY_LOADING";
  const isModalVisible = state.phase === "ENTRY_MODAL";

  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Handle 5-second scanning timer during ENTRY_LOADING phase
  useEffect(() => {
    if (!isLoading) {
      setSecondsLeft(5);
      setProgressPercent(0);
      return;
    }

    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, duration - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);
      const percent = Math.min(100, Math.floor((elapsed / duration) * 100));

      setSecondsLeft(remainingSec);
      setProgressPercent(percent);

      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading && !isModalVisible) return null;

  const data = state.checkInData;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
      {/* Dark Glass Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" />

      {/* Modal Container */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-emerald-500/30"
        style={{
          background: "linear-gradient(165deg, #0B1329 0%, #111C38 100%)",
          boxShadow: "0 0 50px rgba(16, 185, 129, 0.2)",
        }}
      >
        {/* LOADING STATE: 5-SECOND NFC READER SCANNING ANIMATION */}
        {isLoading && (
          <div className="py-8 px-6 flex flex-col items-center justify-center text-center space-y-6">
            
            {/* Header Title */}
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                NFC POS TERMINAL HARDWARE
              </span>
            </div>

            {/* Radar & Signal Graphic */}
            <div className="relative flex items-center justify-center w-32 h-32">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping opacity-75" />
              <div className="absolute -inset-3 rounded-full border border-cyan-500/30 animate-pulse" />
              
              <div className="w-24 h-24 rounded-full bg-linear-to-tr from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-emerald-400/20 to-transparent animate-spin duration-1000 origin-center" />
                
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-emerald-400/50 flex items-center justify-center z-10 shadow-inner">
                  <Wifi className="w-7 h-7 text-emerald-400 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Status & Timer */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning RFID Card... {secondsLeft}s Remaining</span>
              </div>
              
              <h3 className="text-sm font-semibold text-white">
                Tempelkan Kartu Anggota Ke NFC Machine Gate
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                {progressPercent < 35
                  ? "Detecting vehicle plate OCR & connecting to reader..."
                  : progressPercent < 75
                  ? "Reading RFID Chip security key & card number..."
                  : "Calling /api/v1/demo/check-in & verifying balance..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
              <div
                className="bg-linear-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-75 shadow-lg shadow-emerald-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* CHECK-IN SUCCESS RESPONSE CARD */}
        {isModalVisible && data && (
          <div className="flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-linear-to-r from-emerald-500/15 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Gate Masuk</div>
                  <h2 className="text-base font-bold text-white tracking-tight">NFC Check-In Berhasil</h2>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {data.status}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-4">
              {/* Card & Vehicle Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nomor Kartu</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-cyan-300">{data.card_number}</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    <Car className="w-3.5 h-3.5 text-blue-400" />
                    <span>Kendaraan</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">{data.vehicle_plate}</div>
                </div>
              </div>

              {/* Saldo Awal (Initial Balance) */}
              <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Saldo Awal Akun</div>
                    <div className="text-xs text-slate-300">Total Saldo Terverifikasi</div>
                  </div>
                </div>
                <div className="font-mono text-base font-bold text-emerald-400">
                  {formatCurrency(data.balance)}
                </div>
              </div>

              {/* Check-In Timestamp WIB */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Waktu Check-In (+7 WIB)</span>
                </div>
                <div className="font-mono text-xs font-semibold text-slate-200">
                  {formatWibDateTime(data.check_in_at)}
                </div>
              </div>

              {/* Transaction ID */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80 font-mono">
                <span>Transaction ID:</span>
                <span className="text-slate-400 text-[10px]">{data.id}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-slate-900/40 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-98"
              >
                Buka Gate & Masuk
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
