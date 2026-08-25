"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ReturnsData {
  hero: { title: string; subtitle: string };
  policy: { title: string; content: string[] };
  conditions: Array<{ title: string; description: string }>;
  process: Array<{ step: number; title: string; description: string; icon: string }>;
  timeframes: Array<{ timeframe: string; action: string; details: string }>;
  exceptions: string[];
  refundMethods: Array<{ method: string; processingTime: string; details: string }>;
  faqs: Array<{ question: string; answer: string }>;
  [key: string]: any;
}

const defaultData: ReturnsData = {
  hero: { title: "Returns & Exchange", subtitle: "We want you to love every purchase" },
  policy: { title: "Our Promise", content: ["If you're not completely satisfied with your purchase, we're here to help. We offer hassle-free returns and exchanges within 14 days of delivery.", "Items must be unworn, unwashed, with original tags attached, and in the original packaging.", "For defective items, we offer free returns and full refunds including original shipping costs."] },
  conditions: [
    { title: "14-Day Return Window", description: "Returns must be initiated within 14 days of delivery. Items received after 14 days may not qualify for a return." },
    { title: "Unworn & Unwashed", description: "Items must be in original condition — unworn, unwashed, and unaltered. Items with signs of wear will be rejected." },
    { title: "Original Tags & Packaging", description: "All original tags must be attached and items should be in their original packaging where applicable." },
    { title: "Proof of Purchase", description: "A valid receipt, order confirmation email, or order number is required for all returns." },
  ],
  process: [
    { step: 1, title: "Request Return", description: "Log into your account, go to 'My Orders', and select the items you want to return. Choose your reason for return.", icon: "document" },
    { step: 2, title: "Get Label", description: "Once approved, you'll receive a prepaid return shipping label via email. Print it and attach to your package.", icon: "tag" },
    { step: 3, title: "Pack & Ship", description: "Securely pack the items in original packaging. Drop off at any of our courier partner locations.", icon: "box" },
    { step: 4, title: "Refund Processed", description: "Once we receive and inspect your return, we'll process your refund within 3-5 business days.", icon: "receipt" },
  ],
  timeframes: [
    { timeframe: "Within 24 hours", action: "Instant Refund", details: "Full refund to original payment method" },
    { timeframe: "1-7 days", action: "Full Refund", details: "Refund to original payment method" },
    { timeframe: "8-14 days", action: "Store Credit", details: "Full refund as store credit (never expires)" },
    { timeframe: "15-30 days", action: "Exchange Only", details: "Exchange for different size or color only" },
    { timeframe: "After 30 days", action: "Not Accepted", details: "Returns not accepted unless item is defective" },
  ],
  exceptions: [
    "Swimwear and undergarments (hygiene reasons)",
    "Custom or personalized orders",
    "Gift cards and digital products",
    "Items marked as 'Final Sale' or 'Clearance'",
    "Items with perfumes, deodorant, or makeup stains",
  ],
  refundMethods: [
    { method: "Original Payment", processingTime: "3-5 business days", details: "Refund to the original payment method used at checkout" },
    { method: "Store Credit", processingTime: "1-2 business days", details: "Digital store credit with no expiration, usable on any purchase" },
    { method: "Bank Transfer", processingTime: "5-7 business days", details: "Direct bank transfer for cash on delivery orders" },
  ],
  faqs: [
    { question: "Can I exchange an item for a different size?", answer: "Yes! Exchanges are free for size and color changes. Simply select 'Exchange' when requesting your return and specify the new size/color you'd like." },
    { question: "What if I received a defective or wrong item?", answer: "We sincerely apologize! Contact us within 48 hours of delivery with photos of the defect. We'll arrange a free pickup and send the correct item at no extra cost, or provide a full refund." },
    { question: "Can I return an item bought on sale?", answer: "Sale items can be returned within 14 days for store credit only, unless they arrived defective. Items marked 'Final Sale' cannot be returned." },
    { question: "How do I track my return?", answer: "Once your return is shipped, you'll receive a tracking number via email. You can also track the status in your account under 'My Returns'." },
  ],
};

