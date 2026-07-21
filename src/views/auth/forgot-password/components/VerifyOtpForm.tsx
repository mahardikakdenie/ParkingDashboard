"use client";

import React from "react";
import { RotateCcw, Loader2, ArrowRight } from "lucide-react";

interface VerifyOtpFormProps {
  email: string;
  otp: string[];
  timer: number;
  canResend: boolean;
  loading: boolean;
  handleOtpChange: (index: number, val: string) => void;
  handleOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  handleResendOtp: () => void;
  handleVerifyOtp: (e: React.FormEvent) => void;
  onChangeEmail: () => void;
}

export function VerifyOtpForm({
  email,
  otp,
  timer,
  canResend,
  loading,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
  handleResendOtp,
  handleVerifyOtp,
  onChangeEmail,
}: VerifyOtpFormProps) {
  return (
    <form onSubmit={handleVerifyOtp} className="space-y-5">
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
        <span className="text-slate-300 truncate">Email: <strong className="text-white font-mono">{email}</strong></span>
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-[11px] text-blue-400 hover:underline cursor-pointer ml-2"
        >
          Ganti
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block text-center">
          Masukkan 6 Digit OTP
        </label>
        <div className="flex items-center justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`forgot-otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
              className="w-10 h-12 bg-slate-950/80 border border-white/10 rounded-xl text-center text-lg font-mono font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-slate-400">Tidak dapat kode?</span>
        {canResend ? (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading}
            className="inline-flex items-center gap-1 text-blue-400 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Kirim Ulang
          </button>
        ) : (
          <span className="font-mono text-slate-500">{timer}s</span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || otp.join("").length < 6}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Verifikasi OTP</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
