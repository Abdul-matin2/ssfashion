"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const categories = ["Orders", "Shipping", "Returns", "Payment", "General"];

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: "",
    answer: "",
    category: "General",
    order: 0,
  });

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (Array.isArray(data)) setFaqs(data);
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      setMessage({ type: "error", text: "Question and answer are required" });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const url = editingId ? `/api/admin/faqs/${editingId}` : "/api/admin/faqs";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: editingId ? "FAQ updated successfully!" : "FAQ created successfully!" });
        fetchFaqs();
        resetForm();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save FAQ" });
      }
    } catch (error) {
      console.error("Failed to save FAQ:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "FAQ deleted successfully!" });
        fetchFaqs();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to delete FAQ" });
      }
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ question: "", answer: "", category: "General", order: 0 });
    setShowForm(false);
    setMessage(null);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Manage FAQs</h1>
          <p className="text-neutral-500 mt-1">Add, edit, and organize frequently asked questions</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add FAQ
        </Button>
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
              {editingId ? "Edit FAQ" : "Add New FAQ"}
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
            <div>
              <label className="block text-sm font-medium text-brand-black mb-2">Question *</label>
              <input
                type="text"
                value={formData.question || ""}
                onChange={(e) => handleChange("question", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                placeholder="Enter the question"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black mb-2">Answer *</label>
              <textarea
                value={formData.answer || ""}
                onChange={(e) => handleChange("answer", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                placeholder="Enter the answer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Category</label>
                <select
                  value={formData.category || "General"}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => handleChange("order", parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                  placeholder="0"
                />
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

      {/* FAQ List */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">
            <svg className="animate-spin h-8 w-8 mx-auto text-brand-gold mb-2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading FAQs...
          </div>
        ) : sortedFaqs.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <svg className="h-12 w-12 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.5-3.186 3-2.5.687-3.705 1.89-3.705 3.931A3.705 3.705 0 009 20.96v-1.23c0-1.634 2.254-3 4.5-3 1.384 0 2.64.781 3.207 1.944l.199 1.265c-.572.644-1.426 1.159-2.37 1.159-2.3 0-4.178-1.632-4.178-4 0-2.757 2.79-3.49 4.086-4.347" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 13h-8" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 17h-8" />
            </svg>
            <p>No FAQs yet. Click "Add FAQ" to create your first one.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {sortedFaqs.map((faq) => (
              <div key={faq.id} className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold">
                        {faq.category}
                      </span>
                      <span className="text-xs text-neutral-400">Order: {faq.order}</span>
                    </div>
                    <p className="font-medium text-brand-black truncate">{faq.question}</p>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(faq)}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(faq.id)}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}