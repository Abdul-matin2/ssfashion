"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CareersData {
  hero: { title: string; subtitle: string; description?: string };
  culture: { title: string; description: string; values: string[] };
  benefits: Array<{ title: string; description: string; icon: string }>;
  positions: Array<{ title: string; department: string; location: string; type: string; description: string; requirements: string[]; posted?: string }>;
  testimonials: Array<{ name: string; role: string; quote: string; yearsAtCompany?: number; image?: string }>;
  [key: string]: any;
}

// Transform API data to admin format
function transformToAdminFormat(data: any): CareersData {
  // Culture: convert array of objects to object with values array
  const cultureValues = Array.isArray(data.culture)
    ? data.culture.map((c: any) => c.title)
    : (data.culture?.values || []);

  return {
    ...data,
    culture: {
      title: data.culture?.title || "Our Culture",
      description: data.culture?.description || "At S&S Fashion, we believe that great fashion starts with great people.",
      values: cultureValues,
    },
  };
}

// Transform admin format back to API format
function transformToApiFormat(data: CareersData): any {
  // Culture: convert values array back to array of objects
  const cultureArray = (data.culture?.values || []).map((value, index) => ({
    title: value,
    icon: ["lightbulb", "trending", "users", "heart", "leaf", "growth"][index] || "star",
    description: "",
  }));

  return {
    ...data,
    culture: cultureArray,
  };
}

const defaultData: CareersData = {
  hero: { title: "Join Our Team", subtitle: "Build the future of African fashion with us" },
  culture: { title: "Our Culture", description: "At S&S Fashion, we believe that great fashion starts with great people. Our team is passionate, creative, and committed to celebrating African style on the global stage.", values: ["Creativity & Innovation", "Diversity & Inclusion", "Sustainability", "Growth Mindset", "Collaboration", "Excellence"] },
  benefits: [
    { title: "Competitive Salary", description: "We offer competitive compensation packages benchmarked against industry standards.", icon: "currency" },
    { title: "Health Insurance", description: "Comprehensive health coverage for you and your family.", icon: "shield" },
    { title: "Flexible Hours", description: "Work-life balance with flexible scheduling options.", icon: "clock" },
    { title: "Staff Discount", description: "Generous employee discount on all S&S Fashion products.", icon: "tag" },
    { title: "Training & Development", description: "Investment in your professional growth through training programs.", icon: "academic" },
    { title: "Remote Work", description: "Hybrid work arrangement for eligible positions.", icon: "home" },
  ],
  positions: [
    { title: "E-commerce Manager", department: "Digital", location: "Accra", type: "Full-time", description: "Lead our online sales strategy and manage our e-commerce platform to drive growth across West Africa.", requirements: ["3+ years e-commerce experience", "Proficiency in Shopify or similar platforms", "Data-driven decision making", "Strong analytical skills", "Experience with digital marketing"] },
    { title: "Fashion Designer", department: "Creative", location: "Accra", type: "Full-time", description: "Create stunning collections that blend contemporary fashion with African heritage and modern aesthetics.", requirements: ["Fashion design degree or equivalent", "Proficiency in Adobe Creative Suite", "Portfolio of original designs", "Understanding of African textiles", "Ability to work with production teams"] },
    { title: "Social Media Specialist", department: "Marketing", location: "Remote", type: "Full-time", description: "Manage our social media presence and create engaging content that resonates with our audience.", requirements: ["2+ years social media management", "Experience with Instagram, TikTok, Twitter", "Content creation skills", "Analytics and reporting", "Knowledge of fashion industry trends"] },
    { title: "Warehouse Associate", department: "Operations", location: "Accra", type: "Full-time", description: "Ensure smooth operations in our warehouse, including inventory management and order fulfillment.", requirements: ["Physical fitness for lifting", "Attention to detail", "Ability to work in a team", "Forklift certification preferred", "Basic computer skills"] },
  ],
  testimonials: [
    { name: "Ama Mensah", role: "Senior Designer", quote: "Working at S&S Fashion has been an incredible journey. The creative freedom and support from the team is unmatched. I've grown so much as a designer here.", yearsAtCompany: 3 },
    { name: "Kofi Asante", role: "Marketing Manager", quote: "The culture here is truly special. Everyone is passionate about what they do, and there's a real sense of community. I'm proud to represent African fashion globally.", yearsAtCompany: 2 },
    { name: "Efua Owusu", role: "Operations Lead", quote: "S&S Fashion invests in its people. I started as an associate and now lead a team. The growth opportunities are real, not just promises.", yearsAtCompany: 4 },
  ],
};

const icons = ["truck", "clock", "globe", "sparkles", "box", "calendar", "receipt", "shield", "star", "heart", "leaf", "users", "lightbulb", "trending", "currency", "tag", "academic", "home", "handshake", "recycle", "cloud", "gift", "droplet", "document", "image", "camera", "chart"];

