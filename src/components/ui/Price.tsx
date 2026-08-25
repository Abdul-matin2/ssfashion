"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatPrice, formatPriceWithSymbol, isOnSale } from "@/lib/currency";

interface PriceProps {
  price: number; // in minor units (pesewas)
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg" | "xl";
  showCurrency?: boolean;
  className?: string;
}

export function Price({
  price,
  compareAtPrice,
  size = "md",
  showCurrency = true,
  className,
}: PriceProps) {
  const isSale = isOnSale(price, compareAtPrice);

  const sizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const format = showCurrency ? formatPriceWithSymbol : formatPricePlain;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-semibold",
          sizeStyles[size],
          isSale ? "text-brand-red" : "text-brand-black"
        )}
      >
        {format(price)}
      </span>

      {isSale && compareAtPrice && (
        <span
          className={cn(
            "text-neutral-500 line-through",
            sizeStyles[size]
          )}
        >
          {format(compareAtPrice)}
        </span>
      )}
    </div>
  );
}

function formatPricePlain(price: number): string {
  const cedis = price / 100;
  return `₵${cedis.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}