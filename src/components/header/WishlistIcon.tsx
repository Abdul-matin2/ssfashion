"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

export function WishlistIcon({
  className,
}: {
  className?: string;
}) {
  const { getTotalItems } = useWishlist();
  const totalItems = getTotalItems();

  return (
    <Link
      href="/wishlist"
      className={cn(
        "relative flex items-center justify-center p-2 text-brand-black hover:text-brand-red transition-colors",
        className
      )}
      aria-label={`Wishlist${totalItems > 0 ? ` with ${totalItems} saved items` : " is empty"}`}
    >
      <svg
        className="h-6 w-6"
        fill="none"
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
      {totalItems > 0 && (
        <span
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center text-xs font-bold text-brand-white bg-brand-red rounded-full"
          aria-label={`${totalItems} items in wishlist`}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}