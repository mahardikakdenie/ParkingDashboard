"use client";

import { useState } from "react";
import { SimulationState } from "@/hooks/useParkingSimulation";
import { QrCode } from "lucide-react";

interface ReceiptOverlayProps {
  state: SimulationState;
  onConfirmPayment: () => void;
}

function formatTime(date: Date | null) {
  if (!date) return "–";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(date: Date | null) {
  if (!date) return "–";
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export function ReceiptOverlay({ state, onConfirmPayment }: ReceiptOverlayProps) {
  const isVisible = state.phase === "EXIT_PAYMENT";
  const [selectedPayment, setSelectedPayment] = useState<"ewallet" | "qris" | null>(null);

  if (!isVisible) return null;

  const hours = Math.ceil(
    state.entryTime && state.exitTime
      ? ((state.exitTime.getTime() - state.entryTime.getTime()) * 300) / 3600000
      : 1
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-30">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      />

      {/* Receipt Panel */}
      <div
        className="relative z-10 w-[90%] max-w-110 max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(160deg, #0F172A 0%, #1a2744 100%)",
          border: "1px solid rgba(251,191,36,0.3)",
          boxShadow: "0 0 60px rgba(251,191,36,0.15), 0 0 120px rgba(251,191,36,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 text-center shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.05) 100%)",
            borderBottom: "1px solid rgba(251,191,36,0.2)",
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 mb-1">
            NEXGATE SYSTEM
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Struk Parkir</h2>
          <div className="text-[11px] text-slate-400 mt-1">
            {formatDate(state.exitTime)}
          </div>
        </div>

        {/* Receipt Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Plate */}
          <div className="text-center">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Nomor Kendaraan</div>
            <div
              className="inline-block px-6 py-2 rounded-lg font-mono text-2xl font-bold text-white tracking-widest"
              style={{
                background: "#111827",
                border: "2px solid rgba(251,191,36,0.5)",
                boxShadow: "0 0 20px rgba(251,191,36,0.1)",
              }}
            >
              {state.plateNumber}
            </div>
          </div>

          {/* Dashed separator */}
          <div className="border-t border-dashed border-slate-700" />

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/60 rounded-xl p-3 text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
                <span>🟢</span> Waktu Masuk
              </div>
              <div className="font-mono text-sm font-bold text-emerald-400">
                {formatTime(state.entryTime)}
              </div>
              <div className="text-[9px] text-slate-500 mt-1">Gate Masuk</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3 text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
                <span>🔴</span> Waktu Keluar
              </div>
              <div className="font-mono text-sm font-bold text-rose-400">
                {formatTime(state.exitTime)}
              </div>
              <div className="text-[9px] text-slate-500 mt-1">Gate Keluar</div>
            </div>
          </div>

          {/* Duration */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Durasi Parkir</span>
            <span className="font-mono text-sm font-bold text-blue-400">{state.duration || "< 1 menit"}</span>
          </div>

          {/* Fee breakdown */}
          <div className="bg-slate-800/40 rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-700">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest">Rincian Tarif</div>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Jam pertama (1 jam)</span>
                <span className="text-slate-300 font-mono">{formatCurrency(5000)}</span>
              </div>
              {hours > 1 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">
                    Jam berikutnya ({hours - 1} jam × Rp 3.000)
                  </span>
                  <span className="text-slate-300 font-mono">
                    {formatCurrency((hours - 1) * 3000)}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-700 pt-2 flex justify-between">
                <span className="text-xs text-slate-400">Subtotal</span>
                <span className="text-xs text-slate-300 font-mono">{formatCurrency(state.parkingFee)}</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-4"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.08) 100%)",
              border: "1px solid rgba(251,191,36,0.3)",
            }}
          >
            <span className="text-sm font-bold text-white uppercase tracking-wide">Total Pembayaran</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {formatCurrency(state.parkingFee)}
            </span>
          </div>

          {/* Payment Selection UI */}
          <div className="space-y-2 pt-1">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest text-center">
              Pilih Metode Pembayaran
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPayment("ewallet")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                  selectedPayment === "ewallet"
                    ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "bg-slate-800/40 border-slate-750/60 text-slate-400 hover:bg-slate-800/80 hover:border-slate-650"
                }`}
              >
                <span className="text-lg mb-1">📱</span>
                <span className="text-xs font-bold uppercase tracking-wider">E-Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPayment("qris")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                  selectedPayment === "qris"
                    ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "bg-slate-800/40 border-slate-750/60 text-slate-400 hover:bg-slate-800/80 hover:border-slate-650"
                }`}
              >
                <span className="text-lg mb-1">📸</span>
                <span className="text-xs font-bold uppercase tracking-wider">QRCODE QRIS</span>
              </button>
            </div>

            {/* Dummy QRIS QR Code display */}
            {selectedPayment === "qris" && (
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 mt-3 transition-all duration-300">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
                  <QrCode className="w-36 h-36 text-slate-900" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 mt-2 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  QRIS DUMMY ACTIVE
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Silakan scan untuk simulasi pembayaran
                </div>
              </div>
            )}
          </div>

          {/* Payment method note */}
          <div className="text-center text-[10px] text-slate-500 pb-2">
            Terima kasih atas kunjungan Anda
          </div>
        </div>

        {/* Pay Button */}
        <div
          className="px-6 pb-6 pt-4 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={onConfirmPayment}
            disabled={!selectedPayment}
            className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-black transition-all duration-200 active:scale-95 ${
              !selectedPayment ? "opacity-50 cursor-not-allowed bg-slate-600 text-slate-400" : ""
            }`}
            style={{
              background: selectedPayment ? "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)" : "#475569",
              boxShadow: selectedPayment ? "0 4px 24px rgba(251,191,36,0.4)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!selectedPayment) return;
              e.currentTarget.style.boxShadow = "0 4px 36px rgba(251,191,36,0.6)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (!selectedPayment) return;
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(251,191,36,0.4)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            💳 {selectedPayment ? `Bayar dengan ${selectedPayment === "qris" ? "QRIS" : "E-Wallet"}` : "Pilih Pembayaran"}
          </button>
        </div>
      </div>
    </div>
  );
}
