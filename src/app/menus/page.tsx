"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Menu as MenuIcon, Edit } from "lucide-react";
import { menusService } from "@/services/menus.service";
import { menuGroupsService } from "@/services/menu-groups.service";
import { MenuResponse, MenuGroupOptionsResponse } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

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

  const columns: Column<MenuResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (m) => <span className="font-semibold text-white">{m.name}</span>,
    },
    {
      key: "path",
      header: "Path",
      render: (m) => <span className="font-mono text-cyan-400">{m.path}</span>,
    },
    {
      key: "icon",
      header: "Icon",
      render: (m) => <span className="text-slate-400">{m.icon || "-"}</span>,
    },
    {
      key: "level",
      header: "Level",
      render: (m) => <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">{m.level}</span>,
    },
    {
      key: "sort",
      header: "Sort",
      render: (m) => <span className="font-mono text-slate-300">{m.sort}</span>,
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (m) => (
        <button onClick={() => handleEdit(m)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
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
            <MenuIcon className="w-6 h-6 text-cyan-400" />
            Menus Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage system routes, navigation icons, and levels.</p>
        </div>
        <button onClick={fetchInitialData} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <DataTable
        columns={columns}
        data={menus}
        loading={loading}
        accentColor="cyan"
        emptyState={{
          icon: MenuIcon,
          title: "Belum Ada Menu",
          description: "Belum ada item menu yang terkonfigurasi dalam sistem.",
        }}
      />
    </div>
  );
}
