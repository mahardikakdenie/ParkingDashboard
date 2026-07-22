"use client";

import React from "react";
import { Search, ChevronLeft, ChevronRight, X, LucideIcon, Inbox } from "lucide-react";
import { TableEmptyState } from "@/components/TableEmptyState";

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor?: (item: T, index: number) => string | number;
  
  // Search Configuration
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };

  // Pagination Configuration
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
  };

  // Empty State Configuration
  emptyState?: {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: LucideIcon;
  };

  // Top Right Action Buttons
  actions?: React.ReactNode;

  // Visual Accent Color
  accentColor?: "blue" | "emerald" | "indigo" | "purple" | "cyan" | "amber" | "rose";
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  keyExtractor,
  search,
  pagination,
  emptyState,
  actions,
  accentColor = "blue",
  className = "",
}: DataTableProps<T>) {
  const isSearchActive = Boolean(search?.value && search.value.trim().length > 0);

  // Border & Focus color maps
  const accentFocusMap = {
    blue: "focus:border-blue-500/80 focus:ring-blue-500/20",
    emerald: "focus:border-emerald-500/80 focus:ring-emerald-500/20",
    indigo: "focus:border-indigo-500/80 focus:ring-indigo-500/20",
    purple: "focus:border-purple-500/80 focus:ring-purple-500/20",
    cyan: "focus:border-cyan-500/80 focus:ring-cyan-500/20",
    amber: "focus:border-amber-500/80 focus:ring-amber-500/20",
    rose: "focus:border-rose-500/80 focus:ring-rose-500/20",
  };

  const accentBadgeMap = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  const accentButtonMap = {
    blue: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20",
    indigo: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20",
    purple: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20",
    cyan: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20",
    amber: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20",
    rose: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20",
  };

  const page = pagination?.currentPage || 1;
  const limit = pagination?.itemsPerPage || 10;
  const totalItems = pagination?.totalItems || data.length;
  const startItem = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className={`bg-slate-900/70 border border-slate-800/80 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col ${className}`}>
      {/* Top Controls Toolbar */}
      {(search || actions) && (
        <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40">
          {search ? (
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={search.placeholder || "Search records..."}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className={`w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${accentFocusMap[accentColor]}`}
              />
              {isSearchActive && (
                <button
                  type="button"
                  onClick={() => search.onChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : <div />}

          {actions && <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto custom-sidebar-scrollbar flex-1">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800/80 sticky top-0 backdrop-blur-md z-10">
            <tr>
              {columns.map((col) => {
                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left";
                return (
                  <th
                    key={col.key}
                    className={`px-4 py-3.5 ${alignClass} ${col.headerClassName || ""}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              // Shimmer Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse bg-slate-900/20">
                  {columns.map((col, colIdx) => (
                    <td key={`sk-${idx}-${colIdx}`} className="px-4 py-4">
                      <div className="h-3.5 bg-slate-800/80 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <TableEmptyState
                colSpan={columns.length}
                icon={emptyState?.icon || Inbox}
                title={emptyState?.title}
                description={emptyState?.description}
                searchTerm={search?.value}
                onClearSearch={search ? () => search.onChange("") : undefined}
                actionLabel={emptyState?.actionLabel}
                onAction={emptyState?.onAction}
                actionIcon={emptyState?.actionIcon}
              />
            ) : (
              data.map((item, index) => {
                const key = keyExtractor
                  ? keyExtractor(item, index)
                  : (item as any).id || index;
                return (
                  <tr
                    key={key}
                    className="hover:bg-slate-800/40 transition-colors duration-150 group"
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left";
                      let content: React.ReactNode = null;
                      if (col.render) {
                        content = col.render(item, index);
                      } else if (col.accessorKey) {
                        content = String(item[col.accessorKey] ?? "");
                      }
                      return (
                        <td
                          key={`${key}-${col.key}`}
                          className={`px-4 py-3.5 ${alignClass} ${col.className || ""}`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="font-semibold text-slate-200">{startItem}</span> to{" "}
              <span className="font-semibold text-slate-200">{endItem}</span> of{" "}
              <span className="font-semibold text-slate-200">{totalItems}</span> entries
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.currentPage <= 1 || loading}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            {Array.from({ length: pagination.totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = pageNum === pagination.currentPage;
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                Math.abs(pageNum - pagination.currentPage) <= 1
              ) {
                return (
                  <button
                    key={`page-${pageNum}`}
                    type="button"
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? accentButtonMap[accentColor]
                        : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === 2 && pagination.currentPage > 3) ||
                (pageNum === pagination.totalPages - 1 &&
                  pagination.currentPage < pagination.totalPages - 2)
              ) {
                return <span key={`dots-${pageNum}`} className="px-1 text-slate-600">...</span>;
              }
              return null;
            })}

            <button
              type="button"
              disabled={pagination.currentPage >= pagination.totalPages || loading}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
