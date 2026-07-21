"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Search, RefreshCw, ShieldCheck, Edit, Loader2 } from "lucide-react";
import { rolesService } from "@/services/roles.service";
import { RoleItem, PaginationMeta, AssignmentRoleResponse } from "@/types/api";
import { TableEmptyState } from "@/components/TableEmptyState";

export default function RolesPage() {
  const [items, setItems] = useState<RoleItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, total_data: 0, total_pages: 1, total_per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [assignmentData, setAssignmentData] = useState<AssignmentRoleResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoleItem | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", menus: [] as string[], resource_permissions: [] as string[], status: 1 });
  const [submitting, setSubmitting] = useState(false);

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

  const handleOpenModal = async (item?: RoleItem) => {
    try {
      const assignment = await rolesService.getAssignment();
      setAssignmentData(assignment);

      if (item) {
        const detail = await rolesService.getDetail(item.id);
        setEditingItem(item);
        setFormData({
          name: detail.name,
          description: detail.description,
          menus: detail.assigned_menus || [],
          resource_permissions: detail.assigned_resource_permissions || [],
          status: detail.status,
        });
      } else {
        setEditingItem(null);
        setFormData({ name: "", description: "", menus: [], resource_permissions: [], status: 1 });
      }
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to prepare modal", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await rolesService.update(editingItem.id, formData);
      } else {
        await rolesService.create(formData);
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (err) {
      console.error("Save role failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
          <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Role
          </button>
        </div>
      </div>

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
                  onAction={() => handleOpenModal()}
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
                      <button onClick={() => handleOpenModal(item)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white">{editingItem ? "Edit Role Permissions" : "Add New Role"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Role Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Menus Checkboxes */}
              {assignmentData?.menus && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Assigned Menus</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 border border-slate-800 rounded-xl max-h-40 overflow-y-auto">
                    {assignmentData.menus.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.menus.includes(m.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, menus: [...formData.menus, m.id] });
                            } else {
                              setFormData({ ...formData, menus: formData.menus.filter((id) => id !== m.id) });
                            }
                          }}
                          className="rounded border-slate-800 text-emerald-600 bg-slate-950"
                        />
                        {m.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
