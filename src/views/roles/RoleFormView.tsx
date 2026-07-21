"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Search,
  Sparkles,
  Save,
  Loader2,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Layers,
  CheckSquare,
  Square,
  Eye,
} from "lucide-react";
import { rolesService } from "@/services/roles.service";
import {
  AssignmentRoleResponse,
  PermissionAssignmentResponse,
  MenuAssignmentResponse,
} from "@/types/api";

interface RoleFormViewProps {
  mode: "create" | "edit";
  roleId?: string;
}

export default function RoleFormView({ mode, roleId }: RoleFormViewProps) {
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<number>(1);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // UI & Data State
  const [assignmentData, setAssignmentData] = useState<AssignmentRoleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Fetch Assignment Data & Existing Role Details
  const initData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const assignment = await rolesService.getAssignment();
      setAssignmentData(assignment);

      if (mode === "edit" && roleId) {
        const detail = await rolesService.getDetail(roleId);
        setName(detail.name || "");
        setDescription(detail.description || "");
        setStatus(detail.status ?? 1);
        setSelectedMenus(detail.assigned_menus || []);
        setSelectedPermissions(detail.assigned_resource_permissions || []);
      }
    } catch (err: any) {
      console.error("Failed to load role form data", err);
      setErrorMsg("Gagal memuat data role dan permission. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [mode, roleId]);

  useEffect(() => {
    initData();
  }, [initData]);

  // Group Permissions by Resource Module
  const groupedResources = useMemo(() => {
    if (!assignmentData?.permissions) return [];

    const map = new Map<string, PermissionAssignmentResponse[]>();
    assignmentData.permissions.forEach((perm) => {
      const resourceKey = perm.resource || "General";
      if (!map.has(resourceKey)) {
        map.set(resourceKey, []);
      }
      map.get(resourceKey)!.push(perm);
    });

    const categories: {
      resource: string;
      label: string;
      permissions: PermissionAssignmentResponse[];
      associatedMenu?: MenuAssignmentResponse;
    }[] = [];

    map.forEach((permissions, resource) => {
      // Find matching menu item by resource or name match
      const menuMatch = assignmentData.menus?.find(
        (m) =>
          m.name.toLowerCase() === resource.toLowerCase() ||
          m.path?.includes(resource.toLowerCase()) ||
          m.id.toLowerCase() === resource.toLowerCase()
      );

      // Clean up resource label
      const formattedLabel = resource
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      categories.push({
        resource,
        label: formattedLabel,
        permissions,
        associatedMenu: menuMatch,
      });
    });

    return categories;
  }, [assignmentData]);

  // Filtered Resources based on Search and Active Category Filter
  const filteredResources = useMemo(() => {
    return groupedResources.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.permissions.some(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.key.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        activeCategory === "all" || item.resource === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [groupedResources, searchQuery, activeCategory]);

  // Statistics
  const totalAvailablePermissions = assignmentData?.permissions?.length || 0;
  const totalAvailableMenus = assignmentData?.menus?.length || 0;

  // Toggle Handlers
  const handleTogglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleToggleMenu = (id: string) => {
    setSelectedMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleToggleResourceAll = (permissions: PermissionAssignmentResponse[], menuId?: string) => {
    const permIds = permissions.map((p) => p.id);
    const allSelected = permIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all in resource
      setSelectedPermissions((prev) => prev.filter((id) => !permIds.includes(id)));
      if (menuId) {
        setSelectedMenus((prev) => prev.filter((id) => id !== menuId));
      }
    } else {
      // Select all in resource
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...permIds])));
      if (menuId) {
        setSelectedMenus((prev) => Array.from(new Set([...prev, menuId])));
      }
    }
  };

  // Quick Presets
  const applyFullAdminPreset = () => {
    if (!assignmentData) return;
    setSelectedMenus(assignmentData.menus.map((m) => m.id));
    setSelectedPermissions(assignmentData.permissions.map((p) => p.id));
  };

  const applyReadOnlyPreset = () => {
    if (!assignmentData) return;
    setSelectedMenus(assignmentData.menus.map((m) => m.id));
    const readOnlyPerms = assignmentData.permissions
      .filter((p) => {
        const act = p.action?.toLowerCase() || "";
        const key = p.key?.toLowerCase() || "";
        return (
          act === "read" ||
          act === "list" ||
          act === "get" ||
          key.includes("read") ||
          key.includes("list")
        );
      })
      .map((p) => p.id);
    setSelectedPermissions(readOnlyPerms);
  };

  const handleClearAll = () => {
    setSelectedMenus([]);
    setSelectedPermissions([]);
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama Role tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      menus: selectedMenus,
      resource_permissions: selectedPermissions,
      status,
    };

    try {
      if (mode === "edit" && roleId) {
        await rolesService.update(roleId, payload);
      } else {
        await rolesService.create(payload);
      }
      router.push("/roles");
    } catch (err: any) {
      console.error("Failed to save role", err);
      setErrorMsg(
        err.response?.data?.message || "Gagal menyimpan role. Silakan periksa kembali isian form."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Action Badge Decorators
  const getActionBadgeClass = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("create") || act.includes("add"))
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (act.includes("read") || act.includes("list") || act.includes("get"))
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    if (act.includes("update") || act.includes("edit"))
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    if (act.includes("delete") || act.includes("remove"))
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    return "bg-purple-500/10 text-purple-400 border-purple-500/30";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm text-slate-400 font-medium">Memuat konfigurasi Role & Permission Matrix...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/roles"
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all hover:scale-105"
              title="Kembali ke Daftar Roles"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase">
                  {mode === "create" ? "New Role" : "Edit Role"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                {mode === "create" ? "Create New Role" : `Edit Role: ${name || "Untitled"}`}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Atur nama role dan konfigurasi hak akses granular melalui Feature Permission Matrix.
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/roles"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Simpan Role
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Role General Info Card */}
      <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl space-y-6 shadow-lg">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Layers className="w-4 h-4 text-emerald-400" />
          Informasi Utama Role
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Nama Role <span className="text-rose-400">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="Contoh: Manager Operasional"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">Deskripsi Role</label>
            <input
              type="text"
              placeholder="Jelaskan cakupan akses role ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">Status Aktivasi</label>
            <select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value={1}>Active (Aktif)</option>
              <option value={0}>Inactive (Non-Aktif)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature Permission Matrix Card */}
      <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl space-y-6 shadow-lg">
        {/* Matrix Header & Statistics */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Feature & Permission Assignment Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih menu dan hak akses per modul yang diizinkan untuk role ini.
            </p>
          </div>

          {/* Quick Presets & Counter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1.5 mr-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Selected: <strong className="text-emerald-400">{selectedPermissions.length}</strong> / {totalAvailablePermissions} Perms | <strong className="text-emerald-400">{selectedMenus.length}</strong> / {totalAvailableMenus} Menus
            </span>

            <button
              type="button"
              onClick={applyFullAdminPreset}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Full Admin
            </button>
            <button
              type="button"
              onClick={applyReadOnlyPreset}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Read Only
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
        </div>

        {/* Matrix Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari modul atau permission..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              All Modules ({groupedResources.length})
            </button>
            {groupedResources.slice(0, 5).map((res) => (
              <button
                key={res.resource}
                type="button"
                onClick={() => setActiveCategory(res.resource)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCategory === res.resource
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {res.label}
              </button>
            ))}
          </div>
        </div>

        {/* Permission Matrix Grid / List */}
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/60 text-slate-400 text-xs">
              Tidak ada modul atau permission yang cocok dengan kata kunci pencarian.
            </div>
          ) : (
            filteredResources.map((item) => {
              const resourcePermIds = item.permissions.map((p) => p.id);
              const selectedCountInResource = resourcePermIds.filter((id) =>
                selectedPermissions.includes(id)
              ).length;
              const isAllResourceSelected =
                resourcePermIds.length > 0 &&
                selectedCountInResource === resourcePermIds.length;

              const isMenuSelected =
                item.associatedMenu && selectedMenus.includes(item.associatedMenu.id);

              return (
                <div
                  key={item.resource}
                  className="bg-slate-950/50 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700/80 transition-all duration-200"
                >
                  {/* Module Header Strip */}
                  <div className="p-4 bg-slate-800/40 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Module Select All Checkbox */}
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleResourceAll(item.permissions, item.associatedMenu?.id)
                        }
                        className="text-slate-400 hover:text-emerald-400 transition-colors"
                        title={isAllResourceSelected ? "Deselect Module" : "Select All in Module"}
                      >
                        {isAllResourceSelected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-600" />
                        )}
                      </button>

                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          {item.label}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                            {selectedCountInResource}/{item.permissions.length}
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Resource Key: {item.resource}
                        </p>
                      </div>
                    </div>

                    {/* Associated Menu Toggle */}
                    {item.associatedMenu && (
                      <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!isMenuSelected}
                            onChange={() => handleToggleMenu(item.associatedMenu!.id)}
                            className="rounded border-slate-700 text-emerald-500 bg-slate-950 focus:ring-emerald-500"
                          />
                          <span className="text-emerald-400 font-semibold">Enable Menu Access:</span>
                          <span className="text-white">{item.associatedMenu.name}</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Permission Items Grid */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {item.permissions.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.id);

                      return (
                        <label
                          key={perm.id}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isChecked
                              ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm"
                              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="mt-0.5 rounded border-slate-700 text-emerald-500 bg-slate-950 focus:ring-emerald-500"
                          />
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-white truncate">
                                {perm.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider ${getActionBadgeClass(
                                  perm.action || ""
                                )}`}
                              >
                                {perm.action || "action"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              {perm.key}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="fixed bottom-4 left-4 right-4 md:left-72 z-40 p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4">
        <div className="text-xs text-slate-300 hidden sm:block">
          Terpilih: <strong className="text-emerald-400">{selectedPermissions.length}</strong> Permission(s),{" "}
          <strong className="text-emerald-400">{selectedMenus.length}</strong> Menu(s)
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/roles"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Simpan Role
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
