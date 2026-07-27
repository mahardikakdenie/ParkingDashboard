"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Code2,
  Zap
} from "lucide-react";
import { paymentGatewayService } from "@/services/payment-gateway.service";

const PAYLOAD_PRESETS: Record<string, any> = {
  midtrans_settlement: {
    transaction_status: "settlement",
    order_id: "ORDER-PARK-10029",
    gross_amount: "15000.00",
    payment_type: "qris",
    transaction_time: "2026-07-27 12:00:00",
    fraud_status: "accept"
  },
  xendit_paid: {
    event: "invoice.paid",
    id: "60c72b2f9f1b2c0015f8a001",
    external_id: "INV-PARK-9901",
    amount: 25000,
    status: "PAID",
    paid_at: "2026-07-27T12:05:00.000Z"
  },
  qris_success: {
    status: "SUCCESS",
    qr_id: "QRIS-88201",
    reference_id: "REF-771829",
    amount: 10000,
    timestamp: "2026-07-27T12:10:00Z"
  }
};

export default function PaymentGatewayPage() {
  const [provider, setProvider] = useState<string>("midtrans");
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(PAYLOAD_PRESETS.midtrans_settlement, null, 2)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [responseLog, setResponseLog] = useState<any>(null);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  const handleApplyPreset = (presetKey: string) => {
    if (presetKey.startsWith("midtrans")) setProvider("midtrans");
    if (presetKey.startsWith("xendit")) setProvider("xendit");
    if (presetKey.startsWith("qris")) setProvider("qris");
    setPayloadText(JSON.stringify(PAYLOAD_PRESETS[presetKey], null, 2));
  };

  const handleSendWebhook = async () => {
    setLoading(true);
    setResponseLog(null);
    setErrorLog(null);

    let parsedPayload: Record<string, any>;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (err: any) {
      setErrorLog(`Invalid JSON Payload syntax: ${err.message}`);
      setLoading(false);
      return;
    }

    try {
      const res = await paymentGatewayService.triggerWebhook(provider, parsedPayload);
      setResponseLog(res);
    } catch (err: any) {
      setErrorLog(err?.message || "Failed to trigger payment gateway webhook endpoint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-400" />
          <span>Payment Gateway Webhook Simulator</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Test and trigger payment gateway webhooks (`/api/v1/payment-gateway/webhooks/{`{provider}`}`) for automated transaction reconciliation.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Form */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Webhook Parameters</span>
            </h2>

            {/* Presets */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1">Presets:</span>
              <button
                onClick={() => handleApplyPreset("midtrans_settlement")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors"
              >
                Midtrans
              </button>
              <button
                onClick={() => handleApplyPreset("xendit_paid")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors"
              >
                Xendit
              </button>
              <button
                onClick={() => handleApplyPreset("qris_success")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg transition-colors"
              >
                QRIS
              </button>
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Gateway Provider Name
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. midtrans, xendit, qris"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* JSON Payload Editor */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 items-center justify-between">
              <span>JSON Body Payload</span>
              <span className="text-[10px] text-slate-500 font-mono">application/json</span>
            </label>
            <textarea
              rows={12}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-3.5 outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <button
            onClick={handleSendWebhook}
            disabled={loading || !provider.trim()}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending Webhook Request...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post Webhook Event</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Execution Output Console */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Response Console</span>
            </h2>
            {responseLog && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>200 OK</span>
              </span>
            )}
            {errorLog && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                <span>Failed</span>
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-auto min-h-75">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Executing endpoint `/api/v1/payment-gateway/webhooks/{provider}`...</span>
              </div>
            ) : errorLog ? (
              <div className="text-red-400 space-y-2">
                <p className="font-bold">Error Output:</p>
                <pre className="whitespace-pre-wrap">{errorLog}</pre>
              </div>
            ) : responseLog ? (
              <div className="text-emerald-400 space-y-2">
                <p className="font-bold text-slate-300">Server Response:</p>
                <pre className="text-slate-200 whitespace-pre-wrap">{JSON.stringify(responseLog, null, 2)}</pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                <Zap className="w-8 h-8 opacity-30" />
                <span>Ready. Click "Post Webhook Event" to trigger simulation.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
