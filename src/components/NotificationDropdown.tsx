"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  ArrowRight,
  BellOff,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { notificationsService } from "@/services/notifications.service";
import { NotificationItem } from "@/types/api";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsService.getUnreadCount();
      setUnreadCount(res?.unread_count ?? res?.count ?? 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = activeTab === "unread" 
        ? { is_read: false, page: 1, limit: 10 } 
        : { page: 1, limit: 10 };
      const res = await notificationsService.getList(params);
      setNotifications(res?.items || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
  }, [fetchUnreadCount, fetchNotifications]);

  // Subscribe to real-time SSE stream for new notifications
  useEffect(() => {
    const unsubscribe = notificationsService.subscribeStream(
      (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
        setUnreadCount((prev) => prev + 1);
      },
      (err) => {
        console.warn("SSE Notification stream connection warning:", err);
      }
    );

    return () => unsubscribe();
  }, []);

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

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-200 border border-transparent hover:border-slate-700/50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-[#0B132B]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1.5 text-xs font-medium text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-slate-800/80 px-2 bg-slate-950/40">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "unread"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {isLoading ? (
              <div className="py-8 text-center text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <BellOff className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">No notifications found</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors flex gap-3 group relative ${
                    !item.is_read ? "bg-blue-950/10 hover:bg-blue-950/20" : "hover:bg-slate-800/30"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-medium ${!item.is_read ? "text-slate-100 font-semibold" : "text-slate-300"}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-400 rounded transition-all shrink-0 self-center"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-800/80 bg-slate-900/60 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium py-1 px-3 rounded-lg hover:bg-blue-500/10 transition-colors"
            >
              <span>View all notifications</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