export default function CareersAdminPage() {
  const [data, setData] = useState<CareersData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");
  const [editingIndex, setEditingIndex] = useState<{ section: string; index: number } | null>(null);
  const [formData, setFormData] = useState<CareersData>(defaultData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/careers")
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

  const addArrayItem = (section: string) => {
    const defaults: Record<string, any> = {
      benefits: { title: "", description: "", icon: "star" },
      positions: { title: "", department: "", location: "", type: "Full-time", description: "", requirements: [""] },
      testimonials: { name: "", role: "", quote: "", yearsAtCompany: 1 },
    };
    setFormData((prev) => ({ ...prev, [section]: [...prev[section], defaults[section]] }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setFormData((prev) => ({ ...prev, [section]: prev[section].filter((_: any, i: number) => i !== index) }));
  };

  const saveData = async () => {
    setSaveStatus("saving");
    try {
      const apiData = transformToApiFormat(formData);
      const res = await fetch("/api/admin/careers", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(apiData) });
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
            <span className="px-2 py-1 text-xs font-medium bg-brand-gold/20 text-brand-gold rounded-full">Careers</span>
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
              { id: "culture", label: "Culture" },
              { id: "benefits", label: "Benefits" },
              { id: "positions", label: "Positions" },
              { id: "testimonials", label: "Testimonials" },
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

          {activeTab === "culture" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-semibold text-brand-black">Culture</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title</label>
                <input type="text" value={formData.culture?.title ?? ""} onChange={(e) => handleChange("culture", { ...formData.culture, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Description</label>
                <textarea value={formData.culture?.description ?? ""} onChange={(e) => handleChange("culture", { ...formData.culture, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Values (one per line)</label>
                <textarea value={(formData.culture?.values ?? []).join("\n")} onChange={(e) => handleChange("culture", { ...formData.culture, values: e.target.value.split("\n").filter(v => v.trim()) })} rows={4} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
            </div>
          )}

          {activeTab === "benefits" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Benefits</h2>
                <button onClick={() => addArrayItem("benefits")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.benefits.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">Benefit #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("benefits", index)} className={cn(isEditing("benefits", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("benefits", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("benefits", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("benefits", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("benefits", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Icon</label><select value={item.icon} onChange={(e) => handleNestedChange("benefits", index, "icon", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none">{icons.map((i) => <option key={i} value={i}>{i}</option>)}</select></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Description</label><textarea value={item.description} onChange={(e) => handleNestedChange("benefits", index, "description", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-neutral-600"><p><strong>{item.title}</strong> ({item.icon})</p><p>{item.description}</p></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "positions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Open Positions</h2>
                <button onClick={() => addArrayItem("positions")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add Position</button>
              </div>
              {formData.positions.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">{item.title || `Position #${index + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("positions", index)} className={cn(isEditing("positions", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("positions", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("positions", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("positions", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("positions", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Department</label><input type="text" value={item.department} onChange={(e) => handleNestedChange("positions", index, "department", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Location</label><input type="text" value={item.location} onChange={(e) => handleNestedChange("positions", index, "location", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Type</label><select value={item.type} onChange={(e) => handleNestedChange("positions", index, "type", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none"><option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contract">Contract</option><option value="Internship">Internship</option></select></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Description</label><textarea value={item.description} onChange={(e) => handleNestedChange("positions", index, "description", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Requirements (one per line)</label>
                        <textarea value={(item.requirements ?? []).join("\n")} onChange={(e) => handleNestedChange("positions", index, "requirements", e.target.value.split("\n").filter(r => r.trim()))} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-neutral-600">
                      <p><strong>{item.title}</strong> — {item.department} — {item.location} — {item.type}</p>
                      <p>{item.description}</p>
                      <p className="text-sm"><strong>Requirements:</strong> {item.requirements?.join(", ")}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Team Testimonials</h2>
                <button onClick={() => addArrayItem("testimonials")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.testimonials.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">{item.name || `Testimonial #${index + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("testimonials", index)} className={cn(isEditing("testimonials", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("testimonials", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("testimonials", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("testimonials", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Name</label><input type="text" value={item.name} onChange={(e) => handleNestedChange("testimonials", index, "name", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Role</label><input type="text" value={item.role} onChange={(e) => handleNestedChange("testimonials", index, "role", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Years at Company</label><input type="number" value={item.yearsAtCompany ?? 1} onChange={(e) => handleNestedChange("testimonials", index, "yearsAtCompany", parseInt(e.target.value) || 1)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Quote</label><textarea value={item.quote} onChange={(e) => handleNestedChange("testimonials", index, "quote", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-neutral-600"><p className="italic">&ldquo;{item.quote}&rdquo;</p><p className="text-sm"><strong>{item.name}</strong>, {item.role} {item.yearsAtCompany && `(${item.yearsAtCompany} years)`}</p></div>
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