"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, CircleDollarSign, Edit, Loader2 } from "lucide-react";
import { parkingRatesService } from "@/services/parking-rates.service";
import { vehicleTypesService } from "@/services/vehicle-types.service";
import { ParkingRateItem, VehicleTypeOptionsResponse } from "@/types/api";
import { TableEmptyState } from "@/components/TableEmptyState";

export default function ParkingRatesPage() {
  const [items, setItems] = useState<ParkingRateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeOptionsResponse[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ParkingRateItem | null>(null);
  const [formData, setFormData] = useState({
    vehicle_type_id: "",
    rate_type: "FLAT",
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
        rate_type: item.rate_type,
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
        rate_type: "FLAT",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-emerald-400" />
            Parking Rates Setup
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure hourly, flat, and grace period tariffs per vehicle category.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchRates} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Rate Rule
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Vehicle Category</th>
                <th className="p-3">Rate Type</th>
                <th className="p-3">Base Amount</th>
                <th className="p-3">Hourly Rate</th>
                <th className="p-3">Grace Period</th>
                <th className="p-3">Max Daily</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" /> Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <TableEmptyState
                  colSpan={7}
                  icon={CircleDollarSign}
                  title="Belum Ada Tarif Parkir"
                  description="Belum ada aturan tarif parkir yang dikonfigurasi."
                  actionLabel="Tambah Tarif"
                  onAction={() => handleOpenModal()}
                />
              ) : (
                items.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">{rate.vehicle_type_name}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px]">{rate.rate_type}</span></td>
                    <td className="p-3 font-mono font-bold text-emerald-400">Rp {rate.amount.toLocaleString()}</td>
                    <td className="p-3 font-mono">Rp {rate.additional_amount.toLocaleString()}</td>
                    <td className="p-3">{rate.grace_period_minutes} mins</td>
                    <td className="p-3 font-mono text-slate-400">Rp {rate.max_daily_amount.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleOpenModal(rate)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
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
            <h2 className="text-lg font-bold text-white">{editingItem ? "Edit Rate Rule" : "Add Rate Rule"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Vehicle Category</label>
                <select
                  value={formData.vehicle_type_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_type_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Select Category --</option>
                  {vehicleTypes.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Base Amount (Rp)</label>
                  <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Hourly Rate (Rp)</label>
                  <input type="number" value={formData.additional_amount} onChange={(e) => setFormData({ ...formData, additional_amount: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50">{submitting ? "Saving..." : "Save Rate"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
