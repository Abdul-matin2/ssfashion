import React from "react";
import Link from "next/link";
import { getBestSellers } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface BestSellersProps {
  className?: string;
  limit?: number;
  products?: Product[];
}

export async function BestSellers({ className, limit = 5, products: preloadedProducts }: BestSellersProps) {
  const bestSellers = preloadedProducts || await getBestSellers(limit);

  return (
    <section
      className={cn("py-16 lg:py-24", className)}
      aria-labelledby="best-sellers-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10 lg:mb-12">
          <h2
            id="best-sellers-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-black"
          >
            Best Sellers
          </h2>
          <Link
            href="/shop?sort=rating"
            className="text-sm font-medium text-brand-gold hover:text-brand-accent-hover transition-colors flex items-center gap-1 hidden sm:inline-flex"
          >
            View all
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6"
          role="list"
          aria-label="Best selling products"
        >
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBrand={true}
              className="group"
            />
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/shop?sort=rating"
            className="text-sm font-medium text-brand-gold hover:text-brand-accent-hover transition-colors flex items-center justify-center gap-1"
          >
            View all
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}