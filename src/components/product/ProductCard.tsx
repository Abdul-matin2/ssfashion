"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useWishlist } from "@/context/WishlistContext";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  showBrand?: boolean;
  showRating?: boolean;
  showSubcategory?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  showBrand = true,
  showRating = true,
  showSubcategory = true,
  className,
}: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlist();
  const isWished = isInWishlist(product.id);

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const subtitle = showSubcategory
    ? `${product.gender === "Unisex" ? "" : product.gender + " "}${product.category}`
    : product.brand;

  return (
    <article
      className={cn(
        "group relative bg-white rounded-2xl border border-neutral-200 overflow-hidden",
        "hover:shadow-card-hover transition-all duration-300",
        "focus-within:ring-2 focus-within:ring-brand-gold",
        className
      )}
    >
      {/* Wishlist Heart Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleItem(product);
        }}
        className={cn(
          "absolute top-3 right-3 z-20 p-2.5 rounded-xl transition-all duration-200",
          "bg-white/80 backdrop-blur-sm hover:bg-white",
          isWished
            ? "text-brand-red"
            : "text-neutral-400 hover:text-brand-red",
          "focus:outline-none focus:ring-2 focus:ring-brand-red"
        )}
        aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isWished}
      >
        <svg
          className={cn("h-5 w-5", isWished && "fill-brand-red")}
          fill={isWished ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-neutral-100"
      >
        <img
          src={product.images[0]?.url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Product Info */}
      <div className="p-4 lg:p-5">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-2">
          {product.isNew && (
            <Badge variant="new" size="sm">
              NEW
            </Badge>
          )}
          {product.compareAtPrice && (
            <Badge variant="sale" size="sm">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Brand */}
        {showBrand && (
          <p className="text-xs font-medium text-neutral-500 mb-1">{product.brand}</p>
        )}

        {/* Product Name */}
        <Link
          href={`/product/${product.slug}`}
          className="block"
        >
          <h3 className="font-semibold text-brand-black hover:text-brand-gold transition-colors line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-neutral-500 mb-2">{subtitle}</p>
        )}

        {/* Rating */}
        {showRating && (
          <div className="mb-3">
            <StarRating rating={product.rating} showCount reviewCount={product.reviewCount} size="sm" />
          </div>
        )}

        {/* Price */}
        <Price
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          size="lg"
        />
      </div>
    </article>
  );
}