"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, Wallet } from "lucide-react";
import { topupsService } from "@/services/topups.service";
import { customersService } from "@/services/customers.service";
import { TopupItem, CustomerItem } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

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

  const columns: Column<TopupItem>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (t) => <span className="font-mono text-emerald-400 font-bold">{t.reference || t.id}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (t) => <span className="font-semibold text-white">{t.customer_name}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (t) => <span className="font-mono text-cyan-400 font-bold">Rp {t.amount.toLocaleString()}</span>,
    },
    {
      key: "method",
      header: "Method",
      render: (t) => <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">{t.method}</span>,
    },
    {
      key: "created_at",
      header: "Date",
      render: (t) => <span className="text-slate-400">{new Date(t.created_at).toLocaleString()}</span>,
    },
  ];

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
          <button onClick={handleOpenModal} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Topup Deposit
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
          onChange: (val) => setSearch(val),
          placeholder: "Search customer name or reference...",
        }}
        emptyState={{
          icon: Wallet,
          title: "Belum Ada Riwayat Topup",
          description: "Belum ada transaksi deposit saldo member yang tercatat.",
          actionLabel: "Deposit Saldo Baru",
          onAction: () => handleOpenModal(),
        }}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">New Topup Deposit</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Customer Member</label>
                <select value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.card_number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Topup Amount (Rp)</label>
                <input required type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Payment Method</label>
                <select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                  <option value="CASH">CASH</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="EWALLET">E-WALLET</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Notes / Description</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" rows={2} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">{submitting ? "Submitting..." : "Submit Topup"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
