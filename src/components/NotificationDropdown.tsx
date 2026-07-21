"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  ArrowRight,
  BellOff
} from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "alert" | "success" | "info" | "warning";
  read: boolean;
  category?: "system" | "parking" | "billing";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Kapasitas Parkir Hampir Penuh",
    message: "Area Parkir Slot A2 mencapai 92% kapasitas kendaraan.",
    timestamp: "2 menit lalu",
    type: "warning",
    read: false,
    category: "parking",
  },
  {
    id: "2",
    title: "Gate In 02 Offline",
    message: "Koneksi ke palang pintu Gate In 02 terputus. Mohon periksa jaringan.",
    timestamp: "15 menit lalu",
    type: "alert",
    read: false,
    category: "system",
  },
  {
    id: "3",
    title: "Topup Saldo Berhasil",
    message: "Topup saldo e-Money oleh Petugas Budi berhasil diselesaikan.",
    timestamp: "1 jam lalu",
    type: "success",
    read: false,
    category: "billing",
  },
  {
    id: "4",
    title: "Update Sistem v2.4",
    message: "Pembaruan perangkat lunak pemindaian plat nomor otomatis telah diterapkan.",
    timestamp: "3 jam lalu",
    type: "info",
    read: true,
    category: "system",
  },
  {
    id: "5",
    title: "Laporan Serah Terima Shift",
    message: "Shift 1 telah menyerahkan kasir dan ringkasan ke Shift 2.",
    timestamp: "5 jam lalu",
    type: "info",
    read: true,
    category: "system",
  },
];

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "alert">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Tutup dropdown saat klik di luar area atau menekan Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "alert") return n.type === "alert" || n.type === "warning";
    return true;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "alert":
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getIconBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "alert":
        return "bg-rose-500/10 border-rose-500/20";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20";
      case "success":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "info":
      default:
        return "bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Lonceng Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifikasi"
        className={`relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
          isOpen ? "bg-slate-800 text-white shadow-inner" : ""
        }`}
      >
        <Bell className="w-5 h-5 transition-transform duration-200 active:scale-95" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
        )}
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-slate-950/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Dropdown */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Tandai semua dibaca"
                  className="p-1.5 text-xs text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Tandai Dibaca</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Hapus Semua"
                  className="p-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/40 border-b border-slate-800/50 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === "all"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === "unread"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("alert")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === "alert"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              Peringatan ({notifications.filter((n) => n.type === "alert" || n.type === "warning").length})
            </button>
          </div>

          {/* Daftar Notifikasi */}
          <div className="max-h-95 overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`group relative p-4 flex gap-3 cursor-pointer transition-all duration-150 ${
                    !notification.read
                      ? "bg-slate-800/40 hover:bg-slate-800/70"
                      : "hover:bg-slate-800/30 text-slate-400"
                  }`}
                >
                  {/* Indikator titik belum dibaca */}
                  {!notification.read && (
                    <span className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-blue-500"></span>
                  )}

                  {/* Container Ikon */}
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${getIconBg(
                      notification.type
                    )}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  {/* Konten Notifikasi */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          !notification.read ? "text-slate-100" : "text-slate-300"
                        }`}
                      >
                        {notification.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {notification.timestamp}
                    </span>
                  </div>

                  {/* Aksi saat hover */}
                  <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm p-1 rounded-lg border border-slate-700/60 shadow-lg">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title="Tandai dibaca"
                        className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteNotification(notification.id, e)}
                      title="Hapus"
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* Tampilan Kosong (Empty State) */
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-3">
                  <BellOff className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-300 mb-1">
                  Tidak Ada Notifikasi
                </p>
                <p className="text-xs text-slate-500 max-w-50">
                  Semua notifikasi telah dibaca atau dibersihkan.
                </p>
              </div>
            )}
          </div>

          {/* Footer Dropdown */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 px-3 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>Lihat Riwayat Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