const icons = ["truck", "clock", "globe", "sparkles", "box", "calendar", "receipt", "shield", "star", "heart", "leaf", "users", "lightbulb", "trending", "currency", "tag", "academic", "home", "handshake", "recycle", "cloud", "gift", "droplet", "document", "image", "camera", "chart"];

export default function ReturnsAdminPage() {
  const [data, setData] = useState<ReturnsData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");
  const [editingIndex, setEditingIndex] = useState<{ section: string; index: number } | null>(null);
  const [formData, setFormData] = useState<ReturnsData>(defaultData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/returns")
      .then((res) => res.json())
      .then((d) => { if (d && !d.error) { setData(d); setFormData(d); } })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field: string, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleNestedChange = (section: string, index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item: any, i: number) => i === index ? { ...item, [field]: value } : item),
    }));
  };

  const addArrayItem = (section: string) => {
    const defaults: Record<string, any> = {
      conditions: { title: "", description: "" },
      process: { step: (formData.process?.length ?? 0) + 1, title: "", description: "", icon: "box" },
      timeframes: { timeframe: "", action: "", details: "" },
      exceptions: "",
      refundMethods: { method: "", processingTime: "", details: "" },
      faqs: { question: "", answer: "" },
    };
    setFormData((prev) => ({ ...prev, [section]: [...prev[section], defaults[section]] }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setFormData((prev) => ({ ...prev, [section]: prev[section].filter((_: any, i: number) => i !== index) }));
  };

  const saveData = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/admin/returns", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { setData(formData); setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 2000); } else { setSaveStatus("error"); }
    } catch { setSaveStatus("error"); }
  };

  const isEditing = (section: string, index: number) => editingIndex?.section === section && editingIndex?.index === index;
  const toggleEdit = (section: string, index: number) => setEditingIndex(isEditing(section, index) ? null : { section, index });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 mx-auto text-brand-gold" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
          </div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "Hero" },
    { id: "policy", label: "Policy" },
    { id: "conditions", label: "Conditions" },
    { id: "process", label: "Process" },
    { id: "timeframes", label: "Timeframes" },
    { id: "exceptions", label: "Exceptions" },
    { id: "refundMethods", label: "Refunds" },
    { id: "faqs", label: "FAQs" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-brand-black text-brand-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight">S&S Fashion Admin</span>
            <span className="px-2 py-1 text-xs font-medium bg-brand-gold/20 text-brand-gold rounded-full">Returns & Exchange</span>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-brand-white hover:text-brand-gold transition-colors" onClick={saveData} disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-neutral-200">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Admin tabs">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 border-b-2 border-transparent", activeTab === tab.id ? "border-brand-gold text-brand-black" : "text-neutral-500 hover:text-brand-black hover:border-neutral-300")}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
          {activeTab === "hero" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-semibold text-brand-black">Hero Section</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title</label>
                <input type="text" value={formData.hero?.title ?? data.hero.title} onChange={(e) => handleChange("hero", { ...formData.hero, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Subtitle</label>
                <input type="text" value={formData.hero?.subtitle ?? data.hero.subtitle} onChange={(e) => handleChange("hero", { ...formData.hero, subtitle: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
            </div>
          )}

          {activeTab === "policy" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-semibold text-brand-black">Policy</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title</label>
                <input type="text" value={formData.policy?.title ?? ""} onChange={(e) => handleChange("policy", { ...formData.policy, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Content (one per line)</label>
                <textarea value={(formData.policy?.content ?? []).join("\n")} onChange={(e) => handleChange("policy", { ...formData.policy, content: e.target.value.split("\n") })} rows={4} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
            </div>
          )}

          {activeTab === "conditions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Conditions</h2>
                <button onClick={() => addArrayItem("conditions")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.conditions.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Condition #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("conditions", index)} className={cn(isEditing("conditions", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("conditions", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("conditions", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("conditions", index) ? (
                    <div className="space-y-4">
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("conditions", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Description</label><textarea value={item.description} onChange={(e) => handleNestedChange("conditions", index, "description", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-neutral-600"><p><strong>{item.title}</strong></p><p>{item.description}</p></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "process" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Return Process</h2>
                <button onClick={() => addArrayItem("process")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add Step</button>
              </div>
              {formData.process.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Step {item.step}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("process", index)} className={cn(isEditing("process", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("process", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("process", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("process", index) ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Step #</label><input type="number" value={item.step} onChange={(e) => handleNestedChange("process", index, "step", parseInt(e.target.value) || 1)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("process", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Icon</label><select value={item.icon} onChange={(e) => handleNestedChange("process", index, "icon", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none">{icons.map((i) => <option key={i} value={i}>{i}</option>)}</select></div>
                      <div className="sm:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-brand-black mb-2">Description</label><textarea value={item.description} onChange={(e) => handleNestedChange("process", index, "description", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-neutral-600"><p><strong>Icon:</strong> {item.icon}</p><p>{item.description}</p></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "timeframes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Return Timeframes</h2>
                <button onClick={() => addArrayItem("timeframes")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.timeframes.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Timeframe #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("timeframes", index)} className={cn(isEditing("timeframes", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("timeframes", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("timeframes", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("timeframes", index) ? (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Timeframe</label><input type="text" value={item.timeframe} onChange={(e) => handleNestedChange("timeframes", index, "timeframe", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Action</label><input type="text" value={item.action} onChange={(e) => handleNestedChange("timeframes", index, "action", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Details</label><input type="text" value={item.details} onChange={(e) => handleNestedChange("timeframes", index, "details", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-4 text-neutral-600"><p><strong>Timeframe:</strong> {item.timeframe}</p><p><strong>Action:</strong> {item.action}</p><p><strong>Details:</strong> {item.details}</p></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "exceptions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Exceptions</h2>
                <button onClick={() => addArrayItem("exceptions")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              <div className="space-y-3">
                {formData.exceptions.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                    <input type="text" value={item} onChange={(e) => { const n = [...formData.exceptions]; n[index] = e.target.value; setFormData({ ...formData, exceptions: n }); }} className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                    <button onClick={() => removeArrayItem("exceptions", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "refundMethods" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Refund Methods</h2>
                <button onClick={() => addArrayItem("refundMethods")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.refundMethods.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Method #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("refundMethods", index)} className={cn(isEditing("refundMethods", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("refundMethods", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("refundMethods", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("refundMethods", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Method</label><input type="text" value={item.method} onChange={(e) => handleNestedChange("refundMethods", index, "method", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Processing Time</label><input type="text" value={item.processingTime} onChange={(e) => handleNestedChange("refundMethods", index, "processingTime", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Details</label><textarea value={item.details} onChange={(e) => handleNestedChange("refundMethods", index, "details", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-neutral-600"><p><strong>{item.method}</strong> — {item.processingTime}</p><p>{item.details}</p></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "faqs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">FAQs</h2>
                <button onClick={() => addArrayItem("faqs")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add FAQ</button>
              </div>
              {formData.faqs.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">FAQ #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("faqs", index)} className={cn(isEditing("faqs", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("faqs", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("faqs", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("faqs", index) ? (
                    <div className="space-y-4">
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Question</label><input type="text" value={item.question} onChange={(e) => handleNestedChange("faqs", index, "question", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Answer</label><textarea value={item.answer} onChange={(e) => handleNestedChange("faqs", index, "answer", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-neutral-600"><p><strong>Q:</strong> {item.question}</p><p><strong>A:</strong> {item.answer}</p></div>
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