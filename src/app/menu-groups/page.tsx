"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, FolderTree, Edit } from "lucide-react";
import { menuGroupsService } from "@/services/menu-groups.service";
import { MenuGroupItem, PaginationMeta } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

export default function MenuGroupsPage() {
  const [items, setItems] = useState<MenuGroupItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, total_data: 0, total_pages: 1, total_per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuGroupItem | null>(null);
  const [formData, setFormData] = useState({ name: "", sort: 0, status: 1 });
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menuGroupsService.getList({ page, limit: 10, search });
      setItems(res.items || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch menu groups", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleOpenModal = (item?: MenuGroupItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, sort: item.sort, status: item.status });
    } else {
      setEditingItem(null);
      setFormData({ name: "", sort: 0, status: 1 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await menuGroupsService.update(editingItem.id, formData);
      } else {
        await menuGroupsService.create(formData);
      }
      setIsModalOpen(false);
      fetchGroups();
    } catch (err) {
      console.error("Save menu group failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<MenuGroupItem>[] = [
    {
      key: "name",
      header: "Group Name",
      render: (item) => <span className="font-semibold text-white">{item.name}</span>,
    },
    {
      key: "sort",
      header: "Sort Order",
      render: (item) => <span className="font-mono text-slate-300">{item.sort}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.status === 1 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
          {item.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (item) => (
        <button onClick={() => handleOpenModal(item)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
          <Edit className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-indigo-400" />
            Menu Groups
          </h1>
          <p className="text-xs text-slate-400 mt-1">Organize dynamic navigation menu groups.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchGroups} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Menu Group
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        accentColor="indigo"
        search={{
          value: search,
          onChange: (val) => { setSearch(val); setPage(1); },
          placeholder: "Search menu group...",
        }}
        pagination={{
          currentPage: meta.page,
          totalPages: meta.total_pages,
          totalItems: meta.total_data,
          itemsPerPage: meta.total_per_page,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={{
          icon: FolderTree,
          title: "Belum Ada Menu Group",
          description: "Belum ada grup navigasi menu yang terkonfigurasi.",
          actionLabel: "Tambah Menu Group",
          onAction: () => handleOpenModal(),
        }}
      />
    </div>
  );
}
