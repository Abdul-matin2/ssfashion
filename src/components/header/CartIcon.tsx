"use client";

import React from "react";
import Link from "next/link";
import { useCartDisplay } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface CartIconProps {
  className?: string;
  onClick?: () => void;
  asButton?: boolean;
}

export function CartIcon({
  className,
  onClick,
  asButton = false,
}: CartIconProps) {
  const { totalItems, formattedSubtotal } = useCartDisplay();

  const handleClick = (e: React.MouseEvent) => {
    if (asButton && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  if (asButton) {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "relative flex items-center justify-center p-2 text-brand-black hover:text-brand-gold transition-colors",
          className
        )}
        aria-label={`Shopping cart${totalItems > 0 ? ` with ${totalItems} items` : " is empty"}`}
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {totalItems > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center text-xs font-bold text-brand-white bg-brand-red rounded-full"
            aria-label={`${totalItems} items in cart`}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>
    );
  }

  return (
    <Link
      href="/cart"
      className={cn(
        "relative flex items-center justify-center p-2 text-brand-black hover:text-brand-gold transition-colors",
        className
      )}
      aria-label={`Shopping cart${totalItems > 0 ? ` with ${totalItems} items` : " is empty"}`}
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
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {totalItems > 0 && (
        <span
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center text-xs font-bold text-brand-white bg-brand-red rounded-full"
          aria-label={`${totalItems} items in cart`}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}