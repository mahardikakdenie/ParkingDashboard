"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, Car, Edit } from "lucide-react";
import { vehicleTypesService } from "@/services/vehicle-types.service";
import { VehicleTypeItem, PaginationMeta } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

export default function VehicleTypesPage() {
  const [items, setItems] = useState<VehicleTypeItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, total_data: 0, total_pages: 1, total_per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VehicleTypeItem | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", status: 1 });
  const [submitting, setSubmitting] = useState(false);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vehicleTypesService.getList({ page, limit: 10, search });
      setItems(res.items || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch vehicle types", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleOpenModal = (item?: VehicleTypeItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, description: item.description, status: item.status });
    } else {
      setEditingItem(null);
      setFormData({ name: "", description: "", status: 1 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await vehicleTypesService.update(editingItem.id, formData);
      } else {
        await vehicleTypesService.create(formData);
      }
      setIsModalOpen(false);
      fetchTypes();
    } catch (err) {
      console.error("Save vehicle type failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<VehicleTypeItem>[] = [
    {
      key: "name",
      header: "Category Name",
      render: (item) => <span className="font-semibold text-white">{item.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (item) => <span className="text-slate-400">{item.description || "-"}</span>,
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
            <Car className="w-6 h-6 text-cyan-400" />
            Vehicle Categories
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage supported vehicle classifications (Car, Motorcycle, Truck, etc.).</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTypes} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle Type
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        accentColor="cyan"
        search={{
          value: search,
          onChange: (val) => { setSearch(val); setPage(1); },
          placeholder: "Search category name...",
        }}
        pagination={{
          currentPage: meta.page,
          totalPages: meta.total_pages,
          totalItems: meta.total_data,
          itemsPerPage: meta.total_per_page,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={{
          icon: Car,
          title: "Belum Ada Kategori Kendaraan",
          description: "Belum ada tipe/kategori kendaraan terdaftar dalam sistem.",
          actionLabel: "Tambah Kategori",
          onAction: () => handleOpenModal(),
        }}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">{editingItem ? "Edit Vehicle Type" : "Add Vehicle Type"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500" rows={2} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">{submitting ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
