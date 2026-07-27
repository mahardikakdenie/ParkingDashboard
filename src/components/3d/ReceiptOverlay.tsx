"use client";

import { SimulationState } from "@/hooks/useParkingSimulation";
import { formatWibDateTime } from "./CheckInOverlay";
import { Loader2, CheckCircle2, CreditCard, Clock, Wallet } from "lucide-react";

interface ReceiptOverlayProps {
  state: SimulationState;
  onConfirmPayment: () => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function ReceiptOverlay({ state, onConfirmPayment }: ReceiptOverlayProps) {
  const isLoading = state.phase === "EXIT_LOADING";
  const isVisible = state.phase === "EXIT_PAYMENT";

  if (!isLoading && !isVisible) return null;

  const data = state.checkOutData;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
      {/* Dark Glass Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-amber-500/30"
        style={{
          background: "linear-gradient(165deg, #0B1329 0%, #1A1F38 100%)",
          boxShadow: "0 0 50px rgba(245, 158, 11, 0.15)",
        }}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin flex items-center justify-center" />
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-wide">Proses Check-Out</h3>
              <p className="text-xs text-slate-400">Menghubungkan ke API <span className="font-mono text-amber-400">/check-out</span>...</p>
            </div>
          </div>
        )}

        {/* Check-Out Response Data State */}
        {isVisible && data && (
          <div className="flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-linear-to-r from-amber-500/15 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Gate Keluar</div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Check-Out Berhasil</h2>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {data.status}
              </span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Card Number */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Nomor Kartu</span>
                </div>
                <div className="font-mono text-sm font-bold text-white">{data.card_number}</div>
              </div>

              {/* Balance Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-slate-400" />
                    <span>Saldo Awal</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-200">
                    {formatCurrency(data.balance_before)}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-emerald-400" />
                    <span>Saldo Akhir</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-emerald-400">
                    {formatCurrency(data.balance_after)}
                  </div>
                </div>
              </div>

              {/* Dates WIB */}
              <div className="space-y-2 bg-slate-900/40 border border-slate-800 rounded-xl p-3.5">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Waktu Check-In (+7 WIB)</span>
                  </div>
                  <div className="font-mono text-xs font-medium text-slate-300">
                    {formatWibDateTime(data.check_in_at)}
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" />
                    <span>Waktu Check-Out (+7 WIB)</span>
                  </div>
                  <div className="font-mono text-xs font-medium text-slate-300">
                    {formatWibDateTime(data.check_out_at)}
                  </div>
                </div>
              </div>

              {/* Duration & Fee Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Durasi</div>
                  <div className="font-mono text-sm font-bold text-blue-400">
                    {data.duration_minutes} Menit
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1 font-bold">Total Biaya</div>
                  <div className="font-mono text-base font-bold text-amber-400">
                    {formatCurrency(data.amount)}
                  </div>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                <span>Transaction ID:</span>
                <span className="font-mono text-slate-400 text-[10px]">{data.id}</span>
              </div>
            </div>

            {/* Action Footer (Close Button replacing payment) */}
            <div className="p-4 bg-slate-900/40 border-t border-slate-800">
              <button
                type="button"
                onClick={onConfirmPayment}
                className="w-full py-3 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-98"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
