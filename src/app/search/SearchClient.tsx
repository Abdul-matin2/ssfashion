"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

interface SearchClientProps {
  products: Product[];
}

export function SearchClient({ products }: SearchClientProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  const searchResults = useMemo(() => {
    if (!isClient || !query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    return products.filter((product) => {
      const brandName = typeof product.brand === "string" ? product.brand : "";
      const categoryName = typeof product.category === "string" ? product.category : "";
      const searchableText = [
        product.name,
        brandName,
        categoryName,
        product.shortDescription || "",
        product.description,
        ...product.tags,
      ].join(" ").toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }, [query, isClient, products]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // The URL will update automatically since we're using useSearchParams
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-brand-gold">Loading search...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 lg:mb-12">
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full px-6 py-4 pl-12 text-lg border-2 border-neutral-200 rounded-2xl focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 bg-white"
                autoFocus
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {query && (
            <p className="mt-4 text-neutral-600">
              Showing <span className="font-medium text-brand-black">{searchResults.length}</span> result{searchResults.length !== 1 ? "s" : ""} for <span className="font-medium text-brand-black">"{query}"</span>
            </p>
          )}
        </div>

        {query ? (
          searchResults.length > 0 ? (
            <>
              {/* Search Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6" role="list" aria-label="Search results">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>

              {/* No Results */}
            </>
          ) : (
            <div className="text-center py-16 lg:py-24">
              <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-brand-black mb-2">No results found</h2>
              <p className="text-neutral-500 mb-6">We couldn't find any products matching "<span className="font-medium text-brand-black">{query}</span>".</p>
              <div className="space-y-2 text-sm text-neutral-500">
                <p>Try:</p>
                <ul className="list-disc list-inside text-left max-w-xs mx-auto space-y-1">
                  <li>Checking your spelling</li>
                  <li>Using more general terms</li>
                  <li>Searching by brand name (e.g., "Nike", "Adidas")</li>
                  <li>Searching by category (e.g., "Running", "Slides")</li>
                </ul>
              </div>
            </div>
          )
        ) : (
          /* Empty Search State - Show suggestions */
          <div className="space-y-8">
            {/* Popular Searches */}
            <section>
              <h2 className="text-lg font-semibold text-brand-black mb-4">Popular Searches</h2>
              <div className="flex flex-wrap gap-2">
                {["Nike", "Adidas", "Jordan", "Running", "Slides", "New Arrivals", "Sale", "Sneakers"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-neutral-50 text-brand-black border border-neutral-200 rounded-xl hover:border-brand-gold hover:text-brand-gold transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            {/* Categories */}
            <section>
              <h2 className="text-lg font-semibold text-brand-black mb-4">Shop by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Running", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                  { name: "Lifestyle", icon: "M5 8h14M5 8a2 2 0 110-2h14a2 2 0 110 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
                  { name: "Basketball", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2M9 19l-12-3v13" },
                  { name: "Slides", icon: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setQuery(cat.name)}
                    className="p-4 bg-white border border-neutral-200 rounded-2xl hover:border-brand-gold hover:shadow-sm transition-all text-center"
                  >
                    <svg className="h-8 w-8 text-brand-gold mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                    </svg>
                    <p className="font-medium text-brand-black">{cat.name}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Brands */}
            <section>
              <h2 className="text-lg font-semibold text-brand-black mb-4">Top Brands</h2>
              <div className="flex flex-wrap gap-2">
                {["Nike", "Adidas", "Jordan", "Puma", "New Balance", "Converse", "Vans", "Reebok", "Fila", "Skechers"].map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setQuery(brand)}
                    className="px-4 py-2 bg-white text-brand-black border border-neutral-200 rounded-xl hover:border-brand-gold hover:text-brand-gold transition-colors"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}