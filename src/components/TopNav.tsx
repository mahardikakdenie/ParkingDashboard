import { Bell, Search, Menu } from "lucide-react";
import Image from "next/image";

export function TopNav() {
  return (
    <header className="h-16 border-b border-slate-700 bg-[#1E293B]/50 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <button className="md:hidden text-slate-400 hover:text-white mr-2">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold">System Status</span>
          <span className="text-xs flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Fully Operational
          </span>
        </div>
        <div className="w-px h-8 bg-slate-700"></div>
        <div className="flex flex-col hidden sm:flex">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Active Session</span>
          <span className="text-xs text-white">12h 42m 11s</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-slate-800 rounded px-3 py-1.5 flex items-center gap-2 border border-slate-700">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] text-slate-400 uppercase hidden sm:block">Search Plate:</span>
          <input 
            type="text" 
            placeholder="e.g. B 1234 ABC" 
            className="w-24 sm:w-28 bg-transparent text-xs font-mono text-white focus:outline-none placeholder-slate-600 uppercase"
          />
        </div>
        
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
