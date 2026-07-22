"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, CircleDollarSign, Edit } from "lucide-react";
import { parkingRatesService } from "@/services/parking-rates.service";
import { vehicleTypesService } from "@/services/vehicle-types.service";
import { ParkingRateItem, VehicleTypeOptionsResponse } from "@/types/api";
import { DataTable, Column } from "@/components/DataTable";

export default function ParkingRatesPage() {
  const [items, setItems] = useState<ParkingRateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeOptionsResponse[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ParkingRateItem | null>(null);
  const [formData, setFormData] = useState<{
    vehicle_type_id: string;
    rate_type: "flat" | "hourly" | "progressive";
    amount: number;
    additional_amount: number;
    grace_period_minutes: number;
    max_daily_amount: number;
    effective_date: string;
    status: number;
  }>({
    vehicle_type_id: "",
    rate_type: "flat",
    amount: 0,
    additional_amount: 0,
    grace_period_minutes: 15,
    max_daily_amount: 50000,
    effective_date: new Date().toISOString().split("T")[0],
    status: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const [ratesRes, vTypesRes] = await Promise.all([
        parkingRatesService.getList({ page: 1, limit: 50 }),
        vehicleTypesService.getOptions(),
      ]);
      setItems(ratesRes.items || []);
      setVehicleTypes(vTypesRes || []);
    } catch (err) {
      console.error("Failed to fetch rates", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleOpenModal = (item?: ParkingRateItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        vehicle_type_id: "",
        rate_type: (item.rate_type?.toLowerCase() as "flat" | "hourly" | "progressive") || "flat",
        amount: item.amount,
        additional_amount: item.additional_amount || 0,
        grace_period_minutes: item.grace_period_minutes || 15,
        max_daily_amount: item.max_daily_amount || 0,
        effective_date: item.effective_date ? item.effective_date.split("T")[0] : new Date().toISOString().split("T")[0],
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        vehicle_type_id: vehicleTypes[0]?.id || "",
        rate_type: "flat",
        amount: 5000,
        additional_amount: 2000,
        grace_period_minutes: 15,
        max_daily_amount: 50000,
        effective_date: new Date().toISOString().split("T")[0],
        status: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await parkingRatesService.update(editingItem.id, formData);
      } else {
        await parkingRatesService.create(formData);
      }
      setIsModalOpen(false);
      fetchRates();
    } catch (err) {
      console.error("Save parking rate failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<ParkingRateItem>[] = [
    {
      key: "vehicle_type",
      header: "Vehicle Category",
      render: (r) => <span className="font-semibold text-white">{r.vehicle_type_name || "All Vehicles"}</span>,
    },
    {
      key: "rate_type",
      header: "Rate Model",
      render: (r) => <span className="px-2 py-0.5 bg-slate-800 text-indigo-300 rounded font-mono text-[10px] border border-indigo-500/20 uppercase">{r.rate_type}</span>,
    },
    {
      key: "amount",
      header: "Base Amount",
      render: (r) => <span className="font-mono text-emerald-400 font-bold">Rp {r.amount.toLocaleString()}</span>,
    },
    {
      key: "additional_amount",
      header: "Hourly Rate",
      render: (r) => <span className="font-mono text-slate-300">Rp {(r.additional_amount || 0).toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${r.status === 1 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
          {r.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (r) => (
        <button onClick={() => handleOpenModal(r)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
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
            <CircleDollarSign className="w-6 h-6 text-emerald-400" />
            Parking Rates Setup
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure vehicle tariff rules, hourly add-ons, and grace periods.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchRates} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Tariff Rule
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        accentColor="emerald"
        emptyState={{
          icon: CircleDollarSign,
          title: "Belum Ada Tarif Parkir",
          description: "Belum ada aturan tarif parkir yang dikonfigurasi.",
          actionLabel: "Tambah Aturan Tarif",
          onAction: () => handleOpenModal(),
        }}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">{editingItem ? "Edit Parking Rate" : "Add Parking Rate"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {!editingItem && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Vehicle Type</label>
                  <select value={formData.vehicle_type_id} onChange={(e) => setFormData({ ...formData, vehicle_type_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                    {vehicleTypes.map((vt) => (
                      <option key={vt.id} value={vt.id}>{vt.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Rate Type</label>
                <select value={formData.rate_type} onChange={(e) => setFormData({ ...formData, rate_type: e.target.value as "flat" | "hourly" | "progressive" })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                  <option value="flat">FLAT</option>
                  <option value="hourly">HOURLY</option>
                  <option value="progressive">PROGRESSIVE</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Base Amount (Rp)</label>
                <input required type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Hourly/Additional Amount (Rp)</label>
                <input required type="number" value={formData.additional_amount} onChange={(e) => setFormData({ ...formData, additional_amount: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">{submitting ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
