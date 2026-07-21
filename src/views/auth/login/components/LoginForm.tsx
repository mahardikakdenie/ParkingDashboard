"use client";

import React from "react";
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface LoginFormProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  showPassword,
  togglePasswordVisibility,
  loading,
  handleSubmit,
}: LoginFormProps) {
  const handleQuickFill = () => {
    setUsername("admin");
    setPassword("12345678");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Quick Fill Preset Helper */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs backdrop-blur-md">
        <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Akun Demo Akses?
        </span>
        <button
          type="button"
          onClick={handleQuickFill}
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold text-[11px] hover:underline cursor-pointer"
        >
          Isi Kredensial Demo
        </button>
      </div>

      {/* Username / Email Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-200 tracking-wide">
          Username / Email
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username atau email anda"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 tracking-wide">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
          >
            Lupa password?
          </Link>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
          />
          <span className="text-xs text-slate-300">Ingat sesi ini (30 Hari)</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memverifikasi Kredensial...</span>
          </>
        ) : (
          <>
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
