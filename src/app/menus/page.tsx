"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Menu as MenuIcon, Edit, Loader2 } from "lucide-react";
import { menusService } from "@/services/menus.service";
import { menuGroupsService } from "@/services/menu-groups.service";
import { MenuResponse, MenuGroupOptionsResponse } from "@/types/api";
import { TableEmptyState } from "@/components/TableEmptyState";

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuResponse[]>([]);
  const [groups, setGroups] = useState<MenuGroupOptionsResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuResponse | null>(null);
  const [formData, setFormData] = useState({ menu_group_id: "", name: "", description: "", sort: 0, parent_id: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resMenus, resGroups] = await Promise.all([
        menusService.getAll(),
        menuGroupsService.getOptions(),
      ]);
      setMenus(resMenus || []);
      setGroups(resGroups || []);
    } catch (err) {
      console.error("Failed to load menus data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleEdit = (menu: MenuResponse) => {
    setEditingMenu(menu);
    setFormData({
      menu_group_id: menu.menu_group_id || "",
      name: menu.name || "",
      description: menu.description || "",
      sort: menu.sort || 0,
      parent_id: menu.parent_id || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;
    setSubmitting(true);
    try {
      await menusService.update(editingMenu.id, formData);
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      console.error("Failed to update menu", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-cyan-400" />
            Menus Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage system routes, navigation icons, and levels.</p>
        </div>
        <button onClick={fetchInitialData} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Path</th>
                <th className="p-3">Icon</th>
                <th className="p-3">Level</th>
                <th className="p-3">Sort</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-500 mb-2" /> Loading menus...
                  </td>
                </tr>
              ) : menus.length === 0 ? (
                <TableEmptyState
                  colSpan={6}
                  icon={MenuIcon}
                  title="Belum Ada Menu"
                  description="Belum ada item menu yang terkonfigurasi dalam sistem."
                />
              ) : (
                menus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-semibold text-white">{menu.name}</td>
                    <td className="p-3 font-mono text-cyan-400">{menu.path}</td>
                    <td className="p-3 text-slate-400">{menu.icon || "-"}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">{menu.level}</span></td>
                    <td className="p-3 font-mono">{menu.sort}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleEdit(menu)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
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
            <h2 className="text-lg font-bold text-white">Edit Menu Item</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Menu Group</label>
                <select
                  value={formData.menu_group_id}
                  onChange={(e) => setFormData({ ...formData, menu_group_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">-- Select Group --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold disabled:opacity-50">
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
