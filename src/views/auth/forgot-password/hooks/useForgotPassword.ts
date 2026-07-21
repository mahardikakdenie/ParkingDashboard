"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";

export type ForgotStep = "request-otp" | "verify-otp" | "reset-password" | "success";

export function useForgotPassword() {
  const [step, setStep] = useState<ForgotStep>("request-otp");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verify-otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Silakan masukkan email yang terdaftar.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await authService.requestOtp({ email });
      if (res && res.token) {
        setToken(res.token);
      }
      setStep("verify-otp");
      setTimer(60);
      setCanResend(false);
      setSuccessMsg(`Kode OTP telah dikirimkan ke email ${email}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Gagal meminta kode OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authService.requestOtp({ email });
      if (res && res.token) {
        setToken(res.token);
      }
      setTimer(60);
      setCanResend(false);
      setOtp(Array(6).fill(""));
      setSuccessMsg("Kode OTP berhasil dikirim ulang.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal mengirim ulang OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`forgot-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`forgot-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const targetIndex = Math.min(digits.length, 5);
      const targetInput = document.getElementById(`forgot-otp-${targetIndex}`);
      targetInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await authService.verifyOtp({ otp: otpCode, token });
      if (res && res.token) {
        setToken(res.token);
      }
      setStep("reset-password");
      setSuccessMsg("Kode OTP terverifikasi! Silakan tentukan kata sandi baru.");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Kode OTP tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({ new_password: password, token });
      setStep("success");
      setSuccessMsg("Kata sandi berhasil diperbarui!");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Gagal mereset kata sandi.");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    email,
    setEmail,
    otp,
    token,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    timer,
    canResend,
    loading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    handleRequestOtp,
    handleResendOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleVerifyOtp,
    handleResetPassword,
  };
}
