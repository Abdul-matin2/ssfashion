"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PressData {
  hero: { title: string; subtitle: string; description?: string };
  pressKit: { description: string; assets: Array<{ name: string; description: string; icon: string }> };
  media: Array<{ title: string; publication: string; date: string; excerpt: string; url: string; logo: string }>;
  stats: Array<{ value: string; label: string }>;
  contact: { email: string; phone: string; name: string };
  [key: string]: any;
}

// Transform API data to admin format
function transformToAdminFormat(data: any): PressData {
  return {
    ...data,
    pressKit: data.pressKit || { description: "", assets: [] },
    media: data.media || [],
    stats: data.stats || [],
    contact: data.contact || { email: "", phone: "", name: "" },
  };
}

// Transform admin format back to API format
function transformToApiFormat(data: PressData): any {
  return {
    ...data,
    pressKit: data.pressKit || { description: "", assets: [] },
    media: data.media || [],
    stats: data.stats || [],
    contact: data.contact || { email: "", phone: "", name: "" },
  };
}

const defaultData: PressData = {
  hero: { title: "Press & Media", subtitle: "Stories, features, and media resources for S&S Fashion", description: "S&S Fashion has been featured in leading publications across Ghana and West Africa. Download our press kit or get in touch with our media team." },
  pressKit: {
    description: "Everything you need to write about S&S Fashion. Our press kit includes brand guidelines, logos, executive photos, and key facts.",
    assets: [
      { name: "Brand Guidelines", description: "PDF document with our brand story, mission, values, and visual identity", icon: "document" },
      { name: "Logo Pack", description: "High-resolution logos in PNG, SVG, and EPS formats (light and dark versions)", icon: "image" },
      { name: "Executive Photos", description: "Professional headshots of our founding team and key leadership", icon: "camera" },
      { name: "Fact Sheet", description: "Key statistics, milestones, and facts about S&S Fashion", icon: "chart" },
    ],
  },
  media: [
    { title: "How S&S Fashion is Revolutionizing Sneaker Culture in Ghana", publication: "Tech & Style Africa", date: "2026-08-10", excerpt: "From a small online store to one of Ghana's most trusted footwear retailers, S&S Fashion's journey is nothing short of inspiring. We dive deep into how this local brand is competing with international giants.", url: "#", logo: "" },
    { title: "10 Ghanaian Brands You Need to Watch in 2026", publication: "Business Insider Africa", date: "2026-07-22", excerpt: "S&S Fashion makes the list of ten innovative Ghanaian brands reshaping retail. Their focus on authenticity and customer experience sets them apart in a crowded market.", url: "#", logo: "" },
    { title: "The Rise of Authentic Footwear in West Africa", publication: "Fashion Ghana Magazine", date: "2026-06-15", excerpt: "As counterfeit products flood the market, brands like S&S Fashion are building trust through transparency and guaranteed authenticity. A look at the changing landscape.", url: "#", logo: "" },
    { title: "S&S Fashion Partners with Local Artisans for Limited Edition Collection", publication: "Ghana Web", date: "2026-05-08", excerpt: "In a move that celebrates Ghanaian craftsmanship, S&S Fashion has partnered with local artisans to create a limited-edition collection blending traditional motifs with modern sneaker design.", url: "#", logo: "" },
    { title: "E-Commerce in Ghana: The Brands Leading the Digital Revolution", publication: "Disrupt Africa", date: "2026-04-12", excerpt: "S&S Fashion's seamless online shopping experience and nationwide delivery network make them a standout in Ghana's growing e-commerce ecosystem.", url: "#", logo: "" },
    { title: "From Sneaker Enthusiasts to Business Partners: The S&S Story", publication: "Citi Business News", date: "2026-03-05", excerpt: "The founders of S&S Fashion share their journey from passionate sneaker collectors to building one of Ghana's most beloved footwear brands. An inspiring founder story.", url: "#", logo: "" },
  ],
  stats: [
    { value: "50+", label: "Media Features" },
    { value: "20+", label: "Countries Reached" },
    { value: "100K+", label: "Social Media Following" },
    { value: "4.8", label: "Average Rating" },
  ],
  contact: { email: "press@ssfashion.com", phone: "+233 24 123 4567", name: "Ama Serwaa, Head of Communications" },
};

