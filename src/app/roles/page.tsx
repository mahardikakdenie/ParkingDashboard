"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ShieldCheck, Edit } from "lucide-react";
import { rolesService } from "@/services/roles.service";
import { RoleItem, PaginationMeta } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

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

  const columns: Column<RoleItem>[] = [
    {
      key: "name",
      header: "Role Name",
      render: (item) => <span className="font-semibold text-white">{item.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (item) => <span className="text-slate-400">{item.description}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.status === 1 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
          {item.status_text || (item.status === 1 ? "Active" : "Inactive")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (item) => (
        <Link
          href={`/roles/edit/${item.id}`}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors inline-block"
          title="Edit Role Permissions"
        >
          <Edit className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

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
          <button
            onClick={fetchRoles}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link
            href="/roles/create"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Role
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        accentColor="emerald"
        search={{
          value: search,
          onChange: (val) => { setSearch(val); setPage(1); },
          placeholder: "Search roles...",
        }}
        pagination={{
          currentPage: meta.page,
          totalPages: meta.total_pages,
          totalItems: meta.total_data,
          itemsPerPage: meta.total_per_page,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={{
          icon: ShieldCheck,
          title: "Belum Ada Role",
          description: "Silakan buat role baru untuk mengelola akses pengguna.",
          actionLabel: "Tambah Role",
          onAction: () => router.push("/roles/create"),
        }}
      />
    </div>
  );
}
