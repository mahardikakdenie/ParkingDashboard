"use client";

import { SimulationState } from "@/hooks/useParkingSimulation";
import { Loader2, CheckCircle2, CreditCard, Car, Clock, Wallet } from "lucide-react";

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
        {/* Loading View */}
        {isLoading && (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center" />
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-wide">Proses Check-In</h3>
              <p className="text-xs text-slate-400">Menghubungkan ke API <span className="font-mono text-emerald-400">/check-in</span>...</p>
            </div>
          </div>
        )}

        {/* Check-In Response Card View */}
        {isModalVisible && data && (
          <div className="flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-linear-to-r from-emerald-500/15 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Gate Masuk</div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Check-In Berhasil</h2>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
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
                  <div className="font-mono text-sm font-bold text-white">{data.card_number}</div>
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
              <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Saldo Awal Akun</div>
                    <div className="text-xs text-slate-300">Total Saldo Tersedia</div>
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
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                <span>Transaction ID:</span>
                <span className="font-mono text-slate-400 text-[10px]">{data.id}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-slate-900/40 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-98"
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
