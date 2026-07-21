"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthOrDemo =
    pathname.startsWith("/demo") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password");

  if (isAuthOrDemo) {
    return (
      <AuthProvider>
        <div className="w-screen h-screen overflow-hidden bg-[#0F172A]">
          {children}
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex h-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
            <TopNav />
            <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {children}
            </main>
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
