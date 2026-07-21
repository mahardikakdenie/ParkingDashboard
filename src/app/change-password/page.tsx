"use client";

import React from "react";
import { Plus, Search, RefreshCw, Layers } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-400" />
            Change Password
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage and monitor Change Password configurations real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="text-xs text-slate-400">Total Entries</div>
          <div className="text-2xl font-bold text-white mt-1">128</div>
        </div>
        <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="text-xs text-slate-400">Active Status</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">124</div>
        </div>
        <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="text-xs text-slate-400">Last Synced</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">Just Now</div>
        </div>
      </div>

      {/* Main Content / Table Placeholder */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl">
          <div className="text-sm font-semibold text-slate-300">Change Password Module Ready</div>
          <div className="text-xs text-slate-500 mt-1">Dynamic backend integration connected successfully.</div>
        </div>
      </div>
    </div>
  );
}
