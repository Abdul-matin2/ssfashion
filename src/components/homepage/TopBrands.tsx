"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Brand } from "@/types/product";

// Brand logo images - add your logo files to public/images/brands/
// Format: { brandValue: "/images/brands/logo-filename.png" }
const brandLogoImages: Record<string, string> = {
  Nike: "/images/brands/nike.jpeg",
  Adidas: "/images/brands/adidas.jpeg",
  Puma: "/images/brands/puma.jpeg",
  "New Balance": "/images/brands/new-balance.jpeg",
  Converse: "/images/brands/converse.jpeg",
  Vans: "/images/brands/vans.jpeg",
  Jordan: "/images/brands/jordan.jpeg",
  Reebok: "/images/brands/reebok.jpeg",
  Fila: "/images/brands/fila.jpeg",
  Skechers: "/images/brands/skechers.jpeg",
  Other: "/images/brands/other.jpeg",
};

// Fallback SVG icons (used when no image is provided or fails to load)
const brandFallbackIcons: Record<string, React.ReactNode> = {
  Nike: (
    <svg className="h-10 w-auto" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm37.5 63.5c0 4.1-3.4 7.5-7.5 7.5H19.5c-4.1 0-7.5-3.4-7.5-7.5V36.5c0-4.1 3.4-7.5 7.5-7.5h60.5c4.1 0 7.5 3.4 7.5 7.5v27z"/>
    </svg>
  ),
  Adidas: (
    <svg className="h-10 w-auto" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm-15 35v30h-10V35h10zm20 0v30h-10V35h10zm20 0v10h-10V35h10zm0 20v10h-10V55h10z"/>
    </svg>
  ),
  Puma: (
    <svg className="h-10 w-auto" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z"/>
    </svg>
  ),
  "New Balance": <span className="font-bold text-lg tracking-tight text-brand-black">NB</span>,
  Converse: (
    <svg className="h-10 w-auto" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"/>
      <path d="M50 10v80M10 50h80" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    </svg>
  ),
  Vans: <span className="font-bold text-base tracking-tight text-brand-black">VANS</span>,
  Jordan: (
    <svg className="h-10 w-auto" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z"/>
    </svg>
  ),
  Reebok: <span className="font-semibold text-sm tracking-tight text-brand-black">REEBOK</span>,
  Fila: <span className="font-bold text-base tracking-tight text-brand-black">FILA</span>,
  Skechers: <span className="font-semibold text-sm tracking-tight text-brand-black">SKECHERS</span>,
  Other: (
    <svg className="h-10 w-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L3.29 18.8a5.5 5.5 0 0 0 7.78 7.78l1.06-1.06L12 18.33l1.06 1.06a5.5 5.5 0 0 0 7.78-7.78l-1.06-1.06L20.84 4.61z"/>
    </svg>
  ),
};

interface TopBrandsProps {
  className?: string;
  brands?: Brand[];
}

export function TopBrands({ className, brands = [] }: TopBrandsProps) {

  return (
    <section
      className={cn("bg-neutral-100 py-12 lg:py-16", className)}
      aria-labelledby="top-brands-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2
            id="top-brands-heading"
            className="text-2xl sm:text-3xl font-bold text-brand-black"
          >
            Top Brands
          </h2>
          <Link
            href="/shop?view=brands"
            className="text-sm font-medium text-brand-gold hover:text-brand-accent-hover transition-colors flex items-center gap-1"
          >
            View all
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div
          className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 scrollbar-hide"
          role="list"
          aria-label="Brand logos"
        >
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/shop?brand=${encodeURIComponent(brand)}`}
              className={cn(
                "flex flex-col items-center gap-2 min-w-[100px] lg:min-w-[120px] flex-shrink-0",
                "p-4 lg:p-6 bg-white rounded-2xl border border-neutral-200",
                "hover:border-brand-gold hover:shadow-card transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              )}
              role="listitem"
              aria-label={`Shop ${brand}`}
            >
              <div className="flex items-center justify-center min-h-[60px] w-full">
                {brandLogoImages[brand] ? (
                  <img
                    src={brandLogoImages[brand]}
                    alt={`${brand} logo`}
                    className="max-h-12 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    loading="lazy"
                  />
                ) : brandFallbackIcons[brand] ? (
                  <span
                    className="flex items-center justify-center w-full"
                  >
                    {brandFallbackIcons[brand]}
                  </span>
                ) : null}
              </div>
              <span className="text-sm font-medium text-brand-black text-center">
                {brand}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}