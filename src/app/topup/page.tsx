"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Search, RefreshCw, Wallet, Loader2 } from "lucide-react";
import { topupsService } from "@/services/topups.service";
import { customersService } from "@/services/customers.service";
import { TopupItem, CustomerItem } from "@/types/api";
import { TableEmptyState } from "@/components/TableEmptyState";

export default function TopupPage() {
  const [items, setItems] = useState<TopupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [formData, setFormData] = useState({ customer_id: "", amount: 50000, method: "CASH", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchTopups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await topupsService.getList({ page: 1, limit: 20, search });
      setItems(res.items || []);
    } catch (err) {
      console.error("Failed to fetch topups", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTopups();
  }, [fetchTopups]);

  const handleOpenModal = async () => {
    try {
      const res = await customersService.getList({ page: 1, limit: 100 });
      setCustomers(res.items || []);
      if (res.items && res.items.length > 0) {
        setFormData((prev) => ({ ...prev, customer_id: res.items[0].id }));
      }
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await topupsService.create(formData);
      setIsModalOpen(false);
      fetchTopups();
    } catch (err) {
      console.error("Topup submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            Topup Balance Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manual and automated member card deposit records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTopups} className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={handleOpenModal} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Topup Deposit
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" /> Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  icon={Wallet}
                  title="Belum Ada Transaksi Top Up"
                  description="Belum ada riwayat saldo terisi atau deposit topup."
                  searchTerm={search}
                  onClearSearch={() => setSearch("")}
                  actionLabel="Topup Saldo"
                  onAction={() => setIsModalOpen(true)}
                />
              ) : (
                items.map((topup) => (
                  <tr key={topup.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-xs text-slate-400">{topup.reference}</td>
                    <td className="p-3 font-semibold text-white">{topup.customer_name}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">{topup.method}</span></td>
                    <td className="p-3 font-mono font-bold text-emerald-400">Rp {topup.amount.toLocaleString()}</td>
                    <td className="p-3 text-slate-500">{new Date(topup.created_at).toLocaleString()}</td>
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
            <h2 className="text-lg font-bold text-white">Deposit Topup Balance</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Select Customer</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.card_number})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Topup Amount (Rp)</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Payment Method</label>
                <select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl disabled:opacity-50">{submitting ? "Processing..." : "Deposit"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
