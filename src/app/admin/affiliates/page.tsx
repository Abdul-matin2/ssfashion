"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Affiliate } from "@/types/affiliate";

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Affiliate>>({
    name: "",
    email: "",
    phone: "",
    commissionRate: 10,
    status: "pending",
  });

  const STATUS_STYLES: Record<Affiliate["status"], string> = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    suspended: "bg-red-100 text-red-800",
  };

  const STATUS_LABELS: Record<Affiliate["status"], string> = {
    active: "Active",
    pending: "Pending",
    suspended: "Suspended",
  };

  const fetchAffiliates = async () => {
    try {
      const res = await fetch("/api/admin/affiliates");
      const data = await res.json();
      if (Array.isArray(data)) setAffiliates(data);
    } catch (error) {
      console.error("Failed to fetch affiliates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      setMessage({ type: "error", text: "Name and email are required" });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const url = editingId ? `/api/admin/affiliates/${editingId}` : "/api/admin/affiliates";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: editingId ? "Affiliate updated successfully!" : "Affiliate created successfully!" });
        fetchAffiliates();
        resetForm();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save affiliate" });
      }
    } catch (error) {
      console.error("Failed to save affiliate:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this affiliate?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Affiliate deleted successfully!" });
        fetchAffiliates();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to delete affiliate" });
      }
    } catch (error) {
      console.error("Failed to delete affiliate:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (affiliate: Affiliate) => {
    setEditingId(affiliate.id);
    setFormData({
      name: affiliate.name,
      email: affiliate.email,
      phone: affiliate.phone,
      commissionRate: affiliate.commissionRate,
      status: affiliate.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", phone: "", commissionRate: 10, status: "pending" });
    setShowForm(false);
    setMessage(null);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Stats
  const stats = {
    total: affiliates.length,
    active: affiliates.filter((a) => a.status === "active").length,
    pending: affiliates.filter((a) => a.status === "pending").length,
    totalEarnings: affiliates.reduce((sum, a) => sum + a.totalEarnings, 0),
    pendingEarnings: affiliates.reduce((sum, a) => sum + a.pendingEarnings, 0),
    totalReferrals: affiliates.reduce((sum, a) => sum + a.totalReferrals, 0),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Manage Affiliates</h1>
          <p className="text-neutral-500 mt-1">Manage affiliate partners and their commissions</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Affiliate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Total Affiliates</p>
          <p className="text-2xl font-bold text-brand-black">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Total Referrals</p>
          <p className="text-2xl font-bold text-brand-black">{stats.totalReferrals}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Total Earnings</p>
          <p className="text-2xl font-bold text-brand-green">{formatPrice(stats.totalEarnings)}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Pending Earnings</p>
          <p className="text-2xl font-bold text-brand-gold">{formatPrice(stats.pendingEarnings)}</p>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-xl text-sm flex items-center gap-3",
          message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        )}>
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            {message.type === "success" ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-black">
              {editingId ? "Edit Affiliate" : "Add New Affiliate"}
            </h2>
            <button
              onClick={resetForm}
              className="text-neutral-400 hover:text-neutral-600"
              aria-label="Close form"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                  placeholder="affiliate@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                  placeholder="024 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Commission Rate (%)</label>
                <input
                  type="number"
                  value={formData.commissionRate || 10}
                  onChange={(e) => handleChange("commissionRate", parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Status</label>
                <select
                  value={formData.status || "pending"}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : (editingId ? "Update" : "Create")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Affiliate List */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">
            <svg className="animate-spin h-8 w-8 mx-auto text-brand-gold mb-2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading affiliates...
          </div>
        ) : affiliates.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <svg className="h-12 w-12 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No affiliates yet. Click "Add Affiliate" to create your first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Affiliate</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Referral Code</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Commission</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Referrals</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Earnings</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Joined</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-brand-black">{affiliate.name}</p>
                      <p className="text-xs text-neutral-400">{affiliate.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-brand-black">{affiliate.email}</p>
                      {affiliate.phone && <p className="text-xs text-neutral-500">{affiliate.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">{affiliate.referralCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-brand-black">{affiliate.commissionRate}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-brand-black">{affiliate.totalReferrals}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-brand-black">{formatPrice(affiliate.totalEarnings)}</p>
                        {affiliate.pendingEarnings > 0 && (
                          <p className="text-xs text-brand-gold">Pending: {formatPrice(affiliate.pendingEarnings)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={affiliate.status as "default" | "sale" | "new" | "featured" | "out-of-stock"}>
                        {STATUS_LABELS[affiliate.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-500">{formatDate(affiliate.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(affiliate)}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(affiliate.id)}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}