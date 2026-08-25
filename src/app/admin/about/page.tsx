"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const uploadImage = async (file: File, folder: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    if (res.ok && result.url) {
      return result.url;
    }
    console.error("Upload failed:", result.error);
    return null;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

interface AboutData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
  };
  mission: {
    title: string;
    content: string;
    icon: string;
  };
  vision: {
    title: string;
    content: string;
    icon: string;
  };
  values: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  story: {
    title: string;
    content: string[];
    image: string;
  };
  team: Array<{
    name: string;
    role: string;
    bio: string;
    image: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

const icons = ["target", "eye", "shield", "heart", "star", "truck"];

export default function AdminAboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [editingValueIndex, setEditingValueIndex] = useState<number | null>(null);
  const [editingTeamIndex, setEditingTeamIndex] = useState<number | null>(null);
  const [editingStatIndex, setEditingStatIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<AboutData>>({});

  const tabs = [
    { id: "hero", label: "Hero" },
    { id: "mission", label: "Mission" },
    { id: "vision", label: "Vision" },
    { id: "values", label: "Values" },
    { id: "story", label: "Story" },
    { id: "team", label: "Team" },
    { id: "stats", label: "Stats" },
  ];

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/about");
      const result = await res.json();
      if (result && !result.error) setData(result);
    } catch (error) {
      console.error("Failed to fetch about data:", error);
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
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "About content updated successfully!" });
        setData(updatedData);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update content" });
      }
    } catch (error) {
      console.error("Failed to save about data:", error);
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

  const handleArrayChange = (arrayPath: string, index: number, field: string, value: string) => {
    const array = formData[arrayPath as keyof typeof formData] as any[] || (data ? data[arrayPath as keyof typeof data] : []);
    const newArray = [...array];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData({ ...formData, [arrayPath]: newArray });
  };

  const addArrayItem = (arrayPath: string, newItem: any) => {
    const array = formData[arrayPath as keyof typeof formData] as any[] || (data ? data[arrayPath as keyof typeof data] : []);
    const newArray = [...array, newItem];
    setFormData({ ...formData, [arrayPath]: newArray });
    // Auto-enter edit mode for team members so upload is visible
    if (arrayPath === "team") {
      setEditingTeamIndex(newArray.length - 1);
    }
  };

  const removeArrayItem = (arrayPath: string, index: number) => {
    const array = formData[arrayPath as keyof typeof formData] as any[] || (data ? data[arrayPath as keyof typeof data] : []);
    const newArray = array.filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayPath]: newArray });
  };

  const resetForm = () => {
    setFormData({});
    setEditingValueIndex(null);
    setEditingTeamIndex(null);
    setEditingStatIndex(null);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Manage About Page</h1>
          <p className="text-neutral-500 mt-1">Edit all sections of the About Us page</p>
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

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200 overflow-x-auto">
          <nav className="flex gap-1 p-1" role="tablist" aria-label="About page sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); resetForm(); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-brand-black text-brand-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-brand-black"
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        <div className="p-6">
          {/* Hero Tab */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-brand-black">Hero Section</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.hero?.title ?? data.hero.title ?? ""}
                  onChange={(e) => handleChange("hero.title", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Subtitle *</label>
                <input
                  type="text"
                  value={formData.hero?.subtitle ?? data.hero.subtitle ?? ""}
                  onChange={(e) => handleChange("hero.subtitle", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Description *</label>
                <textarea
                  value={formData.hero?.description ?? data.hero.description ?? ""}
                  onChange={(e) => handleChange("hero.description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Background Image</label>
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value={formData.hero?.image || data.hero.image}
                    onChange={(e) => handleChange("hero.image", e.target.value)}
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                    placeholder="/images/about/hero.jpg"
                    readOnly
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="hero-image-upload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImage(file, "about");
                        if (url) handleChange("hero.image", url);
                      }
                      // Reset the input value
                      const input = e.target as HTMLInputElement;
                      if (input) input.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("hero-image-upload")?.click()}
                    className="h-11"
                    aria-label="Upload hero image"
                  >
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Upload
                  </Button>
                  {(formData.hero?.image ?? data.hero.image ?? "") && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 text-red-600 hover:bg-red-50"
                      onClick={() => handleChange("hero.image", "")}
                      aria-label="Remove hero image"
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </Button>
                  )}
                </div>
                {(formData.hero?.image ?? data.hero.image ?? "") && (
                  <div className="mt-2">
                    <img
                      src={formData.hero?.image ?? data.hero.image ?? ""}
                      alt="Preview"
                      className="h-24 w-auto rounded-lg border border-neutral-200 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mission Tab */}
          {activeTab === "mission" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-brand-black">Mission</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.mission?.title ?? data.mission.title ?? ""}
                  onChange={(e) => handleChange("mission.title", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Content *</label>
                <textarea
                  value={formData.mission?.content ?? data.mission.content ?? ""}
                  onChange={(e) => handleChange("mission.content", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Icon</label>
                <select
                  value={formData.mission?.icon ?? data.mission.icon ?? "target"}
                  onChange={(e) => handleChange("mission.icon", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                >
                  {icons.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Vision Tab */}
          {activeTab === "vision" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-brand-black">Vision</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.vision?.title ?? data.vision.title ?? ""}
                  onChange={(e) => handleChange("vision.title", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Content *</label>
                <textarea
                  value={formData.vision?.content ?? data.vision.content ?? ""}
                  onChange={(e) => handleChange("vision.content", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Icon</label>
                <select
                  value={formData.vision?.icon ?? data.vision.icon ?? "eye"}
                  onChange={(e) => handleChange("vision.icon", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                >
                  {icons.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Values Tab */}
          {activeTab === "values" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-black">Core Values</h2>
                <Button variant="outline" size="sm" onClick={() => addArrayItem("values", { title: "", description: "", icon: "shield" })}>
                  + Add Value
                </Button>
              </div>
              {(formData.values || data.values).map((value, index) => (
                <div key={index} className="bg-neutral-50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-brand-black">Value #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      {editingValueIndex === index ? (
                        <>
                          <Button variant="primary" size="sm" onClick={() => { handleSave(); setEditingValueIndex(null); }}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingValueIndex(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => setEditingValueIndex(index)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => removeArrayItem("values", index)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Title *</label>
                      <input
                        type="text"
                        value={editingValueIndex === index ? (formData.values?.[index]?.title ?? value.title ?? "") : value.title ?? ""}
                        onChange={(e) => handleArrayChange("values", index, "title", e.target.value)}
                        disabled={editingValueIndex !== index}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Icon</label>
                      <select
                        value={editingValueIndex === index ? (formData.values?.[index]?.icon ?? value.icon ?? "shield") : value.icon ?? "shield"}
                        onChange={(e) => handleArrayChange("values", index, "icon", e.target.value)}
                        disabled={editingValueIndex !== index}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                      >
                        {icons.map((icon) => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">Description *</label>
                    <textarea
                      value={editingValueIndex === index ? (formData.values?.[index]?.description ?? value.description ?? "") : value.description ?? ""}
                      onChange={(e) => handleArrayChange("values", index, "description", e.target.value)}
                      disabled={editingValueIndex !== index}
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Story Tab */}
          {activeTab === "story" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-brand-black">Our Story</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.story?.title ?? data.story.title ?? ""}
                  onChange={(e) => handleChange("story.title", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Content (one paragraph per line) *</label>
                <textarea
                  value={(formData.story?.content || data.story.content).join("\n\n")}
                  onChange={(e) => {
                    const paragraphs = e.target.value.split("\n\n").filter(Boolean);
                    // Use a special handler for array content
                    const newFormData = { ...formData };
                    newFormData.story = {
                      ...(newFormData.story || { title: data.story.title, image: data.story.image }),
                      content: paragraphs
                    };
                    setFormData(newFormData);
                  }}
                  rows={8}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Image</label>
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value={formData.story?.image ?? data.story.image ?? ""}
                    onChange={(e) => handleChange("story.image", e.target.value)}
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                    placeholder="/images/about/story.jpg"
                    readOnly
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="story-image-upload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      const input = e.target as HTMLInputElement;
                      if (file) {
                        const url = await uploadImage(file, "about");
                        if (url) handleChange("story.image", url);
                        if (input) input.value = "";
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("story-image-upload")?.click()}
                    className="h-11"
                    aria-label="Upload story image"
                  >
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Upload
                  </Button>
                  {(formData.story?.image ?? data.story.image ?? "") && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 text-red-600 hover:bg-red-50"
                      onClick={() => handleChange("story.image", "")}
                      aria-label="Remove story image"
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </Button>
                  )}
                </div>
                {(formData.story?.image ?? data.story.image ?? "") && (
                  <div className="mt-2">
                    <img
                      src={formData.story?.image ?? data.story.image ?? ""}
                      alt="Preview"
                      className="h-24 w-auto rounded-lg border border-neutral-200 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-black">Team Members</h2>
                <Button variant="outline" size="sm" onClick={() => addArrayItem("team", { name: "", role: "", bio: "", image: "" })}>
                  + Add Team Member
                </Button>
              </div>
              {(formData.team || data.team).map((member, index) => (
                <div key={index} className="bg-neutral-50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-brand-black">Team Member #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      {editingTeamIndex === index ? (
                        <>
                          <Button variant="primary" size="sm" onClick={() => { handleSave(); setEditingTeamIndex(null); }}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingTeamIndex(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => setEditingTeamIndex(index)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => removeArrayItem("team", index)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Name *</label>
                      <input
                        type="text"
                        value={editingTeamIndex === index ? (formData.team?.[index]?.name ?? member.name ?? "") : member.name ?? ""}
                        onChange={(e) => handleArrayChange("team", index, "name", e.target.value)}
                        disabled={editingTeamIndex !== index}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Role *</label>
                      <input
                        type="text"
                        value={editingTeamIndex === index ? (formData.team?.[index]?.role ?? member.role ?? "") : member.role ?? ""}
                        onChange={(e) => handleArrayChange("team", index, "role", e.target.value)}
                        disabled={editingTeamIndex !== index}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-brand-black mb-2">Bio *</label>
                      <textarea
                        value={editingTeamIndex === index ? (formData.team?.[index]?.bio ?? member.bio ?? "") : member.bio ?? ""}
                        onChange={(e) => handleArrayChange("team", index, "bio", e.target.value)}
                        disabled={editingTeamIndex !== index}
                        rows={3}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-brand-black mb-2">Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingTeamIndex === index ? (formData.team?.[index]?.image ?? member.image ?? "") : member.image ?? ""}
                          onChange={(e) => handleArrayChange("team", index, "image", e.target.value)}
                          disabled={editingTeamIndex !== index}
                          className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                          placeholder="/images/team/name.jpg"
                          readOnly
                        />
                        {editingTeamIndex === index && (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`team-image-upload-${index}`}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                const input = e.target as HTMLInputElement;
                                if (file) {
                                  const url = await uploadImage(file, "team");
                                  if (url) handleArrayChange("team", index, "image", url);
                                  if (input) input.value = "";
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById(`team-image-upload-${index}`)?.click()}
                              className="h-11"
                              aria-label={`Upload image for team member ${index + 1}`}
                            >
                              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Upload
                            </Button>
                            {(editingTeamIndex === index ? (formData.team?.[index]?.image ?? member.image ?? "") : member.image ?? "") && (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-11 text-red-600 hover:bg-red-50"
                                onClick={() => handleArrayChange("team", index, "image", "")}
                                aria-label={`Remove image for team member ${index + 1}`}
                              >
                                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      {(editingTeamIndex === index ? (formData.team?.[index]?.image ?? member.image ?? "") : member.image ?? "") && (
                        <div className="mt-2">
                          <img
                            src={editingTeamIndex === index ? (formData.team?.[index]?.image ?? member.image ?? "") : member.image ?? ""}
                            alt="Preview"
                            className="h-24 w-auto rounded-lg border border-neutral-200 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-black">Statistics</h2>
                <Button variant="outline" size="sm" onClick={() => addArrayItem("stats", { label: "", value: "" })}>
                  + Add Stat
                </Button>
              </div>
              {(formData.stats || data.stats).map((stat, index) => (
                <div key={index} className="bg-neutral-50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-brand-black">Stat #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      {editingStatIndex === index ? (
                        <>
                          <Button variant="primary" size="sm" onClick={() => { handleSave(); setEditingStatIndex(null); }}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingStatIndex(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => setEditingStatIndex(index)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => removeArrayItem("stats", index)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Label *</label>
                      <input
                        type="text"
                        value={editingStatIndex === index ? (formData.stats?.[index]?.label ?? stat.label ?? "") : stat.label ?? ""}
                        onChange={(e) => handleArrayChange("stats", index, "label", e.target.value)}
                        disabled={editingStatIndex !== index}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Value *</label>
                      <input
                        type="text"
                        value={editingStatIndex === index ? (formData.stats?.[index]?.value ?? stat.value ?? "") : stat.value ?? ""}
                        onChange={(e) => handleArrayChange("stats", index, "value", e.target.value)}
                        disabled={editingStatIndex !== index}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors disabled:bg-neutral-100"
                      />
                    </div>
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