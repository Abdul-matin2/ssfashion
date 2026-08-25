"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { SortDropdown } from "@/components/shop/SortDropdown";
import { Brand, Category, Gender, SortOption } from "@/types/product";

export default function ShopClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();

  // Filter state
  const [filters, setFilters] = useState({
    brands: [] as Brand[],
    categories: [] as Category[],
    sizes: [] as string[],
    priceRange: [0, 150000] as [number, number],
    genders: [] as Gender[],
  });

  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Parse URL search params on mount (client-side only)
  useEffect(() => {
    setIsClient(true);
    const params = new URLSearchParams(window.location.search);
    const initialFilters = { ...filters };
    let hasChanges = false;

    if (params.get("brand")) {
      initialFilters.brands = [params.get("brand")! as Brand];
      hasChanges = true;
    }
    if (params.get("category")) {
      initialFilters.categories = [params.get("category")! as Category];
      hasChanges = true;
    }
    if (params.get("gender")) {
      initialFilters.genders = [params.get("gender")! as Gender];
      hasChanges = true;
    }
    if (params.get("sale") === "true") {
      // Sale is handled in filtering logic
      hasChanges = true;
    }
    if (params.get("new") === "true") {
      // New is handled in filtering logic
      hasChanges = true;
    }
    if (params.get("sort")) {
      setSortBy(params.get("sort")! as SortOption);
    }
    if (params.get("view") === "brands") {
      // Handled in filtering
    }

    if (hasChanges) {
      setFilters(initialFilters);
    }
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!isClient) return products; // Return all products during SSR

    const params = new URLSearchParams(window.location.search);
    const isSale = params.get("sale") === "true";
    const isNew = params.get("new") === "true";

    return products.filter((product) => {
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }

      // Gender filter
      if (filters.genders.length > 0 && !filters.genders.includes(product.gender)) {
        return false;
      }

      // Size filter
      if (filters.sizes.length > 0) {
        const hasMatchingSize = product.sizes.some((s) =>
          filters.sizes.includes(s.value) && s.inStock
        );
        if (!hasMatchingSize) return false;
      }

      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Sale filter (from URL)
      if (isSale && !product.compareAtPrice) {
        return false;
      }

      // New filter (from URL)
      if (isNew && !product.isNew) {
        return false;
      }

      return true;
    });
  }, [products, filters, isClient]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "newest":
        return sorted.sort((a, b) => (b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1));
      case "featured":
      default:
        return sorted.sort((a, b) => (a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1));
    }
  }, [filteredProducts, sortBy]);

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearAllFilters = () => {
    setFilters({
      brands: [],
      categories: [],
      sizes: [],
      priceRange: [0, 150000],
      genders: [],
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-black mb-2">Shop</h1>
          <p className="text-neutral-600">
            Discover our collection of authentic sneakers, shoes, and slides from top brands.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="sm:hidden px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-brand-black hover:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            {filters.brands.length > 0 || filters.categories.length > 0 || filters.sizes.length > 0 ||
             filters.genders.length > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 150000 ? (
              <button
                onClick={clearAllFilters}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-gold hover:text-brand-accent-hover transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)} />
            <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-drawer animate-in slide-in-from-right-full duration-300 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-brand-black">Filters</h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 text-neutral-500 hover:text-brand-black hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  productCount={filteredProducts.length}
                />
              </div>
              <div className="p-4 border-t border-neutral-200 sticky bottom-0 bg-white">
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-3 text-sm font-medium text-brand-gold hover:text-brand-accent-hover transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              productCount={filteredProducts.length}
            />
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16 lg:py-24">
                <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-brand-black mb-2">No products found</h2>
                <p className="text-neutral-500 mb-6">Try adjusting your filters or search terms.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-brand-gold hover:text-brand-accent-hover font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" role="list" aria-label="Products">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="group"
                    />
                  ))}
                </div>

                {/* Load More / Pagination placeholder */}
                {sortedProducts.length >= 12 && (
                  <div className="text-center mt-10">
                    <button className="px-8 py-3 bg-neutral-100 text-brand-black font-medium rounded-xl hover:bg-neutral-200 transition-colors">
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}