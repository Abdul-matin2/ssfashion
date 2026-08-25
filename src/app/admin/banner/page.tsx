"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface BannerData {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  discountText: string;
  discountLabel: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  imageAlt: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  badgeColor: string;
}

const DEFAULT_BANNER: BannerData = {
  enabled: true,
  badge: "Limited Time Only",
  title: "Summer Sale",
  subtitle: "",
  discountText: "40%",
  discountLabel: "OFF",
  ctaText: "Shop the Sale",
  ctaLink: "/shop?sale=true",
  image: "",
  imageAlt: "",
  backgroundColor: "brand-black",
  textColor: "brand-white",
  accentColor: "brand-gold",
  badgeColor: "brand-red",
};

const COLOR_OPTIONS = [
  { value: "brand-black", label: "Black" },
  { value: "brand-white", label: "White" },
  { value: "brand-gold", label: "Gold" },
  { value: "brand-orange", label: "Orange" },
  { value: "brand-red", label: "Red" },
  { value: "brand-green", label: "Green" },
  { value: "brand-accent-hover", label: "Accent Hover" },
];

export default function AdminBannerPage() {
  const [banner, setBanner] = useState<BannerData>(DEFAULT_BANNER);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchBanner = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banner");
      if (res.ok) {
        const data = await res.json();
        setBanner({ ...DEFAULT_BANNER, ...data });
      }
    } catch (error) {
      console.error("Error fetching banner:", error);
      setMessage({ type: "error", text: "Failed to load banner configuration" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanner();
  }, [fetchBanner]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBanner((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (checked: boolean) => {
    setBanner((prev) => ({ ...prev, enabled: checked }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setBanner((prev) => ({ ...prev, image: data.url }));
        setMessage({ type: "success", text: "Image uploaded successfully!" });
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.error || "Failed to upload image" });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({ type: "error", text: "Failed to upload image" });
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Banner updated successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to update banner" });
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      setMessage({ type: "error", text: "Failed to update banner" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-black transition-colors mb-4"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black">Sales Banner</h1>
        <p className="text-neutral-600 mt-1">Manage the promotional banner displayed on the homepage.</p>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={cn(
            "mb-6 rounded-xl p-4 text-sm font-medium",
            message.type === "success"
              ? "bg-brand-green/10 text-brand-green"
              : "bg-brand-red/10 text-brand-red"
          )}
        >
          {message.text}
        </div>
      )}

      {/* Banner Preview */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-brand-black mb-4">Live Preview</h2>
        <div className={cn("rounded-2xl overflow-hidden", !banner.enabled && "opacity-40")}>
          <div className={cn("bg-brand-black text-brand-white p-8 lg:p-12")}>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                {banner.badge && (
                  <span className={cn("inline-block px-4 py-1.5 bg-brand-red/20 text-brand-red text-sm font-semibold rounded-full mb-4")}>
                    {banner.badge || "Badge"}
                  </span>
                )}
                <h3 className={cn("text-3xl lg:text-4xl font-black mb-4")}>
                  {banner.title || "Banner Title"}
                </h3>
                {banner.subtitle && (
                  <p className="text-neutral-400 mb-6">{banner.subtitle}</p>
                )}
                {banner.discountText && (
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={cn("text-5xl font-black text-brand-gold")}>
                      {banner.discountText}
                    </span>
                    <span className="text-xl font-bold text-brand-gold">{banner.discountLabel}</span>
                  </div>
                )}
                {banner.ctaText && (
                  <span className="inline-block px-6 py-3 bg-brand-white text-brand-black font-medium rounded-lg">
                    {banner.ctaText}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center">
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.imageAlt || banner.title}
                    className="max-w-xs rounded-2xl shadow-2xl"
                  />
                ) : (
                  <div className="w-48 h-48 bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-500">
                    No image
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-2xl p-6 lg:p-8 space-y-6">
        <h2 className="text-lg font-bold text-brand-black">Banner Settings</h2>

        {/* Enable/Disable */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <p className="font-medium text-brand-black">Show Banner</p>
            <p className="text-sm text-neutral-500">Toggle visibility on homepage</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={banner.enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-black"></div>
          </label>
        </div>

        {/* Badge */}
        <div>
          <label htmlFor="badge" className="block text-sm font-medium text-brand-black mb-1.5">
            Badge Text
          </label>
          <input
            id="badge"
            name="badge"
            type="text"
            value={banner.badge}
            onChange={handleChange}
            placeholder="Limited Time Only"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-brand-black mb-1.5">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={banner.title}
            onChange={handleChange}
            placeholder="Summer Sale"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-brand-black mb-1.5">
            Subtitle <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="subtitle"
            name="subtitle"
            rows={3}
            value={banner.subtitle}
            onChange={handleChange}
            placeholder="Get up to 40% off..."
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 resize-none"
          />
        </div>

        {/* Discount Text & Label */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="discountText" className="block text-sm font-medium text-brand-black mb-1.5">
              Discount Text
            </label>
            <input
              id="discountText"
              name="discountText"
              type="text"
              value={banner.discountText}
              onChange={handleChange}
              placeholder="40%"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label htmlFor="discountLabel" className="block text-sm font-medium text-brand-black mb-1.5">
              Discount Label
            </label>
            <input
              id="discountLabel"
              name="discountLabel"
              type="text"
              value={banner.discountLabel}
              onChange={handleChange}
              placeholder="OFF"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
        </div>

        {/* CTA Text & Link */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ctaText" className="block text-sm font-medium text-brand-black mb-1.5">
              Button Text
            </label>
            <input
              id="ctaText"
              name="ctaText"
              type="text"
              value={banner.ctaText}
              onChange={handleChange}
              placeholder="Shop the Sale"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label htmlFor="ctaLink" className="block text-sm font-medium text-brand-black mb-1.5">
              Button Link
            </label>
            <input
              id="ctaLink"
              name="ctaLink"
              type="text"
              value={banner.ctaLink}
              onChange={handleChange}
              placeholder="/shop?sale=true"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">
            Banner Image
          </label>
          <div className="space-y-3">
            {/* File Upload */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="image-upload"
                className={cn(
                  "flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                  "border-neutral-300 hover:border-brand-gold hover:bg-neutral-50"
                )}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
                <div className="flex flex-col items-center gap-2">
                  <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-brand-black">Drag & drop or click to upload</span>
                  <span className="text-xs text-neutral-500">JPEG, PNG, WebP, GIF up to 5MB</span>
                </div>
              </label>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-brand-gold">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-gold border-t-transparent" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-brand-black mb-1.5">
                Or enter Image URL
              </label>
              <input
                id="image"
                name="image"
                type="text"
                value={banner.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              />
            </div>

            {/* Current image preview */}
            {banner.image && (
              <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
                <img
                  src={banner.image}
                  alt={banner.imageAlt || "Current banner"}
                  className="h-16 w-auto rounded-lg object-cover"
                />
                <span className="text-sm text-neutral-600 truncate flex-1">{banner.image}</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Alt */}
        <div>
          <label htmlFor="imageAlt" className="block text-sm font-medium text-brand-black mb-1.5">
            Image Alt Text
          </label>
          <input
            id="imageAlt"
            name="imageAlt"
            type="text"
            value={banner.imageAlt}
            onChange={handleChange}
            placeholder="Summer Sale Collection"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>

        {/* Color pickers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium text-brand-black mb-1.5">
              Background
            </label>
            <select
              id="backgroundColor"
              name="backgroundColor"
              value={banner.backgroundColor}
              onChange={handleChange}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="textColor" className="block text-sm font-medium text-brand-black mb-1.5">
              Text Color
            </label>
            <select
              id="textColor"
              name="textColor"
              value={banner.textColor}
              onChange={handleChange}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="accentColor" className="block text-sm font-medium text-brand-black mb-1.5">
              Accent Color
            </label>
            <select
              id="accentColor"
              name="accentColor"
              value={banner.accentColor}
              onChange={handleChange}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="badgeColor" className="block text-sm font-medium text-brand-black mb-1.5">
              Badge Color
            </label>
            <select
              id="badgeColor"
              name="badgeColor"
              value={banner.badgeColor}
              onChange={handleChange}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
          <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={fetchBanner} disabled={isSaving}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
