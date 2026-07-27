"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  Wallet,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Zap,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Clock
} from "lucide-react";
import { topupsService } from "@/services/topups.service";
import { customersService } from "@/services/customers.service";
import { paymentGatewayService } from "@/services/payment-gateway.service";
import { TopupItem, CustomerItem, TopupMethod, CreateTopupResponse, TopupMetadata } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

const QUICK_AMOUNTS = [25000, 50000, 100000, 250000, 500000];

export default function TopupPage() {
  const [items, setItems] = useState<TopupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Topup Creation Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [formData, setFormData] = useState<{
    customer_id: string;
    amount: number;
    method: TopupMethod;
    notes: string;
  }>({
    customer_id: "",
    amount: 50000,
    method: "qris",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Midtrans Payment Gateway Modal State
  const [activePaymentTopup, setActivePaymentTopup] = useState<{
    topupId: string;
    orderId: string;
    transactionId?: string;
    customerName: string;
    amount: number;
    method: TopupMethod;
    metadata?: TopupMetadata;
  } | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<"qris" | "bca_va" | "mandiri_va">("qris");
  const [isProcessingWebhook, setIsProcessingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedQrString, setCopiedQrString] = useState(false);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

  const fetchTopups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await topupsService.getList({ page: 1, limit: 50, search });
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
    setError(null);
    try {
      const res = await customersService.getList({ page: 1, limit: 100 });
      const customerList = res.items || [];
      setCustomers(customerList);
      if (customerList.length > 0) {
        setFormData((prev) => ({ ...prev, customer_id: customerList[0].id }));
      }
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const selectedCustomer = customers.find((c) => c.id === formData.customer_id);
      const res: CreateTopupResponse = await topupsService.create(formData);

      const topupId = res?.id || `TOP-${Date.now().toString().slice(-6)}`;
      const orderId = res?.metadata?.order_id || topupId;
      const transactionId = res?.metadata?.transaction_id;

      setIsModalOpen(false);
      fetchTopups();

      // Open Midtrans Payment Modal with exact backend response metadata
      if (["qris", "va", "transfer"].includes(formData.method)) {
        setActivePaymentTopup({
          topupId,
          orderId,
          transactionId,
          customerName: selectedCustomer?.name || "Valued Member",
          amount: res?.amount || formData.amount,
          method: formData.method,
          metadata: res?.metadata,
        });
        setWebhookResult(null);
      }
    } catch (err: any) {
      console.error("Topup submission failed", err);
      setError(err?.message || "Failed to process topup deposit");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayWebhookClick = async (item: TopupItem) => {
    setLoadingRowId(item.id);
    try {
      // 1. Fetch complete detail of topup to get customer_id
      const detail = await topupsService.getDetail(item.id);

      // 2. Trigger POST /topups to create fresh Midtrans transaction
      const res: CreateTopupResponse = await topupsService.create({
        customer_id: detail.customer_id,
        amount: detail.amount,
        method: (detail.method as TopupMethod) || "qris",
        notes: detail.notes || `Re-initiated topup for order reference ${detail.reference}`,
      });

      const topupId = res?.id || item.id;
      const orderId = res?.metadata?.order_id || topupId;
      const transactionId = res?.metadata?.transaction_id;

      // Refresh table to list the newly triggered topup record
      fetchTopups();

      // 3. Open checkout modal with fresh payment gateway actions/metadata
      setActivePaymentTopup({
        topupId,
        orderId,
        transactionId,
        customerName: detail.customer_name || "Valued Member",
        amount: res?.amount || item.amount,
        method: (detail.method as TopupMethod) || "qris",
        metadata: res?.metadata,
      });
      setWebhookResult(null);
    } catch (err: any) {
      console.error("Failed to re-trigger topup payment gateway", err);
      alert(err?.message || "Failed to trigger payment gateway for this topup record.");
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleTriggerMidtransWebhook = async (status: "settlement" | "expire" | "cancel" = "settlement") => {
    if (!activePaymentTopup) return;
    setIsProcessingWebhook(true);
    setWebhookResult(null);

    const midtransPayload = {
      transaction_status: status,
      order_id: activePaymentTopup.orderId,
      gross_amount: activePaymentTopup.metadata?.gross_amount || activePaymentTopup.amount.toFixed(2),
      payment_type: selectedChannel === "qris" ? "qris" : "bank_transfer",
      transaction_time: new Date().toISOString().replace("T", " ").substring(0, 19),
      fraud_status: "accept",
      status_code: status === "settlement" ? "200" : "407",
      transaction_id: activePaymentTopup.transactionId || `MIDTRANS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      signature_key: "staging_simulated_signature_hash"
    };

    try {
      const res = await paymentGatewayService.triggerWebhook("midtrans", midtransPayload);
      setWebhookResult({
        success: true,
        message: `Midtrans payment webhook successfully processed (${status.toUpperCase()})`,
        data: res,
      });
      fetchTopups();
    } catch (err: any) {
      setWebhookResult({
        success: false,
        message: err?.message || "Failed to post Midtrans payment webhook notification.",
      });
    } finally {
      setIsProcessingWebhook(false);
    }
  };

  const handleCopyVa = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const handleCopyQrString = (qrStr: string) => {
    navigator.clipboard.writeText(qrStr);
    setCopiedQrString(true);
    setTimeout(() => setCopiedQrString(false), 2000);
  };

  // Extract Midtrans QR Code Image URL from actions list
  const getQrCodeImageUrl = (): string | null => {
    if (!activePaymentTopup?.metadata?.actions) return null;
    const qrAction = activePaymentTopup.metadata.actions.find(
      (a) => a.name === "generate-qr-code" || a.name === "generate-qr-code-v2"
    );
    return qrAction ? qrAction.url : null;
  };

  // Stats Calculations
  const totalVolume = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalCount = items.length;
  const midtransCount = items.filter((i) => ["qris", "va", "transfer"].includes((i.method || "").toLowerCase())).length;

  const columns: Column<TopupItem>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (t) => (
        <span className="font-mono text-emerald-400 font-bold text-xs flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-500" />
          {t.reference || t.id}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer Member",
      render: (t) => (
        <div>
          <p className="font-semibold text-white text-xs">{t.customer_name || "Member User"}</p>
          <p className="text-[10px] text-slate-400">ID: {t.id ? t.id.slice(0, 8) : "N/A"}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (t) => (
        <span className="font-mono text-cyan-400 font-bold text-xs">
          Rp {t.amount.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "method",
      header: "Payment Method",
      render: (t) => {
        const m = (t.method || "").toLowerCase();
        const badgeStyles: Record<string, string> = {
          qris: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          va: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          transfer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          cash: "bg-slate-800 text-slate-300 border-slate-700",
        };
        const labelMap: Record<string, string> = {
          qris: "MIDTRANS QRIS",
          va: "MIDTRANS VA",
          transfer: "TRANSFER",
          cash: "CASH",
        };
        return (
          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${badgeStyles[m] || badgeStyles.cash}`}>
            {labelMap[m] || t.method}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Date & Time",
      render: (t) => (
        <span className="text-slate-400 text-xs">
          {new Date(t.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Gateway Link",
      render: (t) => {
        const isOnline = ["qris", "va", "transfer"].includes((t.method || "").toLowerCase());
        const isRowLoading = loadingRowId === t.id;
        return isOnline ? (
          <button
            onClick={() => handlePayWebhookClick(t)}
            disabled={loadingRowId !== null}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {isRowLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <CreditCard className="w-3 h-3" />
            )}
            <span>{isRowLoading ? "Hitting API..." : "Pay / Webhook"}</span>
          </button>
        ) : (
          <span className="text-[10px] text-slate-500 italic">Direct Cash</span>
        );
      },
    },
  ];

  const qrImageUrl = getQrCodeImageUrl();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Topup & Midtrans Gateway Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deposit member balances using Midtrans Staging Payment Gateway and instant Webhook reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTopups}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Topup Deposit</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Topup Volume</p>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
              Rp {totalVolume.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Transactions</p>
            <p className="text-xl font-bold text-slate-100 font-mono mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Midtrans Gateway Transactions</p>
            <p className="text-xl font-bold text-purple-400 font-mono mt-1">{midtransCount}</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Data Table */}
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

      {/* NEW TOPUP FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>New Topup Deposit</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Select Customer Member
                </label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — Card: {c.card_number} (Saldo: Rp {c.balance?.toLocaleString("id-ID") || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Topup Amount (Rp)
                </label>
                <input
                  required
                  type="number"
                  min={10000}
                  step={5000}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />

                {/* Quick Amount Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFormData({ ...formData, amount: amt })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors ${formData.amount === amt
                          ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/50"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                    >
                      +{amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Payment Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as TopupMethod })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="qris">Midtrans QRIS Dynamic QR</option>
                  <option value="va">Midtrans Virtual Account (BCA / Mandiri)</option>
                  <option value="transfer">Direct Bank Transfer</option>
                  <option value="cash">Direct Cash Deposit (Tunai Kasir)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Notes / Remark (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Deposit notes or reference detail..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-emerald-950/40"
                >
                  {submitting ? "Processing..." : "Create Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MIDTRANS CHECKOUT & WEBHOOK MODAL */}
      {activePaymentTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Midtrans Payment Gateway</h2>
                  <p className="text-[11px] text-slate-400">Sandbox / Staging Checkout & Webhook Integration</p>
                </div>
              </div>
              <button
                onClick={() => setActivePaymentTopup(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Order Summary Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Order ID:</span>
                <span className="text-emerald-400 font-bold">{activePaymentTopup.orderId}</span>
              </div>
              {activePaymentTopup.transactionId && (
                <div className="flex justify-between text-slate-400">
                  <span>Transaction ID:</span>
                  <span className="text-slate-300 text-[11px]">{activePaymentTopup.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Customer Name:</span>
                <span className="text-slate-200">{activePaymentTopup.customerName}</span>
              </div>
              {activePaymentTopup.metadata?.acquirer && (
                <div className="flex justify-between text-slate-400">
                  <span>Acquirer Provider:</span>
                  <span className="text-purple-400 font-bold uppercase">{activePaymentTopup.metadata.acquirer}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2 text-sm">
                <span className="font-sans font-semibold text-slate-300">Total Payment:</span>
                <span className="text-cyan-400 font-bold">
                  Rp {activePaymentTopup.amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Expiry Badge if available */}
            {activePaymentTopup.metadata?.expiry_time && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl text-xs text-amber-400 font-mono animate-pulse">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Expiry Time:
                </span>
                <span>{activePaymentTopup.metadata.expiry_time}</span>
              </div>
            )}

            {/* Payment Channel Selection */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Select Staging Channel:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel("qris")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs ${selectedChannel === "qris"
                      ? "bg-purple-500/10 border-purple-500/50 text-purple-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                >
                  <QrCode className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-[11px]">QRIS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel("bca_va")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs ${selectedChannel === "bca_va"
                      ? "bg-blue-500/10 border-blue-500/50 text-blue-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                >
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-[11px]">BCA VA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel("mandiri_va")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs ${selectedChannel === "mandiri_va"
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-[11px]">Mandiri VA</span>
                </button>
              </div>
            </div>

            {/* Channel Interactive Instructions */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
              {selectedChannel === "qris" ? (
                <>
                  <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-700 flex flex-col items-center">
                    {qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt="Midtrans QR Code"
                        className="w-44 h-44 object-contain"
                      />
                    ) : (
                      /* Simulated Dynamic QR Code SVG Fallback */
                      <svg className="w-32 h-32 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="10" y="10" width="25" height="25" />
                        <rect x="15" y="15" width="15" height="15" fill="white" />
                        <rect x="18" y="18" width="9" height="9" />

                        <rect x="65" y="10" width="25" height="25" />
                        <rect x="70" y="15" width="15" height="15" fill="white" />
                        <rect x="73" y="18" width="9" height="9" />

                        <rect x="10" y="65" width="25" height="25" />
                        <rect x="15" y="70" width="15" height="15" fill="white" />
                        <rect x="18" y="73" width="9" height="9" />

                        <rect x="40" y="15" width="10" height="10" />
                        <rect x="45" y="30" width="15" height="15" />
                        <rect x="65" y="45" width="10" height="20" />
                        <rect x="40" y="65" width="20" height="10" />
                        <rect x="70" y="70" width="15" height="15" />
                      </svg>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Scan with GoPay, OVO, ShopeePay, or any Mobile Banking QRIS.
                  </p>

                  {/* QR String Copy Option if available */}
                  {activePaymentTopup.metadata?.qr_string && (
                    <div className="w-full pt-1 border-t border-slate-800">
                      <button
                        onClick={() => handleCopyQrString(activePaymentTopup.metadata!.qr_string!)}
                        className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-mono flex items-center justify-between border border-slate-800"
                      >
                        <span className="truncate mr-2 max-w-65 text-slate-400">
                          {activePaymentTopup.metadata.qr_string}
                        </span>
                        <span className="shrink-0 flex items-center gap-1 text-purple-400 font-semibold">
                          {copiedQrString ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedQrString ? "Copied" : "Copy QR String"}
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full space-y-2">
                  <p className="text-xs text-slate-400 text-left">
                    {selectedChannel === "bca_va" ? "BCA Virtual Account Number:" : "Mandiri Bill Payment Code:"}
                  </p>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
                    <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">
                      {selectedChannel === "bca_va" ? "88012 99018 27101" : "70012 00192 88102"}
                    </span>
                    <button
                      onClick={() =>
                        handleCopyVa(selectedChannel === "bca_va" ? "880129901827101" : "700120019288102")
                      }
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedVa ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Webhook Execution Result Feedback */}
            {webhookResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${webhookResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
              >
                {webhookResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{webhookResult.message}</p>
                  {webhookResult.data && (
                    <p className="text-[10px] opacity-80 mt-0.5 font-mono">
                      Processed at: {webhookResult.data.processed_at || new Date().toISOString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions: Trigger Webhook Endpoint */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isProcessingWebhook}
                onClick={() => handleTriggerMidtransWebhook("settlement")}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                {isProcessingWebhook ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Midtrans Webhook Endpoint...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Simulate Midtrans Payment Settlement (Webhook)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessingWebhook}
                  onClick={() => handleTriggerMidtransWebhook("expire")}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-xl transition-colors"
                >
                  Simulate Expire
                </button>
                <button
                  type="button"
                  onClick={() => setActivePaymentTopup(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-xl transition-colors"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
