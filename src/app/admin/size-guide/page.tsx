"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SizeGuideData {
  hero: { title: string; subtitle: string };
  categories: Array<{
    id: string;
    name: string;
    sizes: Array<{ size: string; chest?: string; waist?: string; hips?: string; length?: string; shoulder?: string; inseam?: string; footLength?: string; uk?: string; us?: string; eu?: string }>;
    measuringTips: Array<{ title: string; instruction: string }>;
    fitGuide: Array<{ fit: string; description: string }>;
  }>;
}

const defaultData: SizeGuideData = {
  hero: { title: "Size Guide", subtitle: "Find your perfect fit with our comprehensive sizing charts" },
  categories: [
    {
      id: "men",
      name: "Men",
      sizes: [
        { size: "XS", chest: "86-91", waist: "71-76", hips: "86-91", length: "68-70", shoulder: "42-43", uk: "34-36", us: "34-36", eu: "44-46" },
        { size: "S", chest: "91-97", waist: "76-81", hips: "91-97", length: "70-72", shoulder: "43-44", uk: "36-38", us: "36-38", eu: "46-48" },
        { size: "M", chest: "97-102", waist: "81-86", hips: "97-102", length: "72-74", shoulder: "44-46", uk: "38-40", us: "38-40", eu: "48-50" },
        { size: "L", chest: "102-107", waist: "86-91", hips: "102-107", length: "74-76", shoulder: "46-47", uk: "40-42", us: "40-42", eu: "50-52" },
        { size: "XL", chest: "107-112", waist: "91-97", hips: "107-112", length: "76-78", shoulder: "47-48", uk: "42-44", us: "42-44", eu: "52-54" },
        { size: "XXL", chest: "112-117", waist: "97-102", hips: "112-117", length: "78-80", shoulder: "48-50", uk: "44-46", us: "44-46", eu: "54-56" },
      ],
      measuringTips: [
        { title: "Chest", instruction: "Measure around the fullest part of your chest, keeping the tape horizontal." },
        { title: "Waist", instruction: "Measure around your natural waistline, the narrowest part of your torso." },
        { title: "Hips", instruction: "Measure around the fullest part of your hips and buttocks." },
      ],
      fitGuide: [
        { fit: "Slim Fit", description: "Tailored through the chest and waist for a modern, streamlined look." },
        { fit: "Regular Fit", description: "Classic cut with room through the chest and waist for everyday comfort." },
        { fit: "Relaxed Fit", description: "Generous cut throughout for maximum comfort and ease of movement." },
      ],
    },
    {
      id: "women",
      name: "Women",
      sizes: [
        { size: "XS (6)", chest: "80-84", waist: "60-64", hips: "86-90", length: "58-60", shoulder: "37-38", uk: "6", us: "2", eu: "34" },
        { size: "S (8)", chest: "84-88", waist: "64-68", hips: "90-94", length: "60-62", shoulder: "38-39", uk: "8", us: "4", eu: "36" },
        { size: "M (10)", chest: "88-92", waist: "68-72", hips: "94-98", length: "62-64", shoulder: "39-40", uk: "10", us: "6", eu: "38" },
        { size: "L (12)", chest: "92-96", waist: "72-76", hips: "98-102", length: "64-66", shoulder: "40-41", uk: "12", us: "8", eu: "40" },
        { size: "XL (14)", chest: "96-100", waist: "76-80", hips: "102-106", length: "66-68", shoulder: "41-42", uk: "14", us: "10", eu: "42" },
        { size: "XXL (16)", chest: "100-104", waist: "80-84", hips: "106-110", length: "68-70", shoulder: "42-43", uk: "16", us: "12", eu: "44" },
      ],
      measuringTips: [
        { title: "Bust", instruction: "Measure around the fullest part of your bust, keeping the tape horizontal." },
        { title: "Waist", instruction: "Measure around your natural waistline, the narrowest part of your torso." },
        { title: "Hips", instruction: "Measure around the fullest part of your hips and buttocks." },
      ],
      fitGuide: [
        { fit: "Bodycon", description: "Figure-hugging fit that follows your natural curves." },
        { fit: "Regular Fit", description: "Classic cut that skims the body without being too tight or loose." },
        { fit: "Oversized", description: "Deliberately loose and relaxed for a casual, trendy look." },
      ],
    },
    {
      id: "kids",
      name: "Kids",
      sizes: [
        { size: "2-3Y", chest: "53-55", waist: "50-52", length: "35-37", shoulder: "24-25" },
        { size: "4-5Y", chest: "56-58", waist: "51-53", length: "38-42", shoulder: "26-27" },
        { size: "6-7Y", chest: "59-62", waist: "53-55", length: "43-47", shoulder: "28-29" },
        { size: "8-9Y", chest: "63-67", waist: "55-58", length: "48-53", shoulder: "30-31" },
        { size: "10-11Y", chest: "68-72", waist: "58-61", length: "54-59", shoulder: "32-33" },
        { size: "12-13Y", chest: "73-77", waist: "61-64", length: "60-65", shoulder: "34-36" },
      ],
      measuringTips: [
        { title: "Chest", instruction: "Measure around the fullest part of the chest." },
        { title: "Waist", instruction: "Measure around the natural waistline." },
        { title: "Height", instruction: "Measure without shoes, standing straight against a wall." },
      ],
      fitGuide: [
        { fit: "Standard", description: "Regular fit designed for active kids with room to move and play." },
        { fit: "Slim", description: "Narrower cut for taller, leaner builds." },
      ],
    },
  ],
};

