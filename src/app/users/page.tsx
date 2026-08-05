"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, Users, Download, Edit, AlertCircle, Shield, LayoutGrid } from "lucide-react";
import { usersService } from "@/services/users.service";
import { rolesService } from "@/services/roles.service";
import { applicationsService } from "@/services/applications.service";
import { UserItem, PaginationMeta, RoleOptionsResponse, OptionsApplicationResponse } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
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
        setFormData({
          username: "",
          name: "",
          email: "",
          phone: "",
          password: "",
          roles: rolesRes && rolesRes.length > 0 ? [rolesRes[0].id] : [],
          applications: appsRes && appsRes.length > 0 ? [appsRes[0].id] : [],
          status: 1,
        });
      }
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to prepare modal", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.roles.length === 0) {
      setError("Please select at least 1 Role for the user.");
      return;
    }

    if (formData.applications.length === 0) {
      setError("Please select at least 1 Application for the user.");
      return;
    }

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
    } catch (err: any) {
      console.error("Save user failed", err);
      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const msgs = err.errors.map((e: any) => `${e.field}: ${e.message}`).join(", ");
        setError(`Validation failed: ${msgs}`);
      } else {
        setError(err?.message || "Failed to save user account");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<UserItem>[] = [
    {
      key: "user",
      header: "User",
      render: (user) => (
        <div>
          <div className="font-semibold text-white">{user.name}</div>
          <div className="text-[10px] text-slate-500 font-mono">@{user.id}</div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (user) => (
        <div>
          <div>{user.email}</div>
          <div className="text-slate-500">{user.phone}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${user.status === 1 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
          {user.status_text || (user.status === 1 ? "Active" : "Inactive")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (user) => (
        <button onClick={() => handleOpenModal(user)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
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
          <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        accentColor="blue"
        search={{
          value: search,
          onChange: (val) => { setSearch(val); setPage(1); },
          placeholder: "Search username, name, email...",
        }}
        pagination={{
          currentPage: meta.page,
          totalPages: meta.total_pages,
          totalItems: meta.total_data,
          itemsPerPage: meta.total_per_page,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={{
          icon: Users,
          title: "Belum Ada User",
          description: "Belum ada akun user terdaftar dalam sistem.",
          actionLabel: "Tambah User",
          onAction: () => handleOpenModal(),
        }}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>{editingItem ? "Edit User Account" : "Add New User Account"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Username</label>
                <input
                  required
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone</label>
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              {!editingItem && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Password</label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Roles Checkbox Group */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1 items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-400" /> Assign Roles
                  </span>
                  <span className="text-[10px] text-rose-400 font-mono font-bold">* Required (Min 1)</span>
                </label>
                <div className="space-y-1.5 max-h-24 overflow-y-auto p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  {roleOptions.length > 0 ? (
                    roleOptions.map((role) => {
                      const isChecked = formData.roles.includes(role.id);
                      return (
                        <label key={role.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({ ...prev, roles: [...prev.roles, role.id] }));
                              } else {
                                setFormData((prev) => ({ ...prev, roles: prev.roles.filter((r) => r !== role.id) }));
                              }
                            }}
                            className="rounded border-slate-800 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{role.name}</span>
                        </label>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No roles available</span>
                  )}
                </div>
              </div>

              {/* Applications Checkbox Group */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1 items-center justify-between">
                  <span className="flex items-center gap-1">
                    <LayoutGrid className="w-3.5 h-3.5 text-purple-400" /> Assign Applications
                  </span>
                  <span className="text-[10px] text-rose-400 font-mono font-bold">* Required (Min 1)</span>
                </label>
                <div className="space-y-1.5 max-h-24 overflow-y-auto p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  {appOptions.length > 0 ? (
                    appOptions.map((app) => {
                      const isChecked = formData.applications.includes(app.id);
                      return (
                        <label key={app.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({ ...prev, applications: [...prev.applications, app.id] }));
                              } else {
                                setFormData((prev) => ({ ...prev, applications: prev.applications.filter((a) => a !== app.id) }));
                              }
                            }}
                            className="rounded border-slate-800 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{app.name} ({app.code})</span>
                        </label>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No applications available</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-blue-950/40"
                >
                  {submitting ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
