"use client";

import { useEffect, useState } from "react";
import { 
  ScanText, 
  LogOut, 
  X, 
  Gamepad2, 
  ChevronDown, 
  ChevronRight, 
  Box,
  LayoutDashboard,
  Receipt,
  Users,
  Banknote,
  Car,
  Wallet,
  Layers,
  FolderTree,
  Menu as MenuIcon,
  ShieldCheck,
  Shield,
  User,
  UserCog,
  Lock,
  HelpCircle,
  Sliders,
  Sparkles,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useParking } from "@/lib/ParkingContext";
import { useAuth } from "@/context/AuthContext";
import { menusService } from "@/services/menus.service";
import { menuGroupsService } from "@/services/menu-groups.service";
import { MenuGroupItem, MenuResponse } from "@/types/api";

type NavItem = {
  id?: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  menuGroupId?: string;
  children?: { id?: string; label: string; href: string }[];
};

type MenuSection = {
  id: string;
  title: string;
  sort: number;
  items: NavItem[];
};

// Map backend icon strings to Lucide React icons
const getMenuIcon = (iconName?: string): LucideIcon => {
  switch (iconName?.toLowerCase()) {
    case "dashboard":
      return LayoutDashboard;
    case "transaction":
    case "transactions":
      return Receipt;
    case "customer":
    case "customers":
      return Users;
    case "parkingrate":
    case "parkingrates":
      return Banknote;
    case "vehicletype":
    case "vehicletypes":
      return Car;
    case "wallet":
    case "topup":
      return Wallet;
    case "application":
    case "applications":
      return Layers;
    case "menugroup":
    case "menugroups":
      return FolderTree;
    case "menu":
    case "menus":
      return MenuIcon;
    case "permission":
    case "permissions":
      return ShieldCheck;
    case "role":
    case "roles":
      return Shield;
    case "user":
    case "users":
      return User;
    case "account":
      return UserCog;
    case "lock":
    case "changepassword":
      return Lock;
    case "help":
    case "helpsupport":
      return HelpCircle;
    default:
      return Box;
  }
};

