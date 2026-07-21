"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, UserCheck, Download, Eye, Loader2 } from "lucide-react";
import { customersService } from "@/services/customers.service";
import { CustomerItem, PaginationMeta, DetailCustomerResponse } from "@/types/api";

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
          <button onClick={handleExport} className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={fetchCustomers} className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search card number, name, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Card Number</th>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" /> Loading...
                  </td>
                </tr>
              ) : items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono text-emerald-400">{c.card_number}</td>
                  <td className="p-3 font-semibold text-white">{c.name}</td>
                  <td className="p-3 text-slate-400">{c.phone}</td>
                  <td className="p-3 font-mono font-bold text-white">Rp {c.balance.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${c.status === 1 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {c.status_text || (c.status === 1 ? "Active" : "Blocked")}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleViewDetail(c.id)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Customer Detail</h2>
            <div className="space-y-2 text-xs text-slate-300">
              <div><span className="text-slate-500">Card Number:</span> <span className="font-mono text-emerald-400">{selectedCustomer.card_number}</span></div>
              <div><span className="text-slate-500">Name:</span> <span className="text-white font-semibold">{selectedCustomer.name}</span></div>
              <div><span className="text-slate-500">Email:</span> {selectedCustomer.email}</div>
              <div><span className="text-slate-500">Phone:</span> {selectedCustomer.phone}</div>
              <div><span className="text-slate-500">Balance:</span> <span className="font-mono text-emerald-400 font-bold">Rp {selectedCustomer.balance.toLocaleString()}</span></div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedCustomer(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
