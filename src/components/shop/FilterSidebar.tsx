"use client";

import React, { useState } from "react";
import { BRANDS, CATEGORIES, GENDERS, Brand, Category, Gender } from "@/types/product";
import { cn } from "@/lib/utils";

interface FilterState {
  brands: Brand[];
  categories: Category[];
  sizes: string[];
  priceRange: [number, number];
  genders: Gender[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  productCount: number;
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  productCount,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brands: true,
    categories: true,
    sizes: true,
    price: true,
    genders: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBrandChange = (brand: Brand) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ brands: newBrands });
  };

  const handleCategoryChange = (category: Category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ categories: newCategories });
  };

  const handleGenderChange = (gender: Gender) => {
    const newGenders = filters.genders.includes(gender)
      ? filters.genders.filter((g) => g !== gender)
      : [...filters.genders, gender];
    onFiltersChange({ genders: newGenders });
  };

  const handleSizeChange = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFiltersChange({ sizes: newSizes });
  };

  const handlePriceChange = (range: [number, number]) => {
    onFiltersChange({ priceRange: range });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      brands: [],
      categories: [],
      sizes: [],
      priceRange: [0, 150000],
      genders: [],
    });
  };

  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.categories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.genders.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 150000;

  // All available sizes from products
  const allSizes = [
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "S",
    "M",
    "L",
    "XL",
  ];

  return (
    <aside className="lg:w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Results Count & Clear Filters */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-brand-black">
            {productCount} product{productCount !== 1 ? "s" : ""} found
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-brand-gold hover:text-brand-accent-hover font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Brands */}
        <FilterSection
          title="Brands"
          isExpanded={expandedSections.brands}
          onToggle={() => toggleSection("brands")}
        >
          <div className="space-y-2">
            {BRANDS.map((brand) => (
              <label
                key={brand.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.value)}
                  onChange={() => handleBrandChange(brand.value)}
                  className="h-4 w-4 text-brand-gold border-neutral-300 rounded focus:ring-brand-gold focus:ring-2 transition-colors"
                />
                <span className="text-sm text-brand-black group-hover:text-brand-gold transition-colors">
                  {brand.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Categories */}
        <FilterSection
          title="Categories"
          isExpanded={expandedSections.categories}
          onToggle={() => toggleSection("categories")}
        >
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <label
                key={category.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.value)}
                  onChange={() => handleCategoryChange(category.value)}
                  className="h-4 w-4 text-brand-gold border-neutral-300 rounded focus:ring-brand-gold focus:ring-2 transition-colors"
                />
                <span className="text-sm text-brand-black group-hover:text-brand-gold transition-colors">
                  {category.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Gender */}
        <FilterSection
          title="Gender"
          isExpanded={expandedSections.genders}
          onToggle={() => toggleSection("genders")}
        >
          <div className="space-y-2">
            {GENDERS.map((gender) => (
              <label
                key={gender.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.genders.includes(gender.value)}
                  onChange={() => handleGenderChange(gender.value)}
                  className="h-4 w-4 text-brand-gold border-neutral-300 rounded focus:ring-brand-gold focus:ring-2 transition-colors"
                />
                <span className="text-sm text-brand-black group-hover:text-brand-gold transition-colors">
                  {gender.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Sizes */}
        <FilterSection
          title="Sizes"
          isExpanded={expandedSections.sizes}
          onToggle={() => toggleSection("sizes")}
        >
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-xl border transition-all duration-200",
                  filters.sizes.includes(size)
                    ? "bg-brand-black text-brand-white border-brand-black"
                    : "bg-white text-brand-black border-neutral-200 hover:border-brand-gold hover:text-brand-gold"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection("price")}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-black">
                Min: ₵{filters.priceRange[0] / 100}
              </span>
              <span className="text-brand-black">
                Max: ₵{filters.priceRange[1] / 100}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="150000"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  handlePriceChange([Number(e.target.value), filters.priceRange[1]])
                }
                className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none accent-brand-gold"
              />
              <input
                type="range"
                min="0"
                max="150000"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  handlePriceChange([filters.priceRange[0], Number(e.target.value)])
                }
                className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none accent-brand-gold"
              />
            </div>
            {/* Quick price filters */}
            <div className="flex flex-wrap gap-2">
              {[0, 20000, 50000, 100000].map((max) => (
                <button
                  key={max}
                  onClick={() =>
                    handlePriceChange([
                      0,
                      max === 0 ? 150000 : max,
                    ])
                  }
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-xl border transition-all duration-200",
                    filters.priceRange[1] === (max === 0 ? 150000 : max) &&
                      filters.priceRange[0] === 0
                      ? "bg-brand-black text-brand-white border-brand-black"
                      : "bg-white text-brand-black border-neutral-200 hover:border-brand-gold"
                  )}
                >
                  {max === 0 ? "All" : `Under ₵${max / 100}`}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2"
        aria-expanded={isExpanded}
      >
        <h3 className="font-semibold text-brand-black">{title}</h3>
        <svg
          className={cn(
            "h-5 w-5 text-neutral-500 transition-transform",
            isExpanded && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && <div className="mt-4 animate-in fade-in-0 duration-200">{children}</div>}
    </div>
  );
}