"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, Receipt, Download, Eye, Loader2 } from "lucide-react";
import { transactionsService } from "@/services/transactions.service";
import { TransactionItem, PaginationMeta, DetailTransactionResponse } from "@/types/api";
import { TableEmptyState } from "@/components/TableEmptyState";

export default function TransactionsPage() {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, total_data: 0, total_pages: 1, total_per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedTx, setSelectedTx] = useState<DetailTransactionResponse | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionsService.getList({ page, limit: 10, search });
      setItems(res.items || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleExport = async () => {
    try {
      const csvData = await transactionsService.getExport({ search });
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${Date.now()}.csv`;
      a.click();
    } catch (err) {
      console.error("Export transactions failed", err);
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const detail = await transactionsService.getDetail(id);
      setSelectedTx(detail);
    } catch (err) {
      console.error("Failed to fetch transaction detail", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-400" />
            Parking Transactions Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time check-in / check-out history, plate numbers, and amounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={fetchTransactions} className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search plate, customer, card number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Plate No</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Vehicle Category</th>
                <th className="p-3">Check-In</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Amount</th>
                <th className="p-3 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500 mb-2" /> Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <TableEmptyState
                  colSpan={7}
                  icon={Receipt}
                  title="Belum Ada Transaksi Parkir"
                  description="Belum ada catatan riwayat transaksi kendaraan parkir."
                  searchTerm={search}
                  onClearSearch={() => setSearch("")}
                />
              ) : (
                items.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold text-amber-400">{t.vehicle_plate}</td>
                    <td className="p-3 font-semibold text-white">{t.customer_name}</td>
                    <td className="p-3 text-slate-400">{t.vehicle_type_name}</td>
                    <td className="p-3 text-slate-400">{new Date(t.check_in_at).toLocaleString()}</td>
                    <td className="p-3 font-mono">{t.duration_minutes} mins</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">Rp {t.amount.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleViewDetail(t.id)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Transaction Audit Record</h2>
            <div className="space-y-2 text-xs text-slate-300">
              <div><span className="text-slate-500">Plate Number:</span> <span className="font-mono text-amber-400 font-bold">{selectedTx.vehicle_plate}</span></div>
              <div><span className="text-slate-500">Customer:</span> {selectedTx.customer_name}</div>
              <div><span className="text-slate-500">Gate In:</span> {selectedTx.gate_in || "-"} | <span className="text-slate-500">Gate Out:</span> {selectedTx.gate_out || "-"}</div>
              <div><span className="text-slate-500">Total Amount:</span> <span className="font-mono text-emerald-400 font-bold">Rp {selectedTx.amount.toLocaleString()}</span></div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedTx(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
