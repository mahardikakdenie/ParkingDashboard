"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Check,
  Filter,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { notificationsService } from "@/services/notifications.service";
import { NotificationItem, NotificationType } from "@/types/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (selectedType !== "all") params.type = selectedType;
      if (readFilter === "unread") params.is_read = false;
      if (readFilter === "read") params.is_read = true;
      if (search.trim()) params.search = search.trim();

      const res = await notificationsService.getList(params);
      setNotifications(res?.items || []);
      setTotalPages(res?.totalPages || 1);
      setTotalItems(res?.total || 0);
    } catch (err) {
      console.error("Failed to load notifications page data:", err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedType, readFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      loadData();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      loadData();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "error":
        return <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-400" />
            <span>Notification Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System activity alerts, status updates, and event notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4 text-blue-400" />
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Read Filter */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {["all", "unread", "read"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setReadFilter(tab); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${readFilter === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 outline-none focus:border-blue-500 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-sm font-medium text-slate-400">No notifications matching criteria</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 transition-colors flex items-start gap-4 ${!item.is_read ? "bg-blue-950/15" : "hover:bg-slate-800/30"
                }`}
            >
              <div className="mt-0.5">{getTypeIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm ${!item.is_read ? "font-bold text-slate-100" : "font-medium text-slate-300"}`}>
                    {item.title}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {!item.is_read && (
                <button
                  onClick={() => handleMarkAsRead(item.id)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Read</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <span>Total {totalItems} items</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
