import React from 'react';
import { LucideIcon, Inbox, SearchX, Plus, RefreshCw } from 'lucide-react';

interface TableEmptyStateProps {
  colSpan: number;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  searchTerm?: string;
  onClearSearch?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  colSpan,
  icon: Icon = Inbox,
  title,
  description,
  searchTerm,
  onClearSearch,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
}) => {
  const isSearchActive = Boolean(searchTerm && searchTerm.trim().length > 0);
  const FinalIcon = isSearchActive ? SearchX : Icon;
  const finalTitle = title || (isSearchActive ? "Data Tidak Ditemukan" : "Belum Ada Data");
  const finalDescription =
    description ||
    (isSearchActive
      ? `Tidak ada data yang sesuai dengan pencarian "${searchTerm}". Coba kata kunci lain atau reset pencarian.`
      : "Belum ada catatan data yang tersedia di dalam sistem saat ini.");

  return (
    <tr>
      <td colSpan={colSpan} className="py-14 px-4 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          {/* Glowing Premium Icon Wrapper */}
          <div className="relative mb-4 group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-purple-600/20 rounded-3xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-xl backdrop-blur-md group-hover:border-slate-600 transition-all duration-300">
              <FinalIcon className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-sm font-semibold text-white tracking-tight">
            {finalTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {finalDescription}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {isSearchActive && onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Reset Pencarian
              </button>
            )}
            {onAction && actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <ActionIcon className="w-3.5 h-3.5" />
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
