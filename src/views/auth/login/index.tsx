"use client";

import React from "react";
import { useLogin } from "./hooks/useLogin";
import { LoginHeader } from "./components/LoginHeader";
import { AuthStatusBanner } from "./components/AuthStatusBanner";
import { LoginForm } from "./components/LoginForm";
import { ShieldCheck, Cpu, Activity } from "lucide-react";

export default function LoginView() {
  const loginState = useLogin();

  return (
    <div className="min-h-screen w-full bg-[#0B132B] text-slate-200 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Mesh Gradients & Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-linear-to-tr from-blue-600/25 to-indigo-600/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-125 h-125 bg-linear-to-bl from-violet-600/20 to-teal-500/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container Card (Dual-Panel Glassmorphism) */}
      <div className="w-full max-w-4xl bg-slate-900/70 backdrop-blur-2xl border border-slate-700/60 rounded-3xl shadow-xl shadow-indigo-950/30 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10">
        
        {/* Left Panel: Hero Branding & Dynamic Highlights */}
        <div className="lg:col-span-5 p-8 bg-linear-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/70 border-b lg:border-b-0 lg:border-r border-slate-700/50 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-mono">
              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>SUBSYSTEM ONLINE</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Manajemen Parkir Real-Time & Subsystem Gate
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Platform terintegrasi untuk pengawasan gate in/out, pemindaian OCR plat nomor otomatis, dan pemantauan presisi.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">AI OCR Plate Scanner</div>
                  <div className="text-[10px] text-slate-400">Deteksi plat nomor otomatis presisi tinggi</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Otentikasi Berlapis</div>
                  <div className="text-[10px] text-slate-400">Proteksi token sesi dengan Next.js Edge Guard</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span>Versi Subsystem v2.4.0</span>
            <span className="font-mono text-emerald-400 font-medium">● Operational</span>
          </div>
        </div>

        {/* Right Panel: Login Form Container */}
        <div className="lg:col-span-7 p-8 flex flex-col justify-center bg-slate-900/40">
          <LoginHeader />
          <AuthStatusBanner message={loginState.error} type="error" />
          <LoginForm {...loginState} />

          <div className="mt-6 text-center">
            <span className="text-[11px] text-slate-400">
              NexGate Subsystem © 2026 • Hak Cipta Dilindungi
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
