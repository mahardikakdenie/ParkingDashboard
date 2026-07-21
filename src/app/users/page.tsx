"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Search, RefreshCw, Users, Download, Edit, Loader2 } from "lucide-react";
import { usersService } from "@/services/users.service";
import { rolesService } from "@/services/roles.service";
import { applicationsService } from "@/services/applications.service";
import { UserItem, PaginationMeta, RoleOptionsResponse, OptionsApplicationResponse } from "@/types/api";
import { TableEmptyState } from "@/components/TableEmptyState";

export default function UsersPage() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, total_data: 0, total_pages: 1, total_per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [roleOptions, setRoleOptions] = useState<RoleOptionsResponse[]>([]);
  const [appOptions, setAppOptions] = useState<OptionsApplicationResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    roles: [] as string[],
    applications: [] as string[],
    status: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.getList({ page, limit: 10, search });
      setItems(res.items || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleExport = async () => {
    try {
      const csvData = await usersService.getExport({ search });
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${Date.now()}.csv`;
      a.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleOpenModal = async (item?: UserItem) => {
    try {
      const [rolesRes, appsRes] = await Promise.all([
        rolesService.getOptions(),
        applicationsService.getOptions(),
      ]);
      setRoleOptions(rolesRes || []);
      setAppOptions(appsRes || []);

      if (item) {
        const detail = await usersService.getDetail(item.id);
        setEditingItem(item);
        setFormData({
          username: detail.username,
          name: detail.name,
          email: detail.email,
          phone: detail.phone,
          password: "",
          roles: detail.roles || [],
          applications: [],
          status: detail.status,
        });
      } else {
        setEditingItem(null);
        setFormData({ username: "", name: "", email: "", phone: "", password: "", roles: [], applications: [], status: 1 });
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
        await usersService.update(editingItem.id, {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          roles: formData.roles,
          applications: formData.applications,
          status: formData.status,
        });
      } else {
        await usersService.create(formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Save user failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            User Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage system admin accounts and access privileges.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={fetchUsers} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search username, name, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" /> Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <TableEmptyState
                  colSpan={4}
                  icon={Users}
                  title="Belum Ada User"
                  description="Belum ada akun user terdaftar dalam sistem."
                  searchTerm={search}
                  onClearSearch={() => setSearch("")}
                  actionLabel="Tambah User"
                  onAction={() => handleOpenModal()}
                />
              ) : (
                items.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">@{user.id}</div>
                    </td>
                    <td className="p-3">
                      <div>{user.email}</div>
                      <div className="text-slate-500">{user.phone}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${user.status === 1 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {user.status_text || (user.status === 1 ? "Active" : "Inactive")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleOpenModal(user)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">{editingItem ? "Edit User" : "Add User"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Username</label>
                <input required type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone</label>
                <input required type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              </div>
              {!editingItem && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Password</label>
                  <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold disabled:opacity-50">{submitting ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