export default function PressAdminPage() {
  const [data, setData] = useState<PressData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");
  const [editingIndex, setEditingIndex] = useState<{ section: string; index: number } | null>(null);
  const [formData, setFormData] = useState<PressData>(defaultData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/press")
      .then((res) => res.json())
      .then((d) => { if (d && !d.error) { const transformed = transformToAdminFormat(d); setData(transformed); setFormData(transformed); } })
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

  const handleNestedObjectChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleDeepNestedChange = (section: string, arrayField: string, index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [arrayField]: prev[section][arrayField].map((item: any, i: number) => i === index ? { ...item, [field]: value } : item),
      },
    }));
  };

  const addArrayItem = (section: string) => {
    const defaults: Record<string, any> = {
      media: { title: "", publication: "", date: "", excerpt: "", url: "#", logo: "" },
      stats: { value: "", label: "" },
    };
    setFormData((prev) => ({ ...prev, [section]: [...prev[section], defaults[section]] }));
  };

  const addPressKitAsset = () => {
    setFormData((prev) => ({
      ...prev,
      pressKit: {
        ...prev.pressKit,
        assets: [...(prev.pressKit?.assets || []), { name: "", description: "", icon: "document" }],
      },
    }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setFormData((prev) => ({ ...prev, [section]: prev[section].filter((_: any, i: number) => i !== index) }));
  };

  const removePressKitAsset = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pressKit: {
        ...prev.pressKit,
        assets: prev.pressKit.assets.filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const saveData = async () => {
    setSaveStatus("saving");
    try {
      const apiData = transformToApiFormat(formData);
      const res = await fetch("/api/admin/press", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(apiData) });
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
            <span className="px-2 py-1 text-xs font-medium bg-brand-gold/20 text-brand-gold rounded-full">Press</span>
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
              { id: "pressKit", label: "Press Kit" },
              { id: "media", label: "Media Coverage" },
              { id: "stats", label: "Stats" },
              { id: "contact", label: "Contact" },
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
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Description</label>
                <textarea value={formData.hero?.description ?? ""} onChange={(e) => handleChange("hero", { ...formData.hero, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
            </div>
          )}

          {activeTab === "pressKit" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Press Kit Description</label>
                <textarea value={formData.pressKit?.description ?? ""} onChange={(e) => handleNestedObjectChange("pressKit", "description", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Press Kit Assets</h2>
                <button onClick={addPressKitAsset} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add Asset</button>
              </div>
              {(formData.pressKit?.assets || []).map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">{item.name || `Asset #${index + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("pressKitAssets", index)} className={cn(isEditing("pressKitAssets", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("pressKitAssets", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removePressKitAsset(index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("pressKitAssets", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Name</label><input type="text" value={item.name} onChange={(e) => handleDeepNestedChange("pressKit", "assets", index, "name", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Icon</label><select value={item.icon} onChange={(e) => handleDeepNestedChange("pressKit", "assets", index, "icon", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none"><option value="document">document</option><option value="image">image</option><option value="camera">camera</option><option value="chart">chart</option><option value="video">video</option><option value="file">file</option></select></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Description</label><textarea value={item.description} onChange={(e) => handleDeepNestedChange("pressKit", "assets", index, "description", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-neutral-600"><p><strong>{item.name}</strong> ({item.icon})</p><p>{item.description}</p></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Media Coverage</h2>
                <button onClick={() => addArrayItem("media")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add Coverage</button>
              </div>
              {(formData.media || []).map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">{item.title || item.publication || `Coverage #${index + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("media", index)} className={cn(isEditing("media", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("media", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("media", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("media", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("media", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Publication</label><input type="text" value={item.publication} onChange={(e) => handleNestedChange("media", index, "publication", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Date</label><input type="text" value={item.date} onChange={(e) => handleNestedChange("media", index, "date", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">URL</label><input type="text" value={item.url} onChange={(e) => handleNestedChange("media", index, "url", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Excerpt</label><textarea value={item.excerpt} onChange={(e) => handleNestedChange("media", index, "excerpt", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-neutral-600">
                      <p className="text-sm text-brand-gold">{item.publication} — {item.date}</p>
                      <p className="italic">&ldquo;{item.excerpt}&rdquo;</p>
                      {item.url && item.url !== "#" && <p className="text-sm"><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Read Article</a></p>}
                    </div>
                  )}
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
              {(formData.stats || []).map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
                  <input type="text" value={item.value} onChange={(e) => handleNestedChange("stats", index, "value", e.target.value)} className="w-24 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm font-semibold" />
                  <input type="text" value={item.label} onChange={(e) => handleNestedChange("stats", index, "label", e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" />
                  <button onClick={() => removeArrayItem("stats", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-semibold text-brand-black">Media Contact</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Contact Name</label>
                <input type="text" value={formData.contact?.name ?? ""} onChange={(e) => handleNestedObjectChange("contact", "name", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Email</label>
                  <input type="email" value={formData.contact?.email ?? ""} onChange={(e) => handleNestedObjectChange("contact", "email", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Phone</label>
                  <input type="text" value={formData.contact?.phone ?? ""} onChange={(e) => handleNestedObjectChange("contact", "phone", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}