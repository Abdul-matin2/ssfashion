"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Product, Brand, Category, Gender, ProductSize, ProductColor, ProductImage } from "@/types/product";
import { cn } from "@/lib/utils";

const BRANDS: Brand[] = [
  "Nike", "Adidas", "Puma", "New Balance", "Converse", "Vans", "Jordan", "Reebok", "Fila", "Skechers", "Other"
];
const CATEGORIES: Category[] = [
  "Running", "Lifestyle", "Basketball", "Training", "Sneakers", "Slides", "Boots"
];
const GENDERS: Gender[] = ["Men", "Women", "Kids", "Unisex"];
const DEFAULT_SIZES: string[] = ["6", "7", "8", "9", "10", "11", "12"];

interface ProductFormProps {
  initialData?: Product;
  mode: "create" | "edit";
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [brand, setBrand] = useState<Brand>(initialData?.brand || "Nike");
  const [category, setCategory] = useState<Category>(initialData?.category || "Lifestyle");
  const [gender, setGender] = useState<Gender>(initialData?.gender || "Unisex");
  const [price, setPrice] = useState(initialData ? String(initialData.price / 100) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compareAtPrice ? String(initialData.compareAtPrice / 100) : "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isNew, setIsNew] = useState(initialData?.isNew ?? true);
  const [rating, setRating] = useState(initialData?.rating ? String(initialData.rating) : "0");
  const [reviewCount, setReviewCount] = useState(initialData?.reviewCount ? String(initialData.reviewCount) : "0");
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");

  // Sizes
  const [sizes, setSizes] = useState<ProductSize[]>(
    initialData?.sizes || DEFAULT_SIZES.map((s) => ({ value: s, inStock: true }))
  );
  const [newSize, setNewSize] = useState("");

  // Colors
  const [colors, setColors] = useState<ProductColor[]>(
    initialData?.colors || []
  );
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  // Images
  const [images, setImages] = useState<ProductImage[]>(
    initialData?.images || []
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (mode === "create" && !slug) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  // Size management
  const toggleSizeStock = (index: number) => {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, inStock: !s.inStock } : s))
    );
  };
  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };
  const addSize = () => {
    if (newSize && !sizes.find((s) => s.value === newSize)) {
      setSizes((prev) => [...prev, { value: newSize, inStock: true }]);
      setNewSize("");
    }
  };

  // Color management
  const addColor = () => {
    if (newColorName) {
      setColors((prev) => [
        ...prev,
        { name: newColorName, hex: newColorHex, image: "" },
      ]);
      setNewColorName("");
      setNewColorHex("#000000");
    }
  };
  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  // Image management
  const addImage = () => {
    if (newImageUrl) {
      setImages((prev) => [
        ...prev,
        { url: newImageUrl, alt: newImageAlt || name || "Product image" },
      ]);
      setNewImageUrl("");
      setNewImageAlt("");
    }
  };
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setError("Valid price is required");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      brand,
      category,
      gender,
      price: Math.round(parseFloat(price) * 100),
      compareAtPrice: compareAtPrice ? Math.round(parseFloat(compareAtPrice) * 100) : undefined,
      slug: slug || undefined,
      isFeatured,
      isNew,
      rating: parseFloat(rating) || 0,
      reviewCount: parseInt(reviewCount) || 0,
      description,
      shortDescription,
      tags,
      sizes,
      colors,
      images,
    };

    startTransition(async () => {
      try {
        const url = mode === "edit" && initialData
          ? `/api/admin/products/${initialData.id}`
          : "/api/admin/products";
        const method = mode === "edit" ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to save product");
          return;
        }

        router.push("/admin/products");
        router.refresh();
      } catch (err) {
        console.error("Save error:", err);
        setError("An error occurred. Please try again.");
      }
    });
  };

  // Image upload handler - uses Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Store both the Cloudinary URL and the public_id for future deletion
        setImages((prev) => [
          ...prev,
          { url: data.url, alt: file.name, public_id: data.public_id },
        ]);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-brand-red/10 border border-brand-red/30 rounded-xl p-4">
          <p className="text-sm text-brand-red">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-brand-black mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-brand-black mb-1">Product Name *</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              placeholder="e.g., Air Jordan 1 Retro High"
            />
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-brand-black mb-1">Brand *</label>
            <select
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value as Brand)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-brand-black mb-1">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-brand-black mb-1">Gender *</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-brand-black mb-1">Slug</label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              placeholder="auto-generated-from-name"
            />
            <p className="text-xs text-neutral-500 mt-1">Leave blank to auto-generate from name</p>
          </div>

          <div>
            <label htmlFor="shortDesc" className="block text-sm font-medium text-brand-black mb-1">Short Description</label>
            <input
              id="shortDesc"
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              placeholder="One-line summary"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-brand-black mb-1">Full Description</label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-y"
            placeholder="Detailed product description..."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-brand-black mb-4">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-brand-black mb-1">Price (GH₵) *</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              placeholder="e.g., 1150.00"
            />
            <p className="text-xs text-neutral-500 mt-1">Enter price in Cedis (stored as pesewas internally)</p>
          </div>
          <div>
            <label htmlFor="compareAt" className="block text-sm font-medium text-brand-black mb-1">Compare-at Price (GH₵)</label>
            <input
              id="compareAt"
              type="number"
              step="0.01"
              min="0"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              placeholder="e.g., 1450.00"
            />
            <p className="text-xs text-neutral-500 mt-1">Original price for sale items (leave empty if not on sale)</p>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-brand-black mb-4">Sizes</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {sizes.map((size, index) => (
            <div
              key={`${size.value}-${index}`}
              onClick={() => toggleSizeStock(index)}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center gap-1.5 cursor-pointer",
                size.inStock
                  ? "bg-brand-black text-brand-white border-brand-black"
                  : "bg-white text-neutral-400 border-neutral-300 line-through"
              )}
            >
              {size.value}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSize(index);
                }}
                className="text-brand-red hover:text-red-700"
                aria-label={`Remove size ${size.value}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
            className="w-24 px-3 py-2 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            placeholder="Size"
          />
          <Button type="button" variant="outline" size="sm" onClick={addSize}>Add Size</Button>
        </div>
        <p className="text-xs text-neutral-500 mt-2">Click a size to toggle in-stock status. Stocked sizes are black.</p>
      </section>

      {/* Colors */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-brand-black mb-4">Colors</h2>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {colors.map((color, index) => (
              <div
                key={`${color.name}-${index}`}
                className="flex items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2"
              >
                <span
                  className="w-5 h-5 rounded-full border border-neutral-300"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-sm text-brand-black">{color.name}</span>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-brand-red hover:text-red-700 text-sm"
                  aria-label={`Remove color ${color.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Color Name</label>
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              className="w-40 px-3 py-2 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              placeholder="e.g., Black"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Hex</label>
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-10 h-10 rounded-xl border border-neutral-300 cursor-pointer"
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addColor}>Add</Button>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-brand-black mb-4">Images</h2>
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full aspect-square object-cover rounded-xl bg-neutral-100 border border-neutral-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-brand-red text-brand-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  ×
                </button>
                <p className="text-xs text-neutral-500 mt-1 truncate">{img.alt}</p>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-3 mb-4">
          {/* File Upload - Cloudinary */}
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
                onChange={handleImageUpload}
                disabled={isUploading}
                className="sr-only"
              />
              <div className="flex flex-col items-center gap-2">
                <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-medium text-brand-black">Drag & drop or click to upload</span>
                <span className="text-xs text-neutral-500">JPEG, PNG, WebP, GIF up to 10MB</span>
              </div>
            </label>
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-brand-gold">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-gold border-t-transparent" />
                <span>Uploading to Cloudinary...</span>
              </div>
            )}
          </div>

          {/* Image URL fallback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              placeholder="Or enter Image URL"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                placeholder="Alt text"
              />
              <Button type="button" variant="outline" size="sm" onClick={addImage}>Add</Button>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-500">Upload images to Cloudinary or paste URLs. First image is the hero image.</p>
      </section>

      {/* Status & Metadata */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-brand-black mb-4">Status & Metadata</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-brand-gold focus:ring-brand-gold"
              />
              <span className="text-sm font-medium text-brand-black">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-brand-gold focus:ring-brand-gold"
              />
              <span className="text-sm font-medium text-brand-black">New Arrival</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-brand-black mb-1">Rating (0-5)</label>
              <input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="reviewCount" className="block text-sm font-medium text-brand-black mb-1">Review Count</label>
              <input
                id="reviewCount"
                type="number"
                min="0"
                value={reviewCount}
                onChange={(e) => setReviewCount(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="tags" className="block text-sm font-medium text-brand-black mb-1">Tags</label>
          <input
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            placeholder="e.g., basketball, retro, iconic"
          />
          <p className="text-xs text-neutral-500 mt-1">Comma-separated tags</p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="lg" isLoading={isPending}>
          {mode === "edit" ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}