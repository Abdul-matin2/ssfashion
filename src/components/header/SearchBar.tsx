"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SearchProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: number;
  images: { url: string; alt: string }[];
}

export function SearchBar({
  className,
}: {
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (debouncedQuery.trim().length >= 2) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery.trim())}&limit=5`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.products || []);
            setIsOpen(true);
          } else {
            setResults([]);
            setIsOpen(false);
          }
        } catch {
          setResults([]);
          setIsOpen(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = useCallback(() => {
    if (query.trim().length >= 2) {
      setIsOpen(true);
    }
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setDebouncedQuery(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full z-40", className)}
    >
      <form onSubmit={handleSubmit} className="relative" role="search">
        <label htmlFor="search-input" className="sr-only">
          Search products
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 border-0 rounded-xl text-sm text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all duration-200"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={isOpen && results.length > 0}
          />
        </div>
      </form>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          id="search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-card overflow-hidden z-50 animate-in fade-in-0 duration-200"
        >
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors"
              role="option"
              onClick={() => setIsOpen(false)}
            >
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="h-12 w-12 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-black truncate">
                  {product.name}
                </p>
                <p className="text-xs text-neutral-500">{product.brand}</p>
              </div>
              <span className="text-sm font-semibold text-brand-black">
                {(product.price / 100).toFixed(2)}₵
              </span>
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="w-full px-4 py-3 text-center text-sm font-medium text-brand-gold hover:bg-neutral-50 border-t border-neutral-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            View all results for "{query}"
          </Link>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-card p-4 text-center z-50">
          <p className="text-sm text-neutral-500">No products found for "{query}"</p>
        </div>
      )}
    </div>
  );
}