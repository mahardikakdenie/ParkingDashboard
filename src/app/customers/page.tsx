"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, UserCheck, Download, Eye } from "lucide-react";
import { customersService } from "@/services/customers.service";
import { CustomerItem, PaginationMeta, DetailCustomerResponse } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

export default function CustomersPage() {
  const [items, setItems] = useState<CustomerItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, total_data: 0, total_pages: 1, total_per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState<DetailCustomerResponse | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customersService.getList({ page, limit: 10, search });
      setItems(res.items || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleExport = async () => {
    try {
      const csvData = await customersService.getExport({ search });
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers_${Date.now()}.csv`;
      a.click();
    } catch (err) {
      console.error("Failed to export customers", err);
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const detail = await customersService.getDetail(id);
      setSelectedCustomer(detail);
    } catch (err) {
      console.error("Failed to fetch customer detail", err);
    }
  };

  const columns: Column<CustomerItem>[] = [
    {
      key: "card_number",
      header: "Card Number",
      render: (c) => <span className="font-mono font-semibold text-emerald-400">{c.card_number}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (c) => <span className="font-semibold text-white">{c.name}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (c) => <span className="text-slate-400">{c.phone}</span>,
    },
    {
      key: "balance",
      header: "Balance",
      render: (c) => <span className="font-mono text-cyan-400 font-bold">Rp {c.balance.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.status === 1 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
          {c.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Detail",
      align: "right",
      render: (c) => (
        <button onClick={() => handleViewDetail(c.id)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            Registered Members & Customers
          </h1>
          <p className="text-xs text-slate-400 mt-1">View parking member cards, balance, and account status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={fetchCustomers} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
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
          placeholder: "Search card number, name, phone...",
        }}
        pagination={{
          currentPage: meta.page,
          totalPages: meta.total_pages,
          totalItems: meta.total_data,
          itemsPerPage: meta.total_per_page,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={{
          icon: UserCheck,
          title: "Belum Ada Member",
          description: "Belum ada catatan data member terdaftar.",
        }}
      />

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Member Detail Profile</h2>
            <div className="space-y-2 text-xs text-slate-300">
              <div><span className="text-slate-500">Name:</span> {selectedCustomer.name}</div>
              <div><span className="text-slate-500">Card Number:</span> <span className="font-mono text-emerald-400 font-bold">{selectedCustomer.card_number}</span></div>
              <div><span className="text-slate-500">Phone:</span> {selectedCustomer.phone}</div>
              <div><span className="text-slate-500">Current Balance:</span> <span className="font-mono text-cyan-400 font-bold">Rp {selectedCustomer.balance.toLocaleString()}</span></div>
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={() => setSelectedCustomer(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
