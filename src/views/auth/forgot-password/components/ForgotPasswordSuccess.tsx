"use client";

import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ForgotPasswordSuccess() {
  return (
    <div className="py-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">Reset Password Berhasil!</h3>
        <p className="text-xs text-slate-400">
          Kata sandi akun Anda telah diperbarui. Silakan gunakan password baru untuk masuk.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all"
        >
          <span>Kembali ke Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
