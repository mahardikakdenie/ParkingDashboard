import { Suspense } from "react";
import ForgotPasswordView from "@/views/auth/forgot-password";

export const metadata = {
  title: "Lupa Password - NexGate Parking Subsystem",
  description: "Reset kata sandi akun NexGate menggunakan verifikasi kode OTP.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#070C16] flex items-center justify-center text-slate-400 font-sans">
          <div className="animate-pulse text-xs tracking-wider">Memuat Halaman...</div>
        </div>
      }
    >
      <ForgotPasswordView />
    </Suspense>
  );
}
