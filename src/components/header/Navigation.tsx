"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Men", href: "/shop?gender=Men" },
  { label: "Women", href: "/shop?gender=Women" },
  { label: "Kids", href: "/shop?gender=Kids" },
  { label: "Brands", href: "/shop?view=brands" },
  { label: "Sale", href: "/shop?sale=true" },
];

const helpItems = [
  { label: "Shipping Info", href: "/shipping" },
  { label: "Returns & Exchange", href: "/returns" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Track Order", href: "/track-order" },
];

const companyItems = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navigation({
  className,
}: {
  className?: string;
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav
      className={cn(
        "flex items-center gap-8 md:gap-10 font-medium text-sm md:text-base",
        className
      )}
      aria-label="Main navigation"
    >
      {navItems.map((item, index) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "text-brand-black hover:text-brand-gold transition-colors duration-200 relative",
            item.label === "Sale" && "text-brand-red hover:text-brand-red-hover font-semibold"
          )}
          aria-current={index === 0 ? "page" : undefined}
        >
          {item.label}
          {item.label === "Sale" && (
            <span className="absolute -top-2 right-3 md:right-0 ml-1 text-xs font-bold bg-brand-red text-white px-1 rounded">HOT</span>
          )}
        </Link>
      ))}

      {/* Help Dropdown */}
      <div className="relative" onMouseEnter={() => setOpenDropdown("help")} onMouseLeave={() => setOpenDropdown(null)}>
        <button
          className="text-brand-black hover:text-brand-gold transition-colors duration-200 flex items-center gap-1"
          aria-haspopup="true"
          aria-expanded={openDropdown === "help"}
        >
          Help <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {openDropdown === "help" && (
          <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 animate-in fade-in-0 zoom-in-95">
            {helpItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-sm text-brand-black hover:text-brand-gold hover:bg-neutral-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Company Dropdown */}
      <div className="relative" onMouseEnter={() => setOpenDropdown("company")} onMouseLeave={() => setOpenDropdown(null)}>
        <button
          className="text-brand-black hover:text-brand-gold transition-colors duration-200 flex items-center gap-1"
          aria-haspopup="true"
          aria-expanded={openDropdown === "company"}
        >
          Company <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {openDropdown === "company" && (
          <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 animate-in fade-in-0 zoom-in-95">
            {companyItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-sm text-brand-black hover:text-brand-gold hover:bg-neutral-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}