"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Product, Brand, Category } from "@/types/product";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<Brand | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "featured" | "new" | "sale" | "out-of-stock">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-asc" | "price-desc" | "name">("newest");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const BRANDS: Brand[] = [
    "Nike", "Adidas", "Puma", "New Balance", "Converse", "Vans", "Jordan", "Reebok", "Fila", "Skechers", "Other"
  ];
  const CATEGORIES: Category[] = [
    "Running", "Lifestyle", "Basketball", "Training", "Sneakers", "Slides", "Boots"
  ];

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("An error occurred");
    }
  };

  const filteredProducts = products
    .filter((p) => {
      if (search) {
        const query = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(query) &&
          !p.slug.toLowerCase().includes(query) &&
          !p.brand.toLowerCase().includes(query)
        ) return false;
      }
      if (brandFilter !== "all" && p.brand !== brandFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (statusFilter === "featured" && !p.isFeatured) return false;
      if (statusFilter === "new" && !p.isNew) return false;
      if (statusFilter === "sale" && !p.compareAtPrice) return false;
      if (
        statusFilter === "out-of-stock" &&
        p.sizes.some((s) => s.inStock)
      ) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "newest":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-black">Products</h1>
          <p className="text-neutral-600 mt-1">
            Manage your product catalog — {filteredProducts.length} of {products.length} products
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="lg">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
            />
          </div>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value as Brand | "all")}
            className="px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
          >
            <option value="all">All Brands</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | "all")}
            className="px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
          >
            <option value="all">All Status</option>
            <option value="featured">Featured</option>
            <option value="new">New Arrivals</option>
            <option value="sale">On Sale</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-gold border-t-transparent mx-auto" />
            <p className="mt-4 text-neutral-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-neutral-500 mb-4">No products found matching your filters.</p>
            <Link href="/admin/products/new">
              <Button variant="primary" size="sm">Add First Product</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Product</th>
                    <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Brand</th>
                    <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                    <th className="text-right py-3 px-4 sm:px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Price</th>
                    <th className="text-center py-3 px-4 sm:px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                    <th className="text-center py-3 px-4 sm:px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="text-right py-3 px-4 sm:px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-50">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]?.url || "/images/placeholder.png"}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded-lg bg-neutral-100"
                          />
                          <div>
                            <Link href={`/admin/products/${product.id}/edit`} className="font-medium text-brand-black hover:text-brand-gold">
                              {product.name}
                            </Link>
                            <p className="text-xs text-neutral-500">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                        <span className="text-sm text-neutral-700">{product.brand || "—"}</span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 hidden lg:table-cell">
                        <span className="text-sm text-neutral-700">{product.category || "—"}</span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right font-medium text-brand-black hidden sm:table-cell">
                        {formatPrice(product.price)}
                        {product.compareAtPrice && (
                          <span className="ml-2 text-sm text-neutral-400 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center hidden sm:table-cell">
                        <span className={cn("text-sm font-medium", product.sizes.some((s) => s.inStock) ? "text-green-600" : "text-brand-red")}>
                          {product.sizes.filter((s) => s.inStock).length} / {product.sizes.length} sizes
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1.5">
                          {product.isFeatured && <Badge variant="featured" size="sm">Featured</Badge>}
                          {product.isNew && <Badge variant="new" size="sm">New</Badge>}
                          {product.compareAtPrice && <Badge variant="sale" size="sm">Sale</Badge>}
                          {product.sizes.filter((s) => s.inStock).length === 0 && <Badge variant="out-of-stock" size="sm">Out of Stock</Badge>}
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-sm text-brand-gold hover:text-brand-accent-hover font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-sm text-brand-red hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}