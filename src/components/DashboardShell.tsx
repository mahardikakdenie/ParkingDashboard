"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDemoPage = pathname.startsWith("/demo");

  if (isDemoPage) {
    // Demo page: fullscreen, no sidebar, no topnav
    return (
      <div className="w-screen h-screen overflow-hidden bg-black">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {children}
        </main>
      </div>
    </div>
  );
}
