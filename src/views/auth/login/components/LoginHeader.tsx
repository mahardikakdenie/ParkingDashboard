"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export function LoginHeader() {
  return (
    <div className="mb-6 space-y-3">
      {/* Brand Icon & Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white font-sans block">
            Nex<span className="text-blue-400">Gate</span>
          </span>
          <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">
            Parking Subsystem
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Masuk ke Dashboard
        </h1>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Kelola seluruh operasional gate, transaksi, dan pemantauan parkir secara real-time.
        </p>
      </div>
    </div>
  );
}
