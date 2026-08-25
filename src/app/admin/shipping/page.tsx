"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ShippingData {
  hero: { title: string; subtitle: string };
  policies: Array<{ title: string; icon: string; content: string[] }>;
  rates: Array<{ region: string; standard: string; express: string; freeThreshold?: string }>;
  timeline: Array<{ step: string; description: string; estimatedDays: string }>;
  restrictions: string[];
  faqs: Array<{ question: string; answer: string }>;
  [key: string]: any;
}

const defaultData: ShippingData = {
  hero: { title: "Shipping Information", subtitle: "Fast, reliable delivery across Ghana and beyond" },
  policies: [
    { title: "Free Standard Shipping", icon: "truck", content: ["Free standard shipping on all orders over GHS 500", "Orders under GHS 500: Regional delivery fee applies", "Delivery within 2-5 business days"] },
    { title: "Express Delivery", icon: "clock", content: ["Available in major cities (Accra, Kumasi, Takoradi)", "GHS 50 flat rate for express delivery", "Delivered within 1-2 business days"] },
    { title: "International Shipping", icon: "globe", content: ["Ships to West Africa (Nigeria, Ivory Coast, Togo, Benin)", "Rates calculated at checkout based on destination", "Delivery within 5-10 business days", "Customs duties and taxes are the recipient's responsibility"] },
  ],
  rates: [
    { region: "Northern Ghana", standard: "GHS 20", express: "N/A", freeThreshold: "GHS 500+" },
    { region: "Rest of Ghana", standard: "GHS 50", express: "GHS 50", freeThreshold: "GHS 500+" },
    { region: "West Africa", standard: "GHS 120", express: "GHS 200", freeThreshold: "GHS 1000+" },
  ],
  timeline: [
    { step: "Order Placed", description: "Your order is confirmed and sent to our warehouse", estimatedDays: "Same day" },
    { step: "Processing", description: "Items are picked, packed, and quality checked", estimatedDays: "1 business day" },
    { step: "Dispatched", description: "Package handed to courier partner", estimatedDays: "1 business day" },
    { step: "In Transit", description: "Package is on its way to your address", estimatedDays: "1-3 business days" },
    { step: "Delivered", description: "Package arrives at your doorstep", estimatedDays: "Delivery day" },
  ],
  restrictions: [
    "PO Box addresses not accepted for express delivery",
    "Some remote areas may have extended delivery times",
    "Signature required for orders over GHS 1000",
    "We cannot ship to military addresses (AFO/FPO)",
  ],
  faqs: [
    { question: "How can I track my order?", answer: "Once your order ships, you'll receive an email with a tracking number. You can also track it in your account under 'My Orders' or use our Track Order page." },
    { question: "What if I'm not home when my package arrives?", answer: "Our courier will attempt delivery twice. After the second attempt, the package will be held at the nearest pickup point for 5 business days. You'll receive SMS notifications with pickup details." },
    { question: "Can I change my delivery address after ordering?", answer: "If your order hasn't been dispatched yet, contact us immediately at support@ssfashion.com or call +233 24 123 4567. Once dispatched, address changes may not be possible." },
    { question: "Do you offer weekend delivery?", answer: "Standard delivery operates Monday-Saturday. Express delivery in Accra is available on Saturdays for orders placed before 12 PM Friday. No Sunday delivery." },
  ],
};

const icons = ["truck", "clock", "globe", "sparkles", "box", "calendar", "receipt", "shield", "star", "heart", "leaf", "globe", "users", "lightbulb", "trending", "currency", "tag", "academic", "home", "handshake", "recycle", "cloud", "gift", "droplet", "document", "image", "camera", "chart"];

