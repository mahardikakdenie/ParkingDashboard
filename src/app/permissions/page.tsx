"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, Key } from "lucide-react";
import { permissionsService } from "@/services/permissions.service";
import { PermissionItem, PaginationMeta } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

export default function PermissionsPage() {
  const [items, setItems] = useState<PermissionItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, total_data: 0, total_pages: 1, total_per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", key: "", resource: "", action: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await permissionsService.getList({ page, limit: 10, search });
      setItems(res.items || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await permissionsService.create(formData);
      setIsModalOpen(false);
      setFormData({ name: "", key: "", resource: "", action: "", description: "" });
      fetchPermissions();
    } catch (err) {
      console.error("Create permission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<PermissionItem>[] = [
    {
      key: "name",
      header: "Permission Name",
      render: (item) => (
        <div>
          <div className="font-semibold text-white">{item.name}</div>
          <div className="text-[10px] text-amber-400 font-mono">@{item.id}</div>
        </div>
      ),
    },
    {
      key: "resource",
      header: "Resource",
      render: (item) => <span className="font-mono text-slate-300">{item.resource}</span>,
    },
    {
      key: "action",
      header: "Action",
      render: (item) => <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">{item.action}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (item) => <span className="text-slate-400">{item.description || "-"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Key className="w-6 h-6 text-amber-400" />
            System Permissions
          </h1>
          <p className="text-xs text-slate-400 mt-1">Granular action and resource access rights.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchPermissions} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Permission
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        accentColor="amber"
        search={{
          value: search,
          onChange: (val) => { setSearch(val); setPage(1); },
          placeholder: "Search key, resource...",
        }}
        pagination={{
          currentPage: meta.page,
          totalPages: meta.total_pages,
          totalItems: meta.total_data,
          itemsPerPage: meta.total_per_page,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={{
          icon: Key,
          title: "Belum Ada Permission",
          description: "Belum ada izin sistem terkonfigurasi.",
          actionLabel: "Tambah Permission",
          onAction: () => setIsModalOpen(true),
        }}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Add Permission</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Permission Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Permission Key</label>
                <input required type="text" value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Resource</label>
                <input required type="text" value={formData.resource} onChange={(e) => setFormData({ ...formData, resource: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Action</label>
                <input required type="text" value={formData.action} onChange={(e) => setFormData({ ...formData, action: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" rows={2} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">{submitting ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
