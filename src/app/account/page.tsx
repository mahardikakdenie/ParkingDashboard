"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { usersService } from "@/services/users.service";
import { UserResponse } from "@/types/api";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
  });

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await usersService.getResource();
      if (res && res.user) {
        setProfile(res.user);
        const imageStr =
          typeof res.user.image === "string"
            ? res.user.image
            : (res.user.image?.url as string) || "";
        setFormData({
          name: res.user.name || "",
          email: res.user.email || "",
          phone: res.user.phone || "",
          image: imageStr,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Gagal memuat profil akun.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      await usersService.updateAccount({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        image: formData.image,
      });

      // Synchronize updated user profile in AuthContext
      updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        image: formData.image,
      });

      setFeedback({
        type: "success",
        message: "Profil akun berhasil diperbarui!",
      });
      fetchUserProfile();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Gagal memperbarui akun.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Account Settings
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola informasi profil pribadi dan detail akun Anda.
            </p>
          </div>
        </div>

        <button
          onClick={fetchUserProfile}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Profile
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center backdrop-blur-xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
          <p className="text-sm font-medium text-slate-300">Memuat profil akun...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Summary Card */}
          <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 border-4 border-slate-800 shadow-xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden mx-auto">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (profile?.name || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 border-2 border-slate-900 rounded-full text-white">
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-white mt-3">
                  {profile?.name || "User Profile"}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {profile?.email || "No email"}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                  {profile?.roles && profile.roles.length > 0 ? (
                    profile.roles.map((r, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Standard User
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Last Login
                  </span>
                  <span className="text-slate-200 font-mono text-[11px]">
                    {profile?.last_login_at
                      ? new Date(profile.last_login_at).toLocaleString("id-ID")
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    Applications
                  </span>
                  <span className="text-slate-200 font-semibold">
                    {profile?.applications?.length || 0} Apps
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">Account Verified</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Endpoint `/users/account` is used to sync your profile updates.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Form Card */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Edit Profile Details
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Perbarui nama, email, nomor telepon, dan URL foto profil Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan email aktif"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" /> Nomor Telepon
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Avatar Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {profile?.applications && profile.applications.length > 0 && (
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    Aplikasi Terhubung (Read-only)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.applications.map((app, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800/80 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