export default function SizeGuideAdminPage() {
  const [data, setData] = useState<SizeGuideData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");
  const [activeCategory, setActiveCategory] = useState(0);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [formData, setFormData] = useState<SizeGuideData>(defaultData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/size-guide")
      .then((res) => res.json())
      .then((d) => { if (d && !d.error) { setData(d); setFormData(d); } })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const saveData = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/admin/size-guide", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { setData(formData); setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 2000); } else { setSaveStatus("error"); }
    } catch { setSaveStatus("error"); }
  };

  const handleHeroChange = (field: string, value: string) => setFormData((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));

  const handleSizeChange = (catIndex: number, sizeIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const cats = [...prev.categories];
      const sizes = [...cats[catIndex].sizes];
      sizes[sizeIndex] = { ...sizes[sizeIndex], [field]: value };
      cats[catIndex] = { ...cats[catIndex], sizes };
      return { ...prev, categories: cats };
    });
  };

  const addSizeRow = (catIndex: number) => {
    setFormData((prev) => {
      const cats = [...prev.categories];
      cats[catIndex] = { ...cats[catIndex], sizes: [...cats[catIndex].sizes, { size: "", chest: "", waist: "", hips: "", length: "", shoulder: "" }] };
      return { ...prev, categories: cats };
    });
  };

  const removeSizeRow = (catIndex: number, sizeIndex: number) => {
    setFormData((prev) => {
      const cats = [...prev.categories];
      cats[catIndex] = { ...cats[catIndex], sizes: cats[catIndex].sizes.filter((_: any, i: number) => i !== sizeIndex) };
      return { ...prev, categories: cats };
    });
  };

  const handleTipChange = (catIndex: number, tipIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const cats = [...prev.categories];
      const tips = [...cats[catIndex].measuringTips];
      tips[tipIndex] = { ...tips[tipIndex], [field]: value };
      cats[catIndex] = { ...cats[catIndex], measuringTips: tips };
      return { ...prev, categories: cats };
    });
  };

  const addTip = (catIndex: number) => {
    setFormData((prev) => {
      const cats = [...prev.categories];
      cats[catIndex] = { ...cats[catIndex], measuringTips: [...cats[catIndex].measuringTips, { title: "", instruction: "" }] };
      return { ...prev, categories: cats };
    });
  };

  const removeTip = (catIndex: number, tipIndex: number) => {
    setFormData((prev) => {
      const cats = [...prev.categories];
      cats[catIndex] = { ...cats[catIndex], measuringTips: cats[catIndex].measuringTips.filter((_: any, i: number) => i !== tipIndex) };
      return { ...prev, categories: cats };
    });
  };

  const handleFitChange = (catIndex: number, fitIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const cats = [...prev.categories];
      const fits = [...cats[catIndex].fitGuide];
      fits[fitIndex] = { ...fits[fitIndex], [field]: value };
      cats[catIndex] = { ...cats[catIndex], fitGuide: fits };
      return { ...prev, categories: cats };
    });
  };

  const addFit = (catIndex: number) => {
    setFormData((prev) => {
      const cats = [...prev.categories];
      cats[catIndex] = { ...cats[catIndex], fitGuide: [...cats[catIndex].fitGuide, { fit: "", description: "" }] };
      return { ...prev, categories: cats };
    });
  };

  const removeFit = (catIndex: number, fitIndex: number) => {
    setFormData((prev) => {
      const cats = [...prev.categories];
      cats[catIndex] = { ...cats[catIndex], fitGuide: cats[catIndex].fitGuide.filter((_: any, i: number) => i !== fitIndex) };
      return { ...prev, categories: cats };
    });
  };

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

  const currentCat = formData.categories[activeCategory];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-brand-black text-brand-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight">S&S Fashion Admin</span>
            <span className="px-2 py-1 text-xs font-medium bg-brand-gold/20 text-brand-gold rounded-full">Size Guide</span>
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
              { id: "sizes", label: "Sizes" },
              { id: "tips", label: "Measuring Tips" },
              { id: "fit", label: "Fit Guide" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 border-b-2 border-transparent", activeTab === tab.id ? "border-brand-gold text-brand-black" : "text-neutral-500 hover:text-brand-black hover:border-neutral-300")}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex gap-2">
          {formData.categories.map((cat, index) => (
            <button key={index} onClick={() => setActiveCategory(index)} className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-colors", activeCategory === index ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200")}>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
          {activeTab === "hero" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-semibold text-brand-black">Hero Section</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title</label>
                <input type="text" value={formData.hero?.title ?? ""} onChange={(e) => handleHeroChange("title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Subtitle</label>
                <input type="text" value={formData.hero?.subtitle ?? ""} onChange={(e) => handleHeroChange("subtitle", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
            </div>
          )}

          {activeTab === "sizes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">{currentCat.name} Sizes</h2>
                <button onClick={() => addSizeRow(activeCategory)} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add Size</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-2 font-medium text-brand-black">Size</th>
                      {currentCat.sizes[0]?.chest !== undefined && <th className="text-left py-3 px-2 font-medium text-brand-black">Chest (cm)</th>}
                      {currentCat.sizes[0]?.waist !== undefined && <th className="text-left py-3 px-2 font-medium text-brand-black">Waist (cm)</th>}
                      {currentCat.sizes[0]?.hips !== undefined && <th className="text-left py-3 px-2 font-medium text-brand-black">Hips (cm)</th>}
                      {currentCat.sizes[0]?.length !== undefined && <th className="text-left py-3 px-2 font-medium text-brand-black">Length (cm)</th>}
                      {currentCat.sizes[0]?.shoulder !== undefined && <th className="text-left py-3 px-2 font-medium text-brand-black">Shoulder (cm)</th>}
                      {currentCat.sizes[0]?.uk !== undefined && <th className="text-left py-3 px-2 font-medium text-brand-black">UK</th>}
                      {currentCat.sizes[0]?.us !== undefined && <th className="text-left py-3 px-2 font-medium text-brand-black">US</th>}
                      {currentCat.sizes[0]?.eu !== undefined && <th className="text-left py-3 px-2 font-medium text-brand-black">EU</th>}
                      <th className="py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCat.sizes.map((size, sizeIndex) => (
                      <tr key={sizeIndex} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-2 px-2">
                          <input type="text" value={size.size} onChange={(e) => handleSizeChange(activeCategory, sizeIndex, "size", e.target.value)} className="w-24 px-2 py-1 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" />
                        </td>
                        {size.chest !== undefined && <td className="py-2 px-2"><input type="text" value={size.chest ?? ""} onChange={(e) => handleSizeChange(activeCategory, sizeIndex, "chest", e.target.value)} className="w-20 px-2 py-1 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" /></td>}
                        {size.waist !== undefined && <td className="py-2 px-2"><input type="text" value={size.waist ?? ""} onChange={(e) => handleSizeChange(activeCategory, sizeIndex, "waist", e.target.value)} className="w-20 px-2 py-1 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" /></td>}
                        {size.hips !== undefined && <td className="py-2 px-2"><input type="text" value={size.hips ?? ""} onChange={(e) => handleSizeChange(activeCategory, sizeIndex, "hips", e.target.value)} className="w-20 px-2 py-1 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" /></td>}
                        {size.length !== undefined && <td className="py-2 px-2"><input type="text" value={size.length ?? ""} onChange={(e) => handleSizeChange(activeCategory, sizeIndex, "length", e.target.value)} className="w-20 px-2 py-1 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" /></td>}
                        {size.shoulder !== undefined && <td className="py-2 px-2"><input type="text" value={size.shoulder ?? ""} onChange={(e) => handleSizeChange(activeCategory, sizeIndex, "shoulder", e.target.value)} className="w-20 px-2 py-1 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" /></td>}
                        {size.uk !== undefined && <td className="py-2 px-2"><input type="text" value={size.uk ?? ""} onChange={(e) => handleSizeChange(activeCategory, sizeIndex, "uk", e.target.value)} className="w-16 px-2 py-1 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" /></td>}
                        {size.us !== undefined && <td className="py-2 px-2"><input type="text" value={size.us ?? ""} onChange={(e) => handleSizeChange(activeCategory, sizeIndex, "us", e.target.value)} className="w-16 px-2 py-1 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" /></td>}
                        {size.eu !== undefined && <td className="py-2 px-2"><input type="text" value={size.eu ?? ""} onChange={(e) => handleSizeChange(activeCategory, sizeIndex, "eu", e.target.value)} className="w-16 px-2 py-1 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" /></td>}
                        <td className="py-2 px-2">
                          <button onClick={() => removeSizeRow(activeCategory, sizeIndex)} className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "tips" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">{currentCat.name} Measuring Tips</h2>
                <button onClick={() => addTip(activeCategory)} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add Tip</button>
              </div>
              {currentCat.measuringTips.map((tip, tipIndex) => (
                <div key={tipIndex} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Tip #{tipIndex + 1}</h3>
                    <button onClick={() => removeTip(activeCategory, tipIndex)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={tip.title} onChange={(e) => handleTipChange(activeCategory, tipIndex, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-brand-black mb-2">Instruction</label><input type="text" value={tip.instruction} onChange={(e) => handleTipChange(activeCategory, tipIndex, "instruction", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "fit" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">{currentCat.name} Fit Guide</h2>
                <button onClick={() => addFit(activeCategory)} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add Fit</button>
              </div>
              {currentCat.fitGuide.map((fit, fitIndex) => (
                <div key={fitIndex} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Fit #{fitIndex + 1}</h3>
                    <button onClick={() => removeFit(activeCategory, fitIndex)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-brand-black mb-2">Fit Name</label><input type="text" value={fit.fit} onChange={(e) => handleFitChange(activeCategory, fitIndex, "fit", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-brand-black mb-2">Description</label><input type="text" value={fit.description} onChange={(e) => handleFitChange(activeCategory, fitIndex, "description", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}