"use client";

import React from "react";
import { ForgotStep } from "../hooks/useForgotPassword";

interface ForgotPasswordHeaderProps {
  currentStep: ForgotStep;
}

export function ForgotPasswordHeader({ currentStep }: ForgotPasswordHeaderProps) {
  const getStepIndex = (step: ForgotStep) => {
    switch (step) {
      case "request-otp": return 1;
      case "verify-otp": return 2;
      case "reset-password": return 3;
      case "success": return 4;
      default: return 1;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  const steps = [
    { id: 1, label: "Email" },
    { id: 2, label: "Verifikasi OTP" },
    { id: 3, label: "Reset Password" },
    { id: 4, label: "Selesai" },
  ];

  return (
    <div className="mb-6 space-y-3">
      <h1 className="text-xl font-bold text-white tracking-tight">
        Reset Kata Sandi
      </h1>
      <p className="text-xs text-slate-400 leading-relaxed">
        {currentStep === "request-otp" && "Masukkan email akun Anda untuk menerima kode OTP."}
        {currentStep === "verify-otp" && "Masukkan 6 digit kode OTP yang dikirimkan ke email."}
        {currentStep === "reset-password" && "Buat kata sandi baru untuk akun Anda."}
        {currentStep === "success" && "Kata sandi Anda telah berhasil diperbarui."}
      </p>

      {/* Simple Modern Progress Indicator */}
      <div className="grid grid-cols-4 gap-1.5 pt-2">
        {steps.map((s) => {
          const isActive = s.id === currentIndex;
          const isDone = s.id < currentIndex;

          return (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                isActive
                  ? "bg-blue-500"
                  : isDone
                  ? "bg-emerald-500"
                  : "bg-white/10"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
