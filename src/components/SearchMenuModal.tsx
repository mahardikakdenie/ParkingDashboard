"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
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
  Bell,
  CreditCard,
  UserCog,
  Lock,
  HelpCircle,
  ScanText,
  Gamepad2,
  ArrowRight,
  CornerDownLeft,
  LucideIcon,
} from "lucide-react";
import { menusService } from "@/services/menus.service";

export type MenuItemOption = {
  id: string;
  title: string;
  category: string;
  href: string;
  icon: LucideIcon;
  keywords?: string[];
};

const DEFAULT_MENU_ITEMS: MenuItemOption[] = [
  { id: "dash", title: "Dashboard Overview", category: "Main", href: "/dashboard", icon: LayoutDashboard, keywords: ["home", "main", "metrics", "stats"] },
  { id: "tx", title: "Transactions", category: "Main", href: "/transactions", icon: Receipt, keywords: ["receipt", "history", "logs", "payments"] },
  { id: "cust", title: "Customers", category: "Main", href: "/customers", icon: Users, keywords: ["users", "clients", "members"] },
  { id: "rates", title: "Parking Rates", category: "Operations", href: "/parking-rates", icon: Banknote, keywords: ["tariff", "price", "cost", "fee"] },
  { id: "vt", title: "Vehicle Types", category: "Operations", href: "/vehicle-types", icon: Car, keywords: ["cars", "bikes", "categories"] },
  { id: "topup", title: "Topup & Wallet", category: "Operations", href: "/topup", icon: Wallet, keywords: ["balance", "refill", "credit"] },
  { id: "gate", title: "Live Gate Monitor", category: "Operations", href: "/gate", icon: Gamepad2, keywords: ["barrier", "control", "camera"] },
  { id: "ocr", title: "OCR Simulation Demo", category: "Operations", href: "/demo", icon: ScanText, keywords: ["plate", "scan", "camera", "checkin"] },
  { id: "apps", title: "Applications", category: "System & Management", href: "/applications", icon: Layers, keywords: ["apps", "services"] },
  { id: "mgroups", title: "Menu Groups", category: "System & Management", href: "/menu-groups", icon: FolderTree, keywords: ["categories", "navigation"] },
  { id: "menus", title: "Menu Management", category: "System & Management", href: "/menus", icon: MenuIcon, keywords: ["routes", "links"] },
  { id: "perm", title: "Permissions", category: "Access Control", href: "/permissions", icon: ShieldCheck, keywords: ["rules", "access"] },
  { id: "roles", title: "Roles & Grants", category: "Access Control", href: "/roles", icon: Shield, keywords: ["group", "authority"] },
  { id: "users", title: "User Accounts", category: "Access Control", href: "/users", icon: User, keywords: ["members", "accounts"] },
  { id: "notif", title: "Notifications", category: "System & Management", href: "/notifications", icon: Bell, keywords: ["alerts", "logs"] },
  { id: "pgw", title: "Payment Gateway", category: "System & Management", href: "/payment-gateway", icon: CreditCard, keywords: ["midtrans", "webhook"] },
  { id: "acc", title: "Account Profile", category: "User Settings", href: "/account", icon: UserCog, keywords: ["profile", "me", "settings"] },
  { id: "pwd", title: "Security & Password", category: "User Settings", href: "/change-password", icon: Lock, keywords: ["credential", "auth"] },
  { id: "help", title: "Help & Support", category: "Support", href: "/help", icon: HelpCircle, keywords: ["docs", "guide", "faq"] },
];

interface SearchMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchMenuModal({ isOpen, onClose }: SearchMenuModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>(DEFAULT_MENU_ITEMS);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load dynamic items from backend if available
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicMenus() {
      try {
        const res = await menusService.getAll();
        if (isMounted && Array.isArray(res) && res.length > 0) {
          const apiItems: MenuItemOption[] = res.map((m) => ({
            id: m.id,
            title: m.name,
            category: "System Routes",
            href: m.path || "#",
            icon: MenuIcon,
          }));

          // Merge and deduplicate by href
          const hrefSet = new Set(DEFAULT_MENU_ITEMS.map((item) => item.href));
          const newApiItems = apiItems.filter((item) => item.href && item.href !== "#" && !hrefSet.has(item.href));
          setMenuItems([...DEFAULT_MENU_ITEMS, ...newApiItems]);
        }
      } catch (err) {
        // Fallback to default items
      }
    }
    loadDynamicMenus();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter menu items based on user query
  const filteredItems = menuItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchCategory = item.category.toLowerCase().includes(q);
    const matchHref = item.href.toLowerCase().includes(q);
    const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
    return matchTitle || matchCategory || matchHref || matchKeywords;
  });

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Navigate to item
  const handleSelect = useCallback(
    (href: string) => {
      onClose();
      if (href && href !== "#") {
        router.push(href);
      }
    },
    [onClose, router]
  );

  // Global Ctrl + K / Cmd + K listener to open/toggle, and keyboard nav inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered
          // Notice parent handler sets isOpen=true
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Modal internal keyboard navigation (Esc, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex].href);
        }
      }
    };

    window.addEventListener("keydown", handleModalKeyDown);
    return () => window.removeEventListener("keydown", handleModalKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[75vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/90 gap-3 shrink-0">
          <Search className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu or press ESC to close..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-500 hover:text-slate-300 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700/60 hidden sm:inline-block shrink-0">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1 custom-sidebar-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600 stroke-[1.5]" />
              <p className="text-xs">No menus matching &quot;{query}&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-slate-800/80 text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/50 uppercase truncate">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{item.href}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isSelected && (
                      <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        Jump <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? "text-indigo-400 translate-x-0.5"
                          : "text-slate-600 group-hover:text-slate-400"
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between shrink-0 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">↑</kbd>
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">↓</kbd>
              <span className="text-slate-400 ml-0.5">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">↵</kbd>
              <span className="text-slate-400 ml-0.5">Select</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">ESC</kbd>
            <span className="text-slate-400 ml-0.5">Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
