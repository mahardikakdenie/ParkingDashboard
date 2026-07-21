"use client";

import React from "react";
import { CompanyLogo } from "@/components/CompanyLogo";

export function LoginHeader() {
  return (
    <div className="mb-6 space-y-3">
      {/* Reusable Premium Company Logo */}
      <CompanyLogo size="lg" variant="full" />

      <div className="pt-2">
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

