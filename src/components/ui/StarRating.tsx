"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  reviewCount,
  size = "md",
  showCount = false,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const starSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1" role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <button
          key={`full-${i}`}
          onClick={() => handleClick(i + 1)}
          disabled={!interactive}
          className={cn(
            "text-brand-gold transition-colors",
            starSizes[size],
            interactive && "cursor-pointer hover:scale-110"
          )}
          aria-label={`${i + 1} star${i > 0 ? "s" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <button
          key="half"
          onClick={() => handleClick(fullStars + 0.5)}
          disabled={!interactive}
          className={cn(
            "text-brand-gold transition-colors",
            starSizes[size],
            interactive && "cursor-pointer hover:scale-110"
          )}
          aria-label={`${fullStars + 0.5} stars`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <defs>
              <linearGradient id="halfStar" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#E5E7EB" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="url(#halfStar)"
            />
          </svg>
        </button>
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <button
          key={`empty-${i}`}
          onClick={() => handleClick(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
          disabled={!interactive}
          className={cn(
            "text-neutral-300 transition-colors",
            starSizes[size],
            interactive && "cursor-pointer hover:text-brand-gold hover:scale-110"
          )}
          aria-label={`${fullStars + (hasHalfStar ? 1 : 0) + i + 1} stars`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}

      {showCount && reviewCount !== undefined && (
        <span className={cn("text-neutral-500 ml-2", {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
        })}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}