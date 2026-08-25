"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorRole: string;
  authorImage: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: string;
  featured: boolean;
}

interface BlogData {
  hero: { title: string; subtitle: string };
  categories: string[];
  posts: BlogPost[];
  newsletter: { title: string; description: string; buttonText: string };
  [key: string]: any;
}

// Transform API data (single posts array with featured flag) to admin format (separate featuredPosts/posts)
function transformToAdminFormat(data: any): BlogData {
  const posts = data.posts || [];
  const featuredPosts = posts.filter((p: BlogPost) => p.featured);
  const regularPosts = posts.filter((p: BlogPost) => !p.featured);
  return {
    ...data,
    featuredPosts,
    posts: regularPosts,
  };
}

// Transform admin format back to API format (single posts array with featured flag)
function transformToApiFormat(data: BlogData): any {
  const allPosts = [
    ...(data.featuredPosts || []).map((p: BlogPost) => ({ ...p, featured: true })),
    ...(data.posts || []).map((p: BlogPost) => ({ ...p, featured: false })),
  ];
  const { featuredPosts, ...rest } = data;
  return { ...rest, posts: allPosts };
}

const defaultData: BlogData = {
  hero: { title: "The S&S Journal", subtitle: "Style guides, trend reports, and stories from the heart of African fashion" },
  featuredPosts: [
    { id: "1", title: "The Rise of African Streetwear: A Cultural Movement", excerpt: "How young designers across the continent are reshaping global fashion narratives through bold aesthetics and cultural pride.", content: "", coverImage: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800", author: "Kwame Osei", authorRole: "Style Editor", authorImage: "", category: "Culture", tags: [], publishedAt: "March 15, 2025", readTime: "8 min read", slug: "african-streetwear-rise", featured: true },
    { id: "2", title: "Sustainable Style: Building a Conscious Wardrobe", excerpt: "Practical tips for curating a closet that's both stylish and sustainable — without compromising on personal expression.", content: "", coverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800", author: "Ama Mensah", authorRole: "Senior Writer", authorImage: "", category: "Sustainability", tags: [], publishedAt: "March 8, 2025", readTime: "6 min read", slug: "sustainable-wardrobe", featured: true },
    { id: "3", title: "Behind the Seams: Our Spring Collection Story", excerpt: "An intimate look at the inspiration, craftsmanship, and people behind our latest seasonal offering.", content: "", coverImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800", author: "Kofi Asante", authorRole: "Editor", authorImage: "", category: "Behind the Scenes", tags: [], publishedAt: "March 1, 2025", readTime: "5 min read", slug: "spring-collection-story", featured: true },
  ],
  categories: ["All", "Culture", "Sustainability", "Style Guide", "Behind the Scenes", "Trends"],
  posts: [
    { id: "4", title: "How to Style Kente for Modern Occasions", excerpt: "Traditional fabric meets contemporary fashion — discover fresh ways to wear Ghana's most iconic textile.", content: "", coverImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800", author: "Efua Owusu", authorRole: "Style Editor", authorImage: "", category: "Style Guide", tags: [], publishedAt: "February 28, 2025", readTime: "4 min read", slug: "style-kente-modern", featured: false },
    { id: "5", title: "The Circular Fashion Economy Explained", excerpt: "Understanding how clothes can live multiple lives through recycling, upcycling, and conscious consumption.", content: "", coverImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800", author: "Ama Mensah", authorRole: "Senior Writer", authorImage: "", category: "Sustainability", tags: [], publishedAt: "February 22, 2025", readTime: "7 min read", slug: "circular-fashion-economy", featured: false },
    { id: "6", title: "5 Essential Pieces for Your Capsule Wardrobe", excerpt: "Build a versatile, timeless wardrobe with just five key pieces that work for every occasion.", content: "", coverImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800", author: "Kwame Osei", authorRole: "Style Editor", authorImage: "", category: "Style Guide", tags: [], publishedAt: "February 15, 2025", readTime: "5 min read", slug: "capsule-wardrobe-essentials", featured: false },
    { id: "7", title: "Meet the Artisans: Weavers of Bonwire", excerpt: "A journey to the historic kente weaving village where master craftsmen keep centuries-old traditions alive.", content: "", coverImage: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800", author: "Kofi Asante", authorRole: "Editor", authorImage: "", category: "Behind the Scenes", tags: [], publishedAt: "February 8, 2025", readTime: "9 min read", slug: "artisans-bonwire", featured: false },
    { id: "8", title: "Color Trends 2025: What's In for African Fashion", excerpt: "From earth tones to vibrant neons — the palette defining this year's most exciting collections.", content: "", coverImage: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800", author: "Efua Owusu", authorRole: "Style Editor", authorImage: "", category: "Trends", tags: [], publishedAt: "February 1, 2025", readTime: "6 min read", slug: "color-trends-2025", featured: false },
    { id: "9", title: "Why African Fashion is the Future of Global Style", excerpt: "Industry insiders weigh in on the growing influence of African designers on the international stage.", content: "", coverImage: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800", author: "Kwame Osei", authorRole: "Style Editor", authorImage: "", category: "Culture", tags: [], publishedAt: "January 25, 2025", readTime: "8 min read", slug: "african-fashion-future", featured: false },
  ],
  newsletter: { title: "Never Miss a Story", description: "Get the latest style guides, trend reports, and exclusive content delivered straight to your inbox.", buttonText: "Subscribe" },
};

export default function BlogAdminPage() {
  const [data, setData] = useState<BlogData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");
  const [editingIndex, setEditingIndex] = useState<{ section: string; index: number } | null>(null);
  const [formData, setFormData] = useState<BlogData>(defaultData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((d) => {
        if (d && !d.error) {
          const transformed = transformToAdminFormat(d);
          setData(transformed);
          setFormData(transformed);
        }
      })
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
      featuredPosts: { id: Date.now().toString(), title: "", excerpt: "", content: "", coverImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800", author: "", authorRole: "Writer", authorImage: "", category: "Culture", tags: [], publishedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), readTime: "5 min read", slug: "", featured: true },
      categories: "",
      posts: { id: Date.now().toString(), title: "", excerpt: "", content: "", coverImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800", author: "", authorRole: "Writer", authorImage: "", category: "Style Guide", tags: [], publishedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), readTime: "5 min read", slug: "", featured: false },
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
      const res = await fetch("/api/admin/blog", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(apiData) });
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
            <span className="px-2 py-1 text-xs font-medium bg-brand-gold/20 text-brand-gold rounded-full">Blog</span>
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
              { id: "featuredPosts", label: "Featured" },
              { id: "categories", label: "Categories" },
              { id: "posts", label: "Posts" },
              { id: "newsletter", label: "Newsletter" },
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

          {activeTab === "featuredPosts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Featured Posts</h2>
                <button onClick={() => addArrayItem("featuredPosts")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.featuredPosts.map((item: BlogPost, index: number) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">{item.title || `Featured Post #${index + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("featuredPosts", index)} className={cn(isEditing("featuredPosts", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("featuredPosts", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("featuredPosts", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("featuredPosts", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("featuredPosts", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Category</label><input type="text" value={item.category} onChange={(e) => handleNestedChange("featuredPosts", index, "category", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Published Date</label><input type="text" value={item.publishedAt} onChange={(e) => handleNestedChange("featuredPosts", index, "publishedAt", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Read Time</label><input type="text" value={item.readTime} onChange={(e) => handleNestedChange("featuredPosts", index, "readTime", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Author</label><input type="text" value={item.author} onChange={(e) => handleNestedChange("featuredPosts", index, "author", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Author Role</label><input type="text" value={item.authorRole} onChange={(e) => handleNestedChange("featuredPosts", index, "authorRole", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Slug</label><input type="text" value={item.slug} onChange={(e) => handleNestedChange("featuredPosts", index, "slug", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Author Image URL</label><input type="url" value={item.authorImage} onChange={(e) => handleNestedChange("featuredPosts", index, "authorImage", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Excerpt</label><textarea value={item.excerpt} onChange={(e) => handleNestedChange("featuredPosts", index, "excerpt", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Content</label><textarea value={item.content} onChange={(e) => handleNestedChange("featuredPosts", index, "content", e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Cover Image URL</label><input type="url" value={item.coverImage} onChange={(e) => handleNestedChange("featuredPosts", index, "coverImage", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Tags (comma-separated)</label><input type="text" value={item.tags?.join(", ") || ""} onChange={(e) => handleNestedChange("featuredPosts", index, "tags", e.target.value.split(",").map((t: string) => t.trim()))} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-neutral-600">
                      <p className="flex items-center gap-2"><span className="px-2 py-1 text-xs bg-brand-gold/10 text-brand-gold rounded-full">{item.category}</span><span className="text-sm">{item.publishedAt} · {item.readTime}</span></p>
                      <p>{item.excerpt}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">Categories</h2>
                <button onClick={() => addArrayItem("categories")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              <div className="space-y-3">
                {formData.categories.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
                    <input type="text" value={item} onChange={(e) => { const n = [...formData.categories]; n[index] = e.target.value; setFormData({ ...formData, categories: n }); }} className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-gold outline-none text-sm" />
                    <button onClick={() => removeArrayItem("categories", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "posts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">All Posts</h2>
                <button onClick={() => addArrayItem("posts")} className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl font-medium hover:bg-brand-gold/90 transition-colors">+ Add</button>
              </div>
              {formData.posts.map((item, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-brand-black">{item.title || `Post #${index + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleEdit("posts", index)} className={cn(isEditing("posts", index) ? "bg-brand-black text-brand-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200", "px-3 py-1 text-sm font-medium rounded-lg transition-colors")}>{isEditing("posts", index) ? "Cancel" : "Edit"}</button>
                      <button onClick={() => removeArrayItem("posts", index)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                  {isEditing("posts", index) ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Title</label><input type="text" value={item.title} onChange={(e) => handleNestedChange("posts", index, "title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Category</label><input type="text" value={item.category} onChange={(e) => handleNestedChange("posts", index, "category", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Published Date</label><input type="text" value={item.publishedAt} onChange={(e) => handleNestedChange("posts", index, "publishedAt", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Read Time</label><input type="text" value={item.readTime} onChange={(e) => handleNestedChange("posts", index, "readTime", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Author</label><input type="text" value={item.author} onChange={(e) => handleNestedChange("posts", index, "author", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Author Role</label><input type="text" value={item.authorRole} onChange={(e) => handleNestedChange("posts", index, "authorRole", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Slug</label><input type="text" value={item.slug} onChange={(e) => handleNestedChange("posts", index, "slug", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                        <div><label className="block text-sm font-medium text-brand-black mb-2">Author Image URL</label><input type="url" value={item.authorImage} onChange={(e) => handleNestedChange("posts", index, "authorImage", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      </div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Excerpt</label><textarea value={item.excerpt} onChange={(e) => handleNestedChange("posts", index, "excerpt", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Content</label><textarea value={item.content} onChange={(e) => handleNestedChange("posts", index, "content", e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Cover Image URL</label><input type="url" value={item.coverImage} onChange={(e) => handleNestedChange("posts", index, "coverImage", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                      <div><label className="block text-sm font-medium text-brand-black mb-2">Tags (comma-separated)</label><input type="text" value={item.tags?.join(", ") || ""} onChange={(e) => handleNestedChange("posts", index, "tags", e.target.value.split(",").map((t: string) => t.trim()))} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" /></div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-neutral-600">
                      <p className="flex items-center gap-2"><span className="px-2 py-1 text-xs bg-brand-gold/10 text-brand-gold rounded-full">{item.category}</span><span className="text-sm">{item.publishedAt} · {item.readTime}</span></p>
                      <p>{item.excerpt}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "newsletter" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-semibold text-brand-black">Newsletter Signup</h2>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Title</label>
                <input type="text" value={formData.newsletter?.title ?? ""} onChange={(e) => handleChange("newsletter", { ...formData.newsletter, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Description</label>
                <textarea value={formData.newsletter?.description ?? ""} onChange={(e) => handleChange("newsletter", { ...formData.newsletter, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Button Text</label>
                <input type="text" value={formData.newsletter?.buttonText ?? ""} onChange={(e) => handleChange("newsletter", { ...formData.newsletter, buttonText: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}