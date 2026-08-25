"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  content: string[];
}

interface PrivacyData {
  lastUpdated: string;
  effectiveDate: string;
  sections: Section[];
}

export default function AdminPrivacyPage() {
  const [data, setData] = useState<PrivacyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<PrivacyData>>({});

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/privacy");
      const result = await res.json();
      if (result && !result.error) setData(result);
    } catch (error) {
      console.error("Failed to fetch privacy data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!data) return;

    setIsLoading(true);
    setMessage(null);
    try {
      const updatedData = { ...data, ...formData };
      const res = await fetch("/api/admin/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Privacy Policy updated successfully!" });
        setData(updatedData);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update content" });
      }
    } catch (error) {
      console.error("Failed to save privacy data:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (path: string, value: string | number) => {
    const keys = path.split(".");
    const newFormData = { ...formData };
    let current: any = newFormData;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    setFormData(newFormData);
  };

  const handleSectionChange = (index: number, field: string, value: string | string[]) => {
    const sections = formData.sections || data?.sections || [];
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData({ ...formData, sections: newSections });
  };

  const handleSectionContentChange = (index: number, paragraphIndex: number, value: string) => {
    const sections = formData.sections || data?.sections || [];
    const newSections = [...sections];
    const newContent = [...(newSections[index].content || [])];
    newContent[paragraphIndex] = value;
    newSections[index] = { ...newSections[index], content: newContent };
    setFormData({ ...formData, sections: newSections });
  };

  const addSection = () => {
    const sections = formData.sections || data?.sections || [];
    const newSection = { id: `section-${Date.now()}`, title: "", content: [""] };
    const newSections = [...sections, newSection];
    setFormData({ ...formData, sections: newSections });
    setEditingSectionIndex(newSections.length - 1);
  };

  const removeSection = (index: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    const sections = formData.sections || data?.sections || [];
    const newSections = sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: newSections });
  };

  const resetForm = () => {
    setFormData({});
    setEditingSectionIndex(null);
    setMessage(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="p-8 text-center text-neutral-500">
          <svg className="animate-spin h-8 w-8 mx-auto text-brand-gold mb-2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading content...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="p-8 text-center text-neutral-500">Failed to load content.</div>
      </div>
    );
  }

  const sections = formData.sections || data.sections;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Manage Privacy Policy</h1>
          <p className="text-neutral-500 mt-1">Edit all sections of the Privacy Policy page</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
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

      {/* Meta Fields */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-brand-black">Page Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-2">Last Updated *</label>
            <input
              type="text"
              value={formData.lastUpdated ?? data.lastUpdated}
              onChange={(e) => handleChange("lastUpdated", e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-2">Effective Date *</label>
            <input
              type="text"
              value={formData.effectiveDate ?? data.effectiveDate}
              onChange={(e) => handleChange("effectiveDate", e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-black">Sections</h2>
          <Button variant="outline" size="sm" onClick={addSection}>
            + Add Section
          </Button>
        </div>

        <div className="divide-y divide-neutral-200 p-6 space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-neutral-50 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-brand-black">Section #{index + 1}</h3>
                <div className="flex items-center gap-2">
                  {editingSectionIndex === index ? (
                    <>
                      <Button variant="primary" size="sm" onClick={() => { handleSave(); setEditingSectionIndex(null); }}>Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingSectionIndex(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setEditingSectionIndex(index)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => removeSection(index)}>Delete</Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Section ID *</label>
                  <input
                    type="text"
                    value={editingSectionIndex === index ? (formData.sections?.[index]?.id ?? section.id ?? "") : section.id ?? ""}
                    onChange={(e) => handleSectionChange(index, "id", e.target.value)}
                    disabled={editingSectionIndex !== index}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                    placeholder="e.g., information-we-collect"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Title *</label>
                  <input
                    type="text"
                    value={editingSectionIndex === index ? (formData.sections?.[index]?.title ?? section.title ?? "") : section.title ?? ""}
                    onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                    disabled={editingSectionIndex !== index}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                    placeholder="e.g., 1. Information We Collect"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Content (one paragraph per line) *</label>
                  <textarea
                    value={editingSectionIndex === index
                      ? ((formData.sections?.[index]?.content ?? section.content ?? [])).join("\n\n")
                      : (section.content ?? []).join("\n\n")
                    }
                    onChange={(e) => {
                      const paragraphs = e.target.value.split("\n\n").filter(Boolean);
                      handleSectionChange(index, "content", paragraphs);
                    }}
                    disabled={editingSectionIndex !== index}
                    rows={6}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                    placeholder="Enter each paragraph on a new line (blank line separates paragraphs)"
                  />
                </div>
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <svg className="h-12 w-12 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p>No sections yet. Click "Add Section" to create your first one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}