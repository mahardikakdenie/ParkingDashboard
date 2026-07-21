"use client";

import React from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface RequestOtpFormProps {
  email: string;
  setEmail: (val: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export function RequestOtpForm({
  email,
  setEmail,
  loading,
  handleSubmit,
}: RequestOtpFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 tracking-wide">
          Email Terdaftar
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengirim Kode OTP...</span>
          </>
        ) : (
          <>
            <span>Kirim Kode OTP</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Kembali ke Login
        </Link>
      </div>
    </form>
  );
}
