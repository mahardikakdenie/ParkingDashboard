"use client";

import React from "react";
import { useForgotPassword } from "./hooks/useForgotPassword";
import { ForgotPasswordHeader } from "./components/ForgotPasswordHeader";
import { RequestOtpForm } from "./components/RequestOtpForm";
import { VerifyOtpForm } from "./components/VerifyOtpForm";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { ForgotPasswordSuccess } from "./components/ForgotPasswordSuccess";
import { AuthStatusBanner } from "../login/components/AuthStatusBanner";

export default function ForgotPasswordView() {
  const forg = useForgotPassword();

  return (
    <div className="min-h-screen w-full bg-[#0B132B] text-slate-200 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-linear-to-tr from-blue-600/25 to-indigo-600/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-125 h-125 bg-linear-to-bl from-violet-600/20 to-teal-500/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-2xl border border-slate-700/60 rounded-3xl p-8 shadow-xl shadow-indigo-950/30 relative z-10">
        <ForgotPasswordHeader currentStep={forg.step} />

        {forg.error && <AuthStatusBanner message={forg.error} type="error" />}
        {forg.successMsg && !forg.error && (
          <AuthStatusBanner message={forg.successMsg} type="success" />
        )}

        {forg.step === "request-otp" && (
          <RequestOtpForm
            email={forg.email}
            setEmail={forg.setEmail}
            loading={forg.loading}
            handleSubmit={forg.handleRequestOtp}
          />
        )}

        {forg.step === "verify-otp" && (
          <VerifyOtpForm
            email={forg.email}
            otp={forg.otp}
            timer={forg.timer}
            canResend={forg.canResend}
            loading={forg.loading}
            handleOtpChange={forg.handleOtpChange}
            handleOtpKeyDown={forg.handleOtpKeyDown}
            handleOtpPaste={forg.handleOtpPaste}
            handleResendOtp={forg.handleResendOtp}
            handleVerifyOtp={forg.handleVerifyOtp}
            onChangeEmail={() => forg.setStep("request-otp")}
          />
        )}

        {forg.step === "reset-password" && (
          <ResetPasswordForm
            password={forg.password}
            setPassword={forg.setPassword}
            confirmPassword={forg.confirmPassword}
            setConfirmPassword={forg.setConfirmPassword}
            showPassword={forg.showPassword}
            setShowPassword={forg.setShowPassword}
            loading={forg.loading}
            handleSubmit={forg.handleResetPassword}
          />
        )}

        {forg.step === "success" && <ForgotPasswordSuccess />}
      </div>
    </div>
  );
}
