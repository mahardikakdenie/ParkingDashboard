"use client";

import { useState, useEffect } from "react";
import { Search, Menu } from "lucide-react";
import { useParking } from "@/lib/ParkingContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { SearchMenuModal } from "@/components/SearchMenuModal";

export function TopNav() {
  const { sidebarOpen, setSidebarOpen } = useParking();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl + K / Cmd + K keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 transition-all">
        {/* Left side: Sidebar toggle & system status */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            aria-label="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">System Status</span>
            <span className="text-xs flex items-center gap-1.5 text-emerald-400 font-medium truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span> Fully Operational
            </span>
          </div>

          <div className="hidden sm:block w-px h-8 bg-slate-800 shrink-0"></div>

          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">Active Session</span>
            <span className="text-xs text-slate-200 font-mono font-medium truncate">12h 42m 11s</span>
          </div>
        </div>
        
        {/* Right side: Search Menus trigger & notifications */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="bg-slate-950/60 hover:bg-slate-800/80 rounded-xl px-3 py-1.5 flex items-center gap-2.5 border border-slate-800 hover:border-slate-700/80 transition-all text-slate-400 hover:text-slate-200 text-xs group cursor-pointer"
            aria-label="Search Menus (Ctrl + K)"
            title="Search Menus (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0" />
            <span className="text-xs font-medium truncate hidden sm:inline">Search Menus...</span>
            <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 flex items-center gap-0.5 shrink-0 ml-1">
              <span className="text-[9px]">Ctrl</span> K
            </span>
          </button>
          
          {/* Modern Notification Dropdown */}
          <NotificationDropdown />
        </div>
      </header>

      {/* Search Menus Modal */}
      <SearchMenuModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
