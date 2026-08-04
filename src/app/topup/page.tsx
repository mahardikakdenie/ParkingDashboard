"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  Wallet,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Zap,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Clock,
  Filter,
  Calendar,
  ArrowUpDown,
  X,
  RotateCcw,
  Search,
  Radio
} from "lucide-react";
import { topupsService } from "@/services/topups.service";
import { customersService } from "@/services/customers.service";
import { paymentGatewayService } from "@/services/payment-gateway.service";
import {
  TopupItem,
  CustomerItem,
  TopupMethod,
  CreateTopupResponse,
  TopupMetadata,
  PaginationMeta,
  CreateTopupDto,
  ListTopupQueryParams
} from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";
import { RealLifeTopupSimulationModal } from "./components/RealLifeTopupSimulationModal";

const QUICK_AMOUNTS = [25000, 50000, 100000, 250000, 500000];

export default function TopupPage() {
  const [items, setItems] = useState<TopupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    total_data: 0,
    total_pages: 1,
    total_per_page: 10,
  });

  // Filter States (Integrated with OpenAPI TopupController_getList_v1)
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("created_at");
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  // Topup Creation Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [formData, setFormData] = useState<{
    customer_id: string;
    amount: number;
    method: TopupMethod;
    notes: string;
    bank: string;
  }>({
    customer_id: "",
    amount: 50000,
    method: "qris",
    notes: "",
    bank: "bca",
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
  const [isProcessingWebhook, setIsProcessingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedQrString, setCopiedQrString] = useState(false);
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(0);
  const [copiedActionUrl, setCopiedActionUrl] = useState<string | null>(null);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

  const fetchTopups = useCallback(async () => {
    setLoading(true);
    try {
      const params: ListTopupQueryParams = {
        page,
        limit: meta.total_per_page || 10,
        search: search.trim() || undefined,
        method: selectedMethod || undefined,
        status: selectedStatus || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        orderBy: orderBy || undefined,
        sort: sort || undefined,
      };
      const res = await topupsService.getList(params);
      setItems(res.items || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error("Failed to fetch topups", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedMethod, selectedStatus, startDate, endDate, orderBy, sort, meta.total_per_page]);

  useEffect(() => {
    fetchTopups();
  }, [fetchTopups]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedMethod("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    setOrderBy("created_at");
    setSort("desc");
    setPage(1);
  };

  const handleQuickDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      // Today
      const todayStr = start.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else {
      start.setDate(start.getDate() - days);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
    }
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || selectedMethod || selectedStatus || startDate || endDate || orderBy !== "created_at" || sort !== "desc"
  );

  const activeFilterCount = [
    Boolean(search),
    Boolean(selectedMethod),
    Boolean(selectedStatus),
    Boolean(startDate || endDate),
    orderBy !== "created_at" || sort !== "desc"
  ].filter(Boolean).length;

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
      const payload: CreateTopupDto = {
        customer_id: formData.customer_id,
        amount: formData.amount,
        method: formData.method,
        notes: formData.notes,
        ...(formData.method === "va" ? { bank: formData.bank || "bca" } : {}),
      };
      const res: CreateTopupResponse = await topupsService.create(payload);

      const topupId = res?.id || `TOP-${Date.now().toString().slice(-6)}`;
      const orderId = res?.metadata?.order_id || topupId;
      const transactionId = res?.metadata?.transaction_id;

      setIsModalOpen(false);
      fetchTopups();

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

  const handleSimulationSubmit = async (payload: CreateTopupDto) => {
    try {
      const res: CreateTopupResponse = await topupsService.create(payload);
      const topupId = res?.id || `TOP-${Date.now().toString().slice(-6)}`;
      const orderId = res?.metadata?.order_id || topupId;
      const transactionId = res?.metadata?.transaction_id;

      fetchTopups();

      if (["qris", "va", "transfer"].includes(payload.method || "")) {
        setActivePaymentTopup({
          topupId,
          orderId,
          transactionId,
          customerName: "John Doe",
          amount: res?.amount || payload.amount,
          method: payload.method || "qris",
          metadata: res?.metadata,
        });
        setWebhookResult(null);
      }
    } catch (err: any) {
      console.error("Simulation topup submission failed", err);
      throw err;
    }
  };

  const handlePayWebhookClick = async (item: TopupItem) => {
    setLoadingRowId(item.id);
    try {
      // Fetch existing topup detail from GET /api/v1/topups/detail/:id
      const detail = await topupsService.getDetail(item.id);

      // Extract metadata from detail response (support both meta and metadata keys)
      const metadata: TopupMetadata | undefined = detail.meta || (detail as any).metadata;
      const topupMethod = (detail.method as TopupMethod) || "qris";

      const topupId = detail.id || item.id;
      const orderId = metadata?.order_id || detail.reference || topupId;
      const transactionId = metadata?.transaction_id;

      // Open checkout inspection modal with existing record data
      setActivePaymentTopup({
        topupId,
        orderId,
        transactionId,
        customerName: detail.customer_name || "Valued Member",
        amount: detail.amount || item.amount,
        method: topupMethod,
        metadata: metadata,
      });
      setWebhookResult(null);
    } catch (err: any) {
      console.error("Failed to fetch topup detail", err);
      alert(err?.message || "Failed to load payment detail for this topup record.");
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
      payment_type: activePaymentTopup.method === "qris" ? "qris" : "bank_transfer",
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

  const handleCopyActionUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedActionUrl(url);
    setTimeout(() => setCopiedActionUrl(null), 2000);
  };

  const getQrCodeImageUrl = (): string | null => {
    const actions = activePaymentTopup?.metadata?.actions;
    if (!actions || actions.length === 0) return null;
    if (actions[selectedActionIndex] && actions[selectedActionIndex].url) {
      return actions[selectedActionIndex].url;
    }
    const qrAction = actions.find(
      (a) => a.name === "generate-qr-code" || a.name === "generate-qr-code-v2"
    );
    return qrAction ? qrAction.url : actions[0].url;
  };

  // Overview Stats
  const successItems = items.filter((i) => (i.status || "").toLowerCase() === "success");
  const totalVolume = successItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalCount = items.length;
  const expiredCount = items.filter((i) => (i.status || "").toLowerCase() === "expired").length;

  const columns: Column<TopupItem>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (t) => (
        t.reference ? (
          <span className="font-mono text-emerald-400 font-bold text-xs flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-500 shrink-0" />
            {t.reference}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-800/60 border border-slate-700/50 italic">
            Direct / No Ref
          </span>
        )
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
      key: "status",
      header: "Status",
      render: (t) => {
        const s = (t.status || "pending").toLowerCase();
        if (s === "success") {
          return (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Success
            </span>
          );
        }
        if (s === "expired") {
          return (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
              <Clock className="w-3 h-3 text-amber-400" />
              Expired
            </span>
          );
        }
        if (s === "failed" || s === "canceled") {
          return (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
              <XCircle className="w-3 h-3 text-rose-400" />
              {s}
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
            Pending
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
            onClick={() => setIsSimulationModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Radio className="w-4 h-4 animate-pulse text-cyan-300" />
            <span>Simulasi Topup In Real life</span>
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

      {/* UI FILTER CONTAINER (OpenAPI TopupController_getList_v1 Integration) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Filter & Sort Topup Transactions</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                    {activeFilterCount} Active
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Filter by payment method, transaction status, date range, or sort field.
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Search Query */}
          <div className="space-y-1 xl:col-span-2">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Search className="w-3 h-3" /> Search Text
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Customer name or reference..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Method
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Payment Methods</option>
              <option value="qris">MIDTRANS QRIS</option>
              <option value="va">MIDTRANS VA</option>
              <option value="transfer">BANK TRANSFER</option>
              <option value="cash">CASH DEPOSIT</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Order By */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Order By
            </label>
            <select
              value={orderBy}
              onChange={(e) => {
                setOrderBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="created_at">Created Date</option>
              <option value="amount">Amount</option>
              <option value="customer_name">Customer Name</option>
              <option value="status">Status</option>
              <option value="reference">Reference</option>
              <option value="method">Method</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Direction
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as "asc" | "desc");
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="desc">Descending (Newest / High)</option>
              <option value="asc">Ascending (Oldest / Low)</option>
            </select>
          </div>
        </div>

        {/* Date Range Sub-Row & Quick Presets */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-400">Date Range:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-500 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick Date Range Preset Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono mr-1">Quick:</span>
            <button
              onClick={() => handleQuickDatePreset(0)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickDatePreset(7)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleQuickDatePreset(30)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors"
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-500 mr-1">Active Chips:</span>
            {search && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] flex items-center gap-1.5">
                <span>Search: &quot;{search}&quot;</span>
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSearch("")} />
              </span>
            )}
            {selectedMethod && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] flex items-center gap-1.5 uppercase font-mono">
                <span>Method: {selectedMethod}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedMethod("")} />
              </span>
            )}
            {selectedStatus && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] flex items-center gap-1.5 uppercase font-mono">
                <span>Status: {selectedStatus}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedStatus("")} />
              </span>
            )}
            {(startDate || endDate) && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] flex items-center gap-1.5 font-mono">
                <span>Date: {startDate || "Start"} → {endDate || "Now"}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        accentColor="emerald"
        pagination={{
          currentPage: page,
          totalPages: meta.total_pages || 1,
          totalItems: meta.total_data || items.length,
          itemsPerPage: meta.total_per_page || 10,
          onPageChange: (newPage) => setPage(newPage),
        }}
        emptyState={{
          icon: Wallet,
          title: "Belum Ada Data Topup",
          description: hasActiveFilters
            ? "Tidak ada data topup yang cocok dengan filter yang dipilih."
            : "Belum ada transaksi deposit saldo member yang tercatat.",
          actionLabel: hasActiveFilters ? "Reset Filter" : "Deposit Saldo Baru",
          onAction: () => (hasActiveFilters ? handleResetFilters() : handleOpenModal()),
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
                {formData.method === "va" && (
                  <div className="mt-2">
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">Select Bank</label>
                    <select
                      value={formData.bank}
                      onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="bca">BCA</option>
                      <option value="mandiri">Mandiri</option>
                      <option value="bni">BNI</option>
                      <option value="bri">BRI</option>
                      <option value="permata">Permata</option>
                    </select>
                  </div>
                )}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Midtrans Payment Gateway</h2>
                  <p className="text-[11px] text-slate-400">Sandbox / Staging Checkout & Metadata Inspector</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivePaymentTopup(null);
                  setSelectedActionIndex(0);
                }}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Order ID:</span>
                <span className="text-emerald-400 font-bold">{activePaymentTopup.orderId}</span>
              </div>

              {activePaymentTopup.transactionId && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Transaction ID:</span>
                  <span className="text-slate-300 text-[11px]">{activePaymentTopup.transactionId}</span>
                </div>
              )}

              {activePaymentTopup.metadata?.merchant_id && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Merchant ID:</span>
                  <span className="text-blue-400 font-semibold">{activePaymentTopup.metadata.merchant_id}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-400">
                <span>Customer Name:</span>
                <span className="text-slate-200">{activePaymentTopup.customerName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                {activePaymentTopup.metadata?.payment_type && (
                  <div className="flex flex-col">
                    <span className="text-slate-500">Payment Type:</span>
                    <span className="text-purple-400 font-bold uppercase">
                      {activePaymentTopup.metadata.payment_type}
                    </span>
                  </div>
                )}
                {activePaymentTopup.metadata?.acquirer && (
                  <div className="flex flex-col">
                    <span className="text-slate-500">Acquirer Provider:</span>
                    <span className="text-pink-400 font-bold uppercase">
                      {activePaymentTopup.metadata.acquirer}
                    </span>
                  </div>
                )}
                {activePaymentTopup.metadata?.status_code && (
                  <div className="flex flex-col">
                    <span className="text-slate-500">Status Code & Msg:</span>
                    <span className="text-amber-400 font-semibold">
                      {activePaymentTopup.metadata.status_code} ({activePaymentTopup.metadata.status_message || "OK"})
                    </span>
                  </div>
                )}
                {activePaymentTopup.metadata?.fraud_status && (
                  <div className="flex flex-col">
                    <span className="text-slate-500">Fraud Status:</span>
                    <span className="text-emerald-400 font-semibold uppercase">
                      {activePaymentTopup.metadata.fraud_status}
                    </span>
                  </div>
                )}
              </div>

              {activePaymentTopup.metadata?.transaction_time && (
                <div className="flex justify-between items-center text-slate-400 pt-1 text-[11px]">
                  <span>Transaction Time:</span>
                  <span className="text-slate-300">{activePaymentTopup.metadata.transaction_time}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2 text-sm">
                <span className="font-sans font-semibold text-slate-300">Total Gross Amount:</span>
                <span className="text-cyan-400 font-bold">
                  {activePaymentTopup.metadata?.currency || "IDR"} Rp{" "}
                  {activePaymentTopup.amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {activePaymentTopup.metadata?.expiry_time && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl text-xs text-amber-400 font-mono animate-pulse">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Expiry Time:
                </span>
                <span>{activePaymentTopup.metadata.expiry_time}</span>
              </div>
            )}

            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-300">
              <span className="font-medium">Active Payment Method:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {activePaymentTopup.method}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
              {activePaymentTopup.method === "qris" ? (
                <>
                  <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-700 flex flex-col items-center">
                    {qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt="Midtrans QR Code"
                        className="w-44 h-44 object-contain"
                      />
                    ) : (
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
                    {(activePaymentTopup.metadata?.acquirer || "").toLowerCase().includes("mandiri")
                      ? "Mandiri Bill Payment Code:"
                      : "BCA Virtual Account Number:"}
                  </p>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
                    <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">
                      {(activePaymentTopup.metadata?.acquirer || "").toLowerCase().includes("mandiri")
                        ? "70012 00192 88102"
                        : "88012 99018 27101"}
                    </span>
                    <button
                      onClick={() =>
                        handleCopyVa(
                          (activePaymentTopup.metadata?.acquirer || "").toLowerCase().includes("mandiri")
                            ? "700120019288102"
                            : "880129901827101"
                        )
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

            {activePaymentTopup.metadata?.actions && activePaymentTopup.metadata.actions.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Midtrans Action Endpoints ({activePaymentTopup.metadata.actions.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Looping metadata.actions[]</span>
                </div>

                <div className="space-y-2 pt-1">
                  {activePaymentTopup.metadata.actions.map((act, idx) => {
                    const isSelected = selectedActionIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border transition-all text-xs font-mono space-y-1.5 ${isSelected
                          ? "bg-purple-500/10 border-purple-500/40 text-purple-200"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {act.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-emerald-400">
                              {act.method}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedActionIndex(idx)}
                            className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold transition-colors ${isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              }`}
                          >
                            {isSelected ? "Active Preview" : "Select Preview"}
                          </button>
                        </div>

                        <div className="text-[10px] text-slate-400 break-all bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2">
                          <span className="truncate">{act.url}</span>
                          <div className="flex items-center gap-1 shrink-0 font-sans">
                            <a
                              href={act.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[10px] transition-colors"
                            >
                              Open URL
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyActionUrl(act.url)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 transition-colors"
                            >
                              {copiedActionUrl === act.url ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedActionUrl === act.url ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                  onClick={() => {
                    setActivePaymentTopup(null);
                    setSelectedActionIndex(0);
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-xl transition-colors"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REAL-LIFE NFC SIMULATION MODAL */}
      <RealLifeTopupSimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        onSubmitSimulation={handleSimulationSubmit}
      />
    </div>
  );
}
