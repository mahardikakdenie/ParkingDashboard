"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = pathname === "/login" || pathname === "/forgot-password";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPage) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, isPublicPage, pathname, router]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-[#0F172A] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs uppercase tracking-widest font-mono">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicPage) {
    return null;
  }

  return <>{children}</>;
}
