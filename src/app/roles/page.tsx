"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, RefreshCw, ShieldCheck, Edit, Loader2 } from "lucide-react";
import { rolesService } from "@/services/roles.service";
import { RoleItem, PaginationMeta } from "@/types/api";
import { TableEmptyState } from "@/components/TableEmptyState";

export default function RolesPage() {
  const router = useRouter();
  const [items, setItems] = useState<RoleItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, total_data: 0, total_pages: 1, total_per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rolesService.getList({ page, limit: 10, search });
      setItems(res.items || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Roles & Permissions Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure user roles and granular access control.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchRoles} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link href="/roles/create" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Role
          </Link>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Role Name</th>
                <th className="p-3">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" /> Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <TableEmptyState
                  colSpan={4}
                  icon={ShieldCheck}
                  title="Belum Ada Role"
                  description="Silakan buat role baru untuk mengelola akses pengguna."
                  searchTerm={search}
                  onClearSearch={() => setSearch("")}
                  actionLabel="Tambah Role"
                  onAction={() => router.push("/roles/create")}
                />
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-semibold text-white">{item.name}</td>
                    <td className="p-3 text-slate-400">{item.description}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.status === 1 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {item.status_text || (item.status === 1 ? "Active" : "Inactive")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link href={`/roles/edit/${item.id}`} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors inline-block" title="Edit Role Permissions">
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