// Static Navigation Items (Operational Hub)
const staticNavItems: NavItem[] = [
  { icon: ScanText, label: "AI OCR Scanner", href: "/ocr" },
  { 
    icon: Box, 
    label: "Gate Subsystem", 
    children: [
      { label: "Gate In (Entry)", href: "/gate/in" },
      { label: "Gate Out (Exit)", href: "/gate/out" },
    ]
  },
  { icon: Gamepad2, label: "3D Digital Twin Demo", href: "/demo" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useParking();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [dynamicSections, setDynamicSections] = useState<MenuSection[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMenuData() {
      try {
        setIsLoadingMenus(true);

        const [menusRes, groupsRes] = await Promise.allSettled([
          menusService.getAll(),
          menuGroupsService.getList({ page: 1, limit: 100 })
        ]);

        if (!isMounted) return;

        const rawMenus: MenuResponse[] = menusRes.status === "fulfilled" && Array.isArray(menusRes.value)
          ? menusRes.value
          : [];

        let rawGroups: MenuGroupItem[] = [];
        if (groupsRes.status === "fulfilled" && groupsRes.value) {
          const val = groupsRes.value as any;
          if (Array.isArray(val)) {
            rawGroups = val;
          } else if (Array.isArray(val?.items)) {
            rawGroups = val.items;
          }
        }

        // Build Group Map
        const groupMap = new Map<string, { name: string; sort: number }>();
        rawGroups.forEach(g => {
          groupMap.set(g.id, { name: g.name, sort: g.sort || 99 });
        });

        // Filter top-level menus & sort
        const sortedMenus = [...rawMenus].sort((a, b) => (a.sort || 0) - (b.sort || 0));
        const topLevelMenus = sortedMenus.filter(m => !m.parent_id);

        // Group dynamic menus by menu_group_id
        const sectionMap = new Map<string, MenuSection>();

        topLevelMenus.forEach(item => {
          const groupId = item.menu_group_id || "ungrouped";
          const groupMeta = groupMap.get(groupId) || { 
            name: groupId === "ungrouped" ? "Other Services" : "Management", 
            sort: 99 
          };

          if (!sectionMap.has(groupId)) {
            sectionMap.set(groupId, {
              id: groupId,
              title: groupMeta.name,
              sort: groupMeta.sort,
              items: [],
            });
          }

          // Build child menus if existing
          const rawChildren = Array.isArray(item.child) && item.child.length > 0
            ? item.child
            : sortedMenus.filter(c => c.parent_id === item.id);

          const children = (rawChildren as any[]).map(c => typeof c === "string"
            ? { label: c, href: "#" }
            : { id: c.id, label: c.name, href: c.path }
          );

          sectionMap.get(groupId)!.items.push({
            id: item.id,
            icon: getMenuIcon(item.icon),
            label: item.name,
            href: item.path,
            menuGroupId: item.menu_group_id,
            children: children.length > 0 ? children : undefined,
          });
        });

        // Convert map to sorted array
        const sortedSections = Array.from(sectionMap.values()).sort((a, b) => a.sort - b.sort);

        setDynamicSections(sortedSections);
      } catch (error) {
        console.error("Failed to load sidebar navigation:", error);
      } finally {
        if (isMounted) {
          setIsLoadingMenus(false);
        }
      }
    }

    fetchMenuData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <>
      {/* Mobile Backdrop Overlay with Blur */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 md:hidden backdrop-blur-md transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Futuristic Glassmorphic Sidebar Container */}
      <aside 
        className={`w-64 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col h-full shrink-0 text-slate-300
          fixed md:static inset-y-0 left-0 z-50 transform md:transform-none transition-transform duration-300 ease-in-out shadow-2xl shadow-indigo-950/20
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Top Brand Header Panel */}
        <div className="p-5 border-b border-slate-800/70 bg-linear-to-b from-slate-900/90 to-slate-900/50 relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-9 h-9 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
              </div>
              
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Nex<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">Gate</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400/90 font-medium tracking-wide">SYSTEM ONLINE</span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scroll Container Wrapper with Top/Bottom Gradient Masking */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          {/* Top Subtle Gradient Fade Overlay */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-linear-to-b from-slate-900/90 to-transparent pointer-events-none z-10" />

          {/* Scrollable Navigation Sections with Premium Ultra-thin Custom Scrollbar */}
          <div className="p-4 overflow-y-auto flex-1 custom-sidebar-scrollbar space-y-6 scroll-smooth pr-2 z-0">

            {/* 1. Static Group: Operational Hub */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  Operational Hub
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-mono font-medium">
                  Core
                </span>
              </div>

              <div className="space-y-1">
                {staticNavItems.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedMenus[item.label];
                  const isChildActive = item.children?.some(child => pathname === child.href);
                  const isActive = pathname === item.href || isChildActive;

                  return (
                    <div key={item.label} className="mb-0.5">
                      {hasChildren ? (
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                            ? "bg-linear-to-r from-blue-600/20 via-indigo-600/15 to-transparent text-blue-400 font-semibold border border-blue-500/30 shadow-md shadow-blue-950/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                            <span className="text-xs font-medium tracking-wide">{item.label}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href!}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                            ? "bg-linear-to-r from-blue-600/20 via-indigo-600/15 to-transparent text-blue-400 font-semibold border border-blue-500/30 shadow-md shadow-blue-950/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                            }`}
                        >
                          <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                          <span className="text-xs font-medium tracking-wide">{item.label}</span>
                        </Link>
                      )}

                      {/* Nested Child Submenu */}
                      {hasChildren && isExpanded && (
                        <div className="mt-1 relative flex flex-col space-y-1 ml-4 pl-4 border-l border-slate-800">
                          {item.children!.map((child) => {
                            const isChildCurrent = pathname === child.href;
                            return (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`block px-3 py-2 text-xs transition-all rounded-lg ${isChildCurrent
                                  ? "text-blue-400 bg-blue-500/10 font-semibold border border-blue-500/20"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                }`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-linear-to-r from-transparent via-slate-800 to-transparent my-4" />

            {/* 2. Dynamic Groups: Rendered by Menu Groups from API */}
            {isLoadingMenus ? (
              <div className="px-3 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-8 bg-slate-800/50 rounded-xl animate-pulse" />
                <div className="h-8 bg-slate-800/50 rounded-xl animate-pulse" />
                <div className="h-8 bg-slate-800/50 rounded-xl animate-pulse" />
              </div>
            ) : (
              dynamicSections.map((section) => (
                <div key={section.id} className="space-y-1.5">
                  <div className="flex items-center justify-between px-3 mb-1.5">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold flex items-center gap-1.5">
                      <Sliders className="w-3 h-3 text-indigo-400" />
                      {section.title}
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/60 font-mono font-medium">
                      {section.items.length}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const hasChildren = item.children && item.children.length > 0;
                      const isExpanded = expandedMenus[item.label];
                      const isChildActive = item.children?.some(child => pathname === child.href);
                      const isActive = pathname === item.href || isChildActive;

                      return (
                        <div key={item.id || item.label} className="mb-0.5">
                          {hasChildren ? (
                            <button
                              onClick={() => toggleMenu(item.label)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-linear-to-r from-indigo-600/20 via-blue-600/15 to-transparent text-indigo-300 font-semibold border border-indigo-500/30 shadow-md shadow-indigo-950/30"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                                <span className="text-xs font-medium tracking-wide">{item.label}</span>
                              </div>
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                              )}
                            </button>
                          ) : (
                            <Link
                              href={item.href || "#"}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-linear-to-r from-indigo-600/20 via-blue-600/15 to-transparent text-indigo-300 font-semibold border border-indigo-500/30 shadow-md shadow-indigo-950/30"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                                }`}
                            >
                              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                              <span className="text-xs font-medium tracking-wide">{item.label}</span>
                            </Link>
                          )}

                          {/* Nested Submenu */}
                          {hasChildren && isExpanded && (
                            <div className="mt-1 relative flex flex-col space-y-1 ml-4 pl-4 border-l border-slate-800">
                              {item.children!.map((child) => {
                                const isChildCurrent = pathname === child.href;
                                return (
                                  <Link
                                    key={child.id || child.label}
                                    href={child.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`block px-3 py-2 text-xs transition-all rounded-lg ${isChildCurrent
                                      ? "text-indigo-300 bg-indigo-500/10 font-semibold border border-indigo-500/20"
                                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                    }`}
                                  >
                                    {child.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Subtle Gradient Fade Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-linear-to-t from-slate-900/90 to-transparent pointer-events-none z-10" />
        </div>

        {/* Footer User Info Panel */}
        <div className="p-3.5 border-t border-slate-800/80 bg-linear-to-t from-slate-950/90 via-slate-900/80 to-slate-900/40 relative z-20">
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-500 to-blue-500 p-0.5">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Admin Avatar" 
                    className="w-full h-full object-cover rounded-[10px]" 
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>

              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.name || "Admin Sudirman"}</div>
                <div className="text-[10px] text-indigo-400/90 font-mono truncate">{user?.role || "Central Manager"}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-xl transition-all shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
