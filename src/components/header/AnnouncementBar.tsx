"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function AnnouncementBar({
  message = "Free shipping on orders over ₵500 | Easy 30-day returns",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-brand-black text-brand-white py-2 text-center text-sm font-medium",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}