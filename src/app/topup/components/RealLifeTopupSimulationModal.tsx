"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Wifi,
  CreditCard,
  User,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Sparkles,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { paymentMethodsService } from "@/services/payment-methods.service";
import { TopupMethod, CreateTopupDto, PaymentMethodOption } from "@/types/api";

export interface SimulationCustomerData {
  id: string;
  card_number: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  status: number;
  status_text: string;
  company?: string;
  created_at: string;
  updated_at: string;
}

export const DUMMY_SIMULATION_CUSTOMER: SimulationCustomerData = {
  id: "9ab3d6f4-7bd9-403d-9e83-117a5f29a3c1",
  card_number: "CST-0001",
  name: "John Doe",
  phone: "628123456789",
  email: "john@example.com",
  balance: 2200000,
  status: 1,
  status_text: "Active",
  company: "PT Parking Management Global",
  created_at: "2026-07-19T11:38:00.994Z",
  updated_at: "2026-08-04T19:06:42.140Z",
};

const QUICK_AMOUNTS = [25000, 50000, 100000, 250000, 500000];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSimulation: (payload: CreateTopupDto) => Promise<void>;
}

export function RealLifeTopupSimulationModal({
  isOpen,
  onClose,
  onSubmitSimulation,
}: Props) {
  const [phase, setPhase] = useState<"SCANNING" | "READY">("SCANNING");
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Form State
  const [amount, setAmount] = useState<number>(50000);
  const [method, setMethod] = useState<TopupMethod>("qris");
  const [bank, setBank] = useState<string>("bca");
  const [notes, setNotes] = useState<string>("Simulation NFC Reader Topup");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<PaymentMethodOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      paymentMethodsService.getOptions()
        .then((opts) => {
          if (Array.isArray(opts) && opts.length > 0) {
            setPaymentMethodOptions(opts);
            const firstMethod = opts[0];
            const firstBanks = firstMethod.banks || [];
            setMethod((firstMethod.code || "qris") as TopupMethod);
            setBank(firstBanks.length > 0 ? firstBanks[0].code : "");
          }
        })
        .catch((err) => console.error("Failed to load payment options in simulation", err));
    }
  }, [isOpen]);

  // Handle 5-second scanning timer
  useEffect(() => {
    if (!isOpen) {
      setPhase("SCANNING");
      setSecondsLeft(5);
      setProgressPercent(0);
      return;
    }

    if (phase === "SCANNING") {
      const startTime = Date.now();
      const duration = 5000; // 5 seconds

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remainingMs = Math.max(0, duration - elapsed);
        const remainingSec = Math.ceil(remainingMs / 1000);
        const percent = Math.min(100, Math.floor((elapsed / duration) * 100));

        setSecondsLeft(remainingSec);
        setProgressPercent(percent);

        if (elapsed >= duration) {
          clearInterval(interval);
          setPhase("READY");
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isOpen, phase]);

  const handleRestartScan = () => {
    setPhase("SCANNING");
    setSecondsLeft(5);
    setProgressPercent(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateTopupDto = {
        customer_id: DUMMY_SIMULATION_CUSTOMER.id,
        amount,
        method,
        notes,
        ...(method === "va" ? { bank } : {}),
      };
      await onSubmitSimulation(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to process simulation topup");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMethodObj = paymentMethodOptions.find(
    (pm) => pm.code === method || pm.id === method
  );
  const availableBanks = selectedMethodObj?.banks || [];
  const hasBanks = availableBanks.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Simulasi NFC Reader In Real Life</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  LIVE RFID HARDWARE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Simulating NFC card tap on POS reader machine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* PHASE 1: SCANNING ANIMATION (5 SECONDS) */}
          {phase === "SCANNING" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">

              {/* NFC Signal Animation Graphic */}
              <div className="relative flex items-center justify-center w-36 h-36">
                {/* Outer Pulsing Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping opacity-75" />
                <div className="absolute -inset-4 rounded-full border border-cyan-500/30 animate-pulse" />
                <div className="absolute -inset-8 rounded-full border border-emerald-500/10" />

                {/* Radar Sweep Effect */}
                <div className="w-28 h-28 rounded-full bg-linear-to-tr from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-b from-emerald-400/20 to-transparent animate-spin duration-1000 origin-center" />

                  {/* Center Reader Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-emerald-400/50 flex items-center justify-center z-10 shadow-inner">
                    <Wifi className="w-8 h-8 text-emerald-400 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Status Indicator & Timer */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Card... {secondsLeft}s Remaining</span>
                </div>

                <p className="text-sm font-semibold text-white">
                  Tempelkan Kartu Anggota Ke NFC Card Reader Machine
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  {progressPercent < 35
                    ? "Connecting to NFC POS terminal hardware..."
                    : progressPercent < 75
                      ? "Reading RFID Chip security key & card number..."
                      : "Fetching customer account metadata..."}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-linear-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-75 shadow-lg shadow-emerald-500/50"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between w-full max-w-md text-[10px] text-slate-500 font-mono">
                <span>0%</span>
                <span>{progressPercent}% COMPLETE</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* PHASE 2: READY WITH CARD DATA & TOPUP FORM */}
          {phase === "READY" && (
            <div className="space-y-5 animate-in fade-in zoom-in duration-200">

              {/* SUCCESS SCANNED BADGE & RESCAN BUTTON */}
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">NFC Card Successfully Scanned!</span>
                </div>
                <button
                  type="button"
                  onClick={handleRestartScan}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Tap Again</span>
                </button>
              </div>

              {/* DIGITAL SMART CARD DISPLAY */}
              <div className="relative rounded-2xl p-5 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl overflow-hidden group">
                {/* Background Glow Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

                <div className="relative z-10 space-y-4">
                  {/* Card Top Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-7 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-[11px] font-mono tracking-wider font-bold text-slate-400 uppercase">
                        SMART PARKING VIP CARD
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {DUMMY_SIMULATION_CUSTOMER.status_text}
                    </span>
                  </div>

                  {/* Customer Details Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Card Number</p>
                      <p className="font-mono text-base font-bold text-cyan-300">{DUMMY_SIMULATION_CUSTOMER.card_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Card Holder Name</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        {DUMMY_SIMULATION_CUSTOMER.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Company / Institution</p>
                      <p className="text-xs text-slate-300 font-medium flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                        {DUMMY_SIMULATION_CUSTOMER.company}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Initial Balance (Saldo Awal)</p>
                      <p className="font-mono text-base font-bold text-emerald-400">
                        Rp {DUMMY_SIMULATION_CUSTOMER.balance.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {DUMMY_SIMULATION_CUSTOMER.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {DUMMY_SIMULATION_CUSTOMER.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* TOPUP FORM */}
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                {/* Topup Amount */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Topup Amount (Rp)
                  </label>
                  <input
                    required
                    type="number"
                    min={10000}
                    step={5000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />

                  {/* Quick Amounts */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors ${amount === amt
                          ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/50"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                      >
                        +{amt / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => {
                      const newMethod = e.target.value as TopupMethod;
                      const targetObj = paymentMethodOptions.find(
                        (pm) => pm.code === newMethod || pm.id === newMethod
                      );
                      const targetBanks = targetObj?.banks || [];
                      setMethod(newMethod);
                      setBank(targetBanks.length > 0 ? targetBanks[0].code : "");
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {paymentMethodOptions.length > 0 ? (
                      paymentMethodOptions.map((pm) => (
                        <option key={pm.id || pm.code} value={pm.code}>
                          {pm.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="qris">Midtrans QRIS Dynamic QR</option>
                        <option value="va">Midtrans Virtual Account (BCA / Mandiri)</option>
                        <option value="transfer">Direct Bank Transfer</option>
                        <option value="cash">Direct Cash Deposit (Tunai Kasir)</option>
                      </>
                    )}
                  </select>

                  {hasBanks && (
                    <div className="mt-3.5 space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-xs font-medium text-slate-300 block mb-1 items-center justify-between">
                        <span>Select Bank</span>
                        <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                          * Required
                        </span>
                      </label>
                      <select
                        required
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="" disabled>-- Select Bank --</option>
                        {availableBanks.map((b) => (
                          <option key={b.id || b.code} value={b.code}>
                            {b.name} ({b.code.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Notes / Remark
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Topup via mesin NFC reader kasir..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-colors"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 text-amber-300" />
                    )}
                    <span>{submitting ? "Processing Topup..." : "Proses Topup Sekarang"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
