"use client";

import { Video, ScanText, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: Video, label: "Dashboard", href: "/" },
  { icon: ScanText, label: "OCR Scanner", href: "/ocr" },
  { icon: LogIn, label: "Gate In (Entry)", href: "/gate/in" },
  { icon: LogOut, label: "Gate Out (Exit)", href: "/gate/out" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#1E293B] border-r border-slate-700 hidden md:flex flex-col h-full shrink-0 text-slate-200">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white italic">PARKFLOW<span className="text-blue-400">.AI</span></h1>
        </div>

        <nav className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 px-3">Management</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 transition-colors ${isActive
                  ? "bg-blue-600/10 text-blue-400 rounded-md border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800 rounded-md"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-600 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Admin Sudirman</div>
            <div className="text-[10px] text-slate-500 italic">Central Station</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

