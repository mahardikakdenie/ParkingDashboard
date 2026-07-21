import { Suspense } from "react";
import LoginView from "@/views/auth/login";

export const metadata = {
  title: "Login - NexGate Parking SaaS Subsystem",
  description: "Masuk ke dalam dashboard sistem manajemen parkir NexGate.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center text-slate-400 font-sans">
        <div className="animate-pulse">Loading secure page...</div>
      </div>
    }>
      <LoginView />
    </Suspense>
  );
}
