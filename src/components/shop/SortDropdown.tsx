"use client";

import React, { useState, useRef, useEffect } from "react";
import { SORT_OPTIONS, SortOption } from "@/types/product";
import { cn } from "@/lib/utils";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function SortDropdown({
  value,
  onChange,
  className,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl",
          "text-sm font-medium text-brand-black hover:border-brand-gold",
          "focus:outline-none focus:ring-2 focus:ring-brand-gold",
          "w-full sm:w-auto"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Sort products"
      >
        <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h13M3 12h13M3 16h13" />
        </svg>
        <span>{selectedOption?.label || "Sort"}</span>
        <svg
          className={cn(
            "h-4 w-4 text-neutral-500 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-card overflow-hidden z-50 animate-in fade-in-0 duration-200"
          role="listbox"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-3 text-left text-sm transition-colors",
                value === option.value
                  ? "bg-brand-gold/10 text-brand-gold font-medium"
                  : "text-brand-black hover:bg-neutral-50"
              )}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}