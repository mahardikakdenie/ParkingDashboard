"use client";

import { Search, Menu } from "lucide-react";
import { useParking } from "@/lib/ParkingContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";

export function TopNav() {
  const { sidebarOpen, setSidebarOpen } = useParking();

  return (
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
      
      {/* Right side: Search plate & notifications */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="bg-slate-950/60 rounded-xl px-3 py-1.5 flex items-center gap-2 border border-slate-800 focus-within:border-blue-500/60 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] text-slate-400 uppercase font-medium hidden md:block shrink-0">Search Plate:</span>
          <input 
            type="text" 
            placeholder="e.g. B 1234 ABC" 
            className="w-24 sm:w-28 md:w-32 bg-transparent text-xs font-mono text-white focus:outline-none placeholder-slate-500 uppercase"
          />
        </div>
        
        {/* Modern Notification Dropdown */}
        <NotificationDropdown />
      </div>
    </header>
  );
}
