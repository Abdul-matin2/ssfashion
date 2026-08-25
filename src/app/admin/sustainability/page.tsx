"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SustainabilityData {
  hero: { title: string; subtitle: string };
  commitments: Array<{ title: string; description: string; icon: string }>;
  initiatives: Array<{ title: string; description: string; progress: number; target: string }>;
  timeline: Array<{ year: string; milestone: string }>;
  partners: Array<{ name: string; focus: string }>;
  stats: Array<{ number: string; label: string }>;
  [key: string]: any;
}

const defaultData: SustainabilityData = {
  hero: { title: "Sustainability", subtitle: "Fashion that cares for people and planet" },
  commitments: [
    { title: "Ethical Manufacturing", description: "All our factories comply with fair labor standards, ensuring safe working conditions and fair wages for every worker in our supply chain.", icon: "shield" },
    { title: "Sustainable Materials", description: "We prioritize organic cotton, recycled polyester, and eco-friendly dyes to minimize our environmental footprint.", icon: "leaf" },
    { title: "Carbon Neutral by 2030", description: "We're committed to achieving carbon neutrality across all operations by 2030 through reduction and offset programs.", icon: "globe" },
    { title: "Circular Fashion", description: "Our take-back program gives your old S&S items a new life, reducing waste and supporting communities.", icon: "recycle" },
  ],
  initiatives: [
    { title: "Organic Cotton Transition", description: "Shifting our entire cotton supply to certified organic sources", progress: 65, target: "100% by 2027" },
    { title: "Packaging Reduction", description: "Reducing single-use plastic in our packaging", progress: 80, target: "Zero plastic by 2026" },
    { title: "Water Conservation", description: "Implementing water recycling in our dyeing processes", progress: 45, target: "50% reduction by 2028" },
    { title: "Community Impact", description: "Investing in local communities through education and healthcare programs", progress: 70, target: "GH₵1M invested by 2027" },
  ],
  timeline: [
    { year: "2022", milestone: "Launched sustainability program with initial commitments" },
    { year: "2023", milestone: "Achieved 50% organic cotton across product lines" },
    { year: "2024", milestone: "Eliminated single-use plastic from retail packaging" },
    { year: "2025", milestone: "Launched take-back and recycling program" },
    { year: "2026", milestone: "Target: Zero-waste manufacturing in primary facilities" },
    { year: "2030", milestone: "Target: Full carbon neutrality across all operations" },
  ],
  partners: [
    { name: "Fair Trade Ghana", focus: "Fair labor certification and factory audits" },
    { name: "EcoTextile Alliance", focus: "Sustainable fabric sourcing and innovation" },
    { name: "Green Africa Foundation", focus: "Community reforestation and carbon offset projects" },
    { name: "Water.org", focus: "Clean water access in manufacturing communities" },
  ],
  stats: [
    { number: "65%", label: "Organic Cotton Usage" },
    { number: "80%", label: "Plastic-Free Packaging" },
    { number: "50K+", label: "Trees Planted" },
    { number: "GH₵500K", label: "Community Investment" },
  ],
};

const icons = ["truck", "clock", "globe", "sparkles", "box", "calendar", "receipt", "shield", "star", "heart", "leaf", "users", "lightbulb", "trending", "currency", "tag", "academic", "home", "handshake", "recycle", "cloud", "gift", "droplet", "document", "image", "camera", "chart"];

export default function SustainabilityAdminPage() {
  const [data, setData] = useState<SustainabilityData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");
  const [editingIndex, setEditingIndex] = useState<{ section: string; index: number } | null>(null);
  const [formData, setFormData] = useState<SustainabilityData>(defaultData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/sustainability")
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
      commitments: { title: "", description: "", icon: "star" },
      initiatives: { title: "", description: "", progress: 0, target: "" },
      timeline: { year: "", milestone: "" },
      partners: { name: "", focus: "" },
      stats: { number: "", label: "" },
    };
    setFormData((prev) => ({ ...prev, [section]: [...prev[section], defaults[section]] }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setFormData((prev) => ({ ...prev, [section]: prev[section].filter((_: any, i: number) => i !== index) }));
  };

  const saveData = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/admin/sustainability", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
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
            <span className="px-2 py-1 text-xs font-medium bg-brand-gold/20 text-brand-gold rounded-full">Sustainability</span>
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
              { id: "commitments", label: "Commitments" },
              { id: "initiatives", label: "Initiatives" },
              { id: "timeline", label: "Timeline" },
              { id: "partners", label: "Partners" },
              { id: "stats", label: "Stats" },
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

          {activeTab === "commitments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Commitments</h2>
                <button onClick={() => addArrayItem("commitments")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.commitments.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Commitment #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("commitments", index)} className={cn(isEditing("commitments", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("commitments", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("commitments", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("commitments", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("commitments", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Icon</label><select value={item.icon} onChange={(e) => handleNestedChange("commitments", index, "icon", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none">{icons.map((i) => <option key={i} value={i}>{i}</option>)}</select></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Description</label><textarea value={item.description} onChange={(e) => handleNestedChange("commitments", index, "description", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-neutral-600"><p><strong>{item.title}</strong> ({item.icon})</p><p>{item.description}</p></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "initiatives" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Initiatives</h2>
                <button onClick={() => addArrayItem("initiatives")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.initiatives.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Initiative #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("initiatives", index)} className={cn(isEditing("initiatives", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("initiatives", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("initiatives", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("initiatives", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("initiatives", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Target</label><input type="text" value={item.target} onChange={(e) => handleNestedChange("initiatives", index, "target", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Description</label><textarea value={item.description} onChange={(e) => handleNestedChange("initiatives", index, "description", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Progress: {item.progress}%</label><input type="range" min={0} max={100} value={item.progress} onChange={(e) => handleNestedChange("initiatives", index, "progress", parseInt(e.target.value))} className="w-full accent-brand-gold" /></div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-neutral-600">
                      <p><strong>{item.title}</strong></p>
                      <p>{item.description}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                          <div className="bg-brand-gold h-2 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="text-sm font-medium">{item.progress}%</span>
                      </div>
                      <p className="text-sm text-neutral-500">Target: {item.target}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Timeline</h2>
                <button onClick={() => addArrayItem("timeline")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.timeline.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
                  <input type="text" value={item.year} onChange={(e) => handleNestedChange("timeline", index, "year", e.target.value)} placeholder="Year" className="w-24 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm font-semibold" />
                  <input type="text" value={item.milestone} onChange={(e) => handleNestedChange("timeline", index, "milestone", e.target.value)} placeholder="Milestone" className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" />
                  <button onClick={() => removeArrayItem("timeline", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "partners" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Partners</h2>
                <button onClick={() => addArrayItem("partners")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.partners.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
                  <input type="text" value={item.name} onChange={(e) => handleNestedChange("partners", index, "name", e.target.value)} placeholder="Name" className="w-48 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm font-medium" />
                  <input type="text" value={item.focus} onChange={(e) => handleNestedChange("partners", index, "focus", e.target.value)} placeholder="Focus area" className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" />
                  <button onClick={() => removeArrayItem("partners", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Stats</h2>
                <button onClick={() => addArrayItem("stats")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.stats.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
                  <input type="text" value={item.number} onChange={(e) => handleNestedChange("stats", index, "number", e.target.value)} className="w-28 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm font-semibold" />
                  <input type="text" value={item.label} onChange={(e) => handleNestedChange("stats", index, "label", e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" />
                  <button onClick={() => removeArrayItem("stats", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}