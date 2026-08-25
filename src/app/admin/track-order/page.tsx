"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TrackOrderData {
  hero: { title: string; subtitle: string };
  howItWorks: Array<{ step: number; title: string; description: string; icon: string }>;
  faqs: Array<{ question: string; answer: string }>;
  mockOrders: Array<{ orderNumber: string; email: string; status: string }>;
  [key: string]: any;
}

const defaultData: TrackOrderData = {
  hero: { title: "Track Your Order", subtitle: "Enter your order details to get real-time updates on your delivery" },
  howItWorks: [
    { step: 1, title: "Enter Details", description: "Input your order number and the email address used for the purchase", icon: "document" },
    { step: 2, title: "View Status", description: "See your current order status and estimated delivery date", icon: "calendar" },
    { step: 3, title: "Track Progress", description: "Follow your package journey from our warehouse to your doorstep", icon: "truck" },
  ],
  faqs: [
    { question: "What is my order number?", answer: "Your order number is the unique identifier sent to you via email confirmation (format: SSF-XXXXXX). You can also find it in your account under 'My Orders'." },
    { question: "Why can't I find my order?", answer: "Please check that you've entered the correct order number and email address. If you recently placed your order, it may take up to 2 hours to appear in the system. Contact support if the issue persists." },
    { question: "My order shows 'Delivered' but I haven't received it.", answer: "Check with neighbors or building reception. Our courier may have left it in a safe place. If still missing after 24 hours, contact us at support@ssfashion.com with your order number." },
    { question: "Can I change the delivery address?", answer: "If your order hasn't been dispatched yet, contact us immediately. Once dispatched, address changes may not be possible but we can try to intercept with our courier partner." },
    { question: "What do the statuses mean?", answer: "<strong>Processing:</strong> Order confirmed, items being prepared.<br/><strong>Dispatched:</strong> Package handed to courier.<br/><strong>In Transit:</strong> Package on the way to your city.<br/><strong>Out for Delivery:</strong> Courier has the package for today's delivery.<br/><strong>Delivered:</strong> Package delivered to your address." },
  ],
  mockOrders: [
    { orderNumber: "SSF-123456", email: "customer@example.com", status: "Delivered" },
    { orderNumber: "SSF-789012", email: "john@example.com", status: "In Transit" },
    { orderNumber: "SSF-345678", email: "jane@example.com", status: "Processing" },
    { orderNumber: "SSF-901234", email: "mike@example.com", status: "Out for Delivery" },
  ],
};

const icons = ["truck", "clock", "globe", "sparkles", "box", "calendar", "receipt", "shield", "star", "heart", "leaf", "users", "lightbulb", "trending", "currency", "tag", "academic", "home", "handshake", "recycle", "cloud", "gift", "droplet", "document", "image", "camera", "chart"];

export default function TrackOrderAdminPage() {
  const [data, setData] = useState<TrackOrderData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");
  const [editingIndex, setEditingIndex] = useState<{ section: string; index: number } | null>(null);
  const [formData, setFormData] = useState<TrackOrderData>(defaultData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/track-order")
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
      howItWorks: { step: (formData.howItWorks?.length ?? 0) + 1, title: "", description: "", icon: "box" },
      faqs: { question: "", answer: "" },
      mockOrders: { orderNumber: "SSF-", email: "", status: "Processing" },
    };
    setFormData((prev) => ({ ...prev, [section]: [...prev[section], defaults[section]] }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setFormData((prev) => ({ ...prev, [section]: prev[section].filter((_: any, i: number) => i !== index) }));
  };

  const saveData = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/admin/track-order", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-brand-black text-brand-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight">S&S Fashion Admin</span>
            <span className="px-2 py-1 text-xs font-medium bg-brand-gold/20 text-brand-gold rounded-full">Track Order</span>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-brand-white hover:text-brand-gold transition-colors" onClick={saveData} disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-neutral-200">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Admin tabs">
            {[
              { id: "hero", label: "Hero" },
              { id: "howItWorks", label: "How It Works" },
              { id: "faqs", label: "FAQs" },
              { id: "mockOrders", label: "Mock Orders" },
            ].map((tab) => (
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
                <input type="text" value={formData.hero?.title ?? ""} onChange={(e) => handleChange("hero", { ...formData.hero, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Subtitle</label>
                <input type="text" value={formData.hero?.subtitle ?? ""} onChange={(e) => handleChange("hero", { ...formData.hero, subtitle: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
            </div>
          )}

          {activeTab === "howItWorks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">How It Works</h2>
                <button onClick={() => addArrayItem("howItWorks")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add Step</button>
              </div>
              {formData.howItWorks.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Step {item.step}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("howItWorks", index)} className={cn(isEditing("howItWorks", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("howItWorks", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("howItWorks", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("howItWorks", index) ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Step #</label><input type="number" value={item.step} onChange={(e) => handleNestedChange("howItWorks", index, "step", parseInt(e.target.value) || 1)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("howItWorks", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Icon</label><select value={item.icon} onChange={(e) => handleNestedChange("howItWorks", index, "icon", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none">{icons.map((i) => <option key={i} value={i}>{i}</option>)}</select></div>
                      <div className="sm:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-brand-black mb-2">Description</label><textarea value={item.description} onChange={(e) => handleNestedChange("howItWorks", index, "description", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-neutral-600"><p><strong>{item.title}</strong> ({item.icon})</p><p>{item.description}</p></div>
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
                    <div className="space-y-2 text-neutral-600"><p><strong>Q:</strong> {item.question}</p><p dangerouslySetInnerHTML={{ __html: item.answer }} /></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "mockOrders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Demo Orders (for testing)</h2>
                <button onClick={() => addArrayItem("mockOrders")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add Demo Order</button>
              </div>
              <p className="text-neutral-600 text-sm">These mock orders are used for the demo tracking functionality on the public page.</p>
              {formData.mockOrders.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
                  <input type="text" value={item.orderNumber} onChange={(e) => handleNestedChange("mockOrders", index, "orderNumber", e.target.value)} placeholder="Order Number (e.g., SSF-123456)" className="w-48 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm font-mono" />
                  <input type="email" value={item.email} onChange={(e) => handleNestedChange("mockOrders", index, "email", e.target.value)} placeholder="Email" className="w-64 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" />
                  <select value={item.status} onChange={(e) => handleNestedChange("mockOrders", index, "status", e.target.value)} className="w-40 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm">
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <button onClick={() => removeArrayItem("mockOrders", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}