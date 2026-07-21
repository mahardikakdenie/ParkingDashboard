"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthStatusBannerProps {
  message: string | null;
  type?: "error" | "success";
}

export function AuthStatusBanner({ message, type = "error" }: AuthStatusBannerProps) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      className={`mb-6 p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed transition-all duration-200 ${
        isError
          ? "bg-red-500/10 border-red-500/30 text-red-300"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
      }`}
    >
      {isError ? (
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}