export default function ShippingAdminPage() {
  const [data, setData] = useState<ShippingData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");
  const [editingPolicyIndex, setEditingPolicyIndex] = useState<number | null>(null);
  const [editingRateIndex, setEditingRateIndex] = useState<number | null>(null);
  const [editingTimelineIndex, setEditingTimelineIndex] = useState<number | null>(null);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ShippingData>(defaultData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/shipping")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setData(data);
          setFormData(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section: string, index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleArrayItemChange = (section: string, index: number, subIndex: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item: any, i: number) =>
        i === index
          ? {
              ...item,
              [field]: item[field].map((subItem: any, j: number) =>
                j === subIndex ? { ...subItem, [field]: value } : subItem
              ),
            }
          : item
      ),
    }));
  };

  const addArrayItem = (section: string) => {
    const newItem = getDefaultItem(section);
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_: any, i: number) => i !== index),
    }));
  };

  const getDefaultItem = (section: string) => {
    switch (section) {
      case "policies":
        return { title: "", icon: "truck", content: [""] };
      case "rates":
        return { region: "", standard: "", express: "", freeThreshold: "" };
      case "timeline":
        return { step: "", description: "", estimatedDays: "" };
      case "restrictions":
        return "";
      case "faqs":
        return { question: "", answer: "" };
      default:
        return {};
    }
  };

  const saveData = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setData(formData);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 mx-auto text-brand-gold" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-brand-black text-brand-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight">S&S Fashion Admin</span>
            <span className="px-2 py-1 text-xs font-medium bg-brand-gold/20 text-brand-gold rounded-full">Shipping Info</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium text-brand-white hover:text-brand-gold transition-colors" onClick={saveData} disabled={saveStatus === "saving"}>
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-neutral-200">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Admin tabs">
            {[
              { id: "hero", label: "Hero" },
              { id: "policies", label: "Policies" },
              { id: "rates", label: "Rates" },
              { id: "timeline", label: "Timeline" },
              { id: "restrictions", label: "Restrictions" },
              { id: "faqs", label: "FAQs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 border-b-2 border-transparent",
                  activeTab === tab.id
                    ? "border-brand-gold text-brand-black"
                    : "text-neutral-500 hover:text-brand-black hover:border-neutral-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
          {/* Hero Tab */}
          {activeTab === "hero" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-semibold text-brand-black">Hero Section</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title</label>
                <input
                  type="text"
                  value={formData.hero?.title ?? data.hero.title}
                  onChange={(e) => handleChange("hero", { ...formData.hero, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.hero?.subtitle ?? data.hero.subtitle}
                  onChange={(e) => handleChange("hero", { ...formData.hero, subtitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none"
                />
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === "policies" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Shipping Policies</h2>
                <button onClick={() => addArrayItem("policies")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">
                  + Add Policy
                </button>
              </div>
              {formData.policies.map((policy, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Policy #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPolicyIndex(editingPolicyIndex === index ? null : index)}
                        className={cn(editingPolicyIndex === index ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}
                      >
                        {editingPolicyIndex === index ? "Cancel" : "Edit"}
                      </button>
                      <button
                        onClick={() => removeArrayItem("policies", index)}
                        className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingPolicyIndex === index ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Title</label>
                        <input
                          type="text"
                          value={policy.title}
                          onChange={(e) => handleNestedChange("policies", index, "title", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Icon</label>
                        <select
                          value={policy.icon}
                          onChange={(e) => handleNestedChange("policies", index, "icon", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none"
                        >
                          {icons.map((icon) => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Content (one per line)</label>
                        <textarea
                          value={policy.content.join("\n")}
                          onChange={(e) => handleNestedChange("policies", index, "content", e.target.value.split("\n"))}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-neutral-600">
                      <p><strong>Title:</strong> {policy.title}</p>
                      <p><strong>Icon:</strong> {policy.icon}</p>
                      <p><strong>Content:</strong></p>
                      <ul className="ml-4 list-disc">
                        {policy.content.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Rates Tab */}
          {activeTab === "rates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Shipping Rates</h2>
                <button onClick={() => addArrayItem("rates")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">
                  + Add Rate
                </button>
              </div>
              {formData.rates.map((rate, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Rate #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingRateIndex(editingRateIndex === index ? null : index)}
                        className={cn(editingRateIndex === index ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}
                      >
                        {editingRateIndex === index ? "Cancel" : "Edit"}
                      </button>
                      <button onClick={() => removeArrayItem("rates", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingRateIndex === index ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Region</label>
                        <input type="text" value={rate.region} onChange={(e) => handleNestedChange("rates", index, "region", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Standard</label>
                        <input type="text" value={rate.standard} onChange={(e) => handleNestedChange("rates", index, "standard", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Express</label>
                        <input type="text" value={rate.express} onChange={(e) => handleNestedChange("rates", index, "express", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Free Threshold</label>
                        <input type="text" value={rate.freeThreshold ?? ""} onChange={(e) => handleNestedChange("rates", index, "freeThreshold", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-4 gap-4 text-neutral-600">
                      <p><strong>Region:</strong> {rate.region}</p>
                      <p><strong>Standard:</strong> {rate.standard}</p>
                      <p><strong>Express:</strong> {rate.express}</p>
                      <p><strong>Free:</strong> {rate.freeThreshold ?? "—"}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Delivery Timeline</h2>
                <button onClick={() => addArrayItem("timeline")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">
                  + Add Step
                </button>
              </div>
              {formData.timeline.map((step, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Step #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingTimelineIndex(editingTimelineIndex === index ? null : index)} className={cn(editingTimelineIndex === index ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>
                        {editingTimelineIndex === index ? "Cancel" : "Edit"}
                      </button>
                      <button onClick={() => removeArrayItem("timeline", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingTimelineIndex === index ? (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Step</label>
                        <input type="text" value={step.step} onChange={(e) => handleNestedChange("timeline", index, "step", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Description</label>
                        <input type="text" value={step.description} onChange={(e) => handleNestedChange("timeline", index, "description", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Estimated Days</label>
                        <input type="text" value={step.estimatedDays} onChange={(e) => handleNestedChange("timeline", index, "estimatedDays", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-4 text-neutral-600">
                      <p><strong>Step:</strong> {step.step}</p>
                      <p><strong>Description:</strong> {step.description}</p>
                      <p><strong>Days:</strong> {step.estimatedDays}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Restrictions Tab */}
          {activeTab === "restrictions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Restrictions</h2>
                <button onClick={() => addArrayItem("restrictions")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">
                  + Add Restriction
                </button>
              </div>
              <div className="space-y-3">
                {formData.restrictions.map((restriction, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                    <input
                      type="text"
                      value={restriction}
                      onChange={(e) => {
                        const newRestrictions = [...formData.restrictions];
                        newRestrictions[index] = e.target.value;
                        setFormData({ ...formData, restrictions: newRestrictions });
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none"
                    />
                    <button onClick={() => removeArrayItem("restrictions", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">FAQs</h2>
                <button onClick={() => addArrayItem("faqs")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">
                  + Add FAQ
                </button>
              </div>
              {formData.faqs.map((faq, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">FAQ #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingFaqIndex(editingFaqIndex === index ? null : index)} className={cn(editingFaqIndex === index ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>
                        {editingFaqIndex === index ? "Cancel" : "Edit"}
                      </button>
                      <button onClick={() => removeArrayItem("faqs", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingFaqIndex === index ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Question</label>
                        <input type="text" value={faq.question} onChange={(e) => handleNestedChange("faqs", index, "question", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Answer</label>
                        <textarea value={faq.answer} onChange={(e) => handleNestedChange("faqs", index, "answer", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-neutral-600">
                      <p><strong>Q:</strong> {faq.question}</p>
                      <p><strong>A:</strong> {faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}