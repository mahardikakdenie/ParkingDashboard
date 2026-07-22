"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, Receipt, Download, Eye } from "lucide-react";
import { transactionsService } from "@/services/transactions.service";
import { TransactionItem, PaginationMeta, DetailTransactionResponse } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

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

  const columns: Column<TransactionItem>[] = [
    {
      key: "vehicle_plate",
      header: "Plate No",
      render: (t) => <span className="font-mono font-bold text-amber-400">{t.vehicle_plate}</span>,
    },
    {
      key: "customer_name",
      header: "Customer",
      render: (t) => <span className="font-semibold text-white">{t.customer_name}</span>,
    },
    {
      key: "vehicle_type_name",
      header: "Vehicle Category",
      render: (t) => <span className="text-slate-400">{t.vehicle_type_name}</span>,
    },
    {
      key: "check_in_at",
      header: "Check-In",
      render: (t) => <span className="text-slate-400">{new Date(t.check_in_at).toLocaleString()}</span>,
    },
    {
      key: "duration_minutes",
      header: "Duration",
      render: (t) => <span className="font-mono text-slate-300">{t.duration_minutes} mins</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (t) => <span className="font-mono text-emerald-400 font-bold">Rp {t.amount.toLocaleString()}</span>,
    },
    {
      key: "actions",
      header: "Detail",
      align: "right",
      render: (t) => (
        <button onClick={() => handleViewDetail(t.id)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
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
            <Receipt className="w-6 h-6 text-purple-400" />
            Parking Transactions Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time check-in / check-out history, plate numbers, and amounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={fetchTransactions} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        accentColor="purple"
        search={{
          value: search,
          onChange: (val) => { setSearch(val); setPage(1); },
          placeholder: "Search plate, customer, card number...",
        }}
        pagination={{
          currentPage: meta.page,
          totalPages: meta.total_pages,
          totalItems: meta.total_data,
          itemsPerPage: meta.total_per_page,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={{
          icon: Receipt,
          title: "Belum Ada Transaksi Parkir",
          description: "Belum ada catatan riwayat transaksi kendaraan parkir.",
        }}
      />

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
            <div className="pt-4 flex justify-end">
              <button onClick={() => setSelectedTx(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
