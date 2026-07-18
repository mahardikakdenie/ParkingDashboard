"use client";

import { useState } from "react";
import { Video, ScanText, LogIn, LogOut, X, Gamepad2, ChevronDown, ChevronRight, Box } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useParking } from "@/lib/ParkingContext";

type NavItem = {
  icon: any;
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  { icon: Video, label: "Dashboard", href: "/" },
  { icon: ScanText, label: "OCR Scanner", href: "/ocr" },
  { 
    icon: Box, 
    label: "Gate Management", 
    children: [
      { label: "Gate In (Entry)", href: "/gate/in" },
      { label: "Gate Out (Exit)", href: "/gate/out" },
    ]
  },
  { icon: Gamepad2, label: "3D Parking Demo", href: "/demo" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useParking();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`w-60 bg-[#1E293B] border-r border-slate-700 flex flex-col h-full shrink-0 text-slate-200 
          fixed md:static inset-y-0 left-0 z-50 transform md:transform-none transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white italic">Nex<span className="text-blue-400">Gate</span></h1>
            </div>
            
            {/* Close Button on Mobile */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 px-3">Management</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus[item.label];
              
              // Check if any child is active to highlight parent
              const isChildActive = item.children?.some(child => pathname === child.href);
              const isActive = pathname === item.href || isChildActive;

              return (
                <div key={item.label} className="mb-1">
                  {hasChildren ? (
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${isActive
                        ? "bg-blue-600/10 text-blue-400 rounded-md border border-blue-500/20"
                        : "text-slate-400 hover:bg-slate-800 rounded-md"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 transition-colors ${isActive
                        ? "bg-blue-600/10 text-blue-400 rounded-md border border-blue-500/20"
                        : "text-slate-400 hover:bg-slate-800 rounded-md"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )}
                  
                  {/* Children Render with Tree Design */}
                  {hasChildren && isExpanded && (
                    <div className="mt-1 relative flex flex-col space-y-1 ml-5 pl-4">
                      {/* Vertical Tree Line */}
                      <div className="absolute left-0 top-0 bottom-4 w-0.5 bg-slate-700/50 rounded-full"></div>
                      
                      {item.children!.map((child) => {
                        const isChildCurrent = pathname === child.href;
                        return (
                          <div key={child.label} className="relative">
                            {/* Horizontal Tree Branch */}
                            <div className="absolute -left-4 top-1/2 w-4 h-0.5 bg-slate-700/50 rounded-full -translate-y-1/2"></div>
                            
                            <Link
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`block px-3 py-2 text-sm transition-colors rounded-md ${isChildCurrent
                                ? "text-blue-400 bg-blue-600/10 font-medium"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                              }`}
                            >
                              {child.label}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
    </>
  );
}

