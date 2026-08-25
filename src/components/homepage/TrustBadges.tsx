"use client";

import React from "react";
import { cn } from "@/lib/utils";

const badges = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    title: "Free Shipping",
    description: "On orders over ₵500",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "30-Day Returns",
    description: "Hassle-free returns",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "100% Authentic",
    description: "Genuine products only",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Secure Payments",
    description: "Encrypted transactions",
  },
];

export function TrustBadges({ className }: { className?: string }) {
  return (
    <section
      className={cn("py-16 lg:py-24 bg-neutral-50", className)}
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="text-center p-6 bg-white rounded-2xl border border-neutral-200 hover:border-brand-gold hover:shadow-card transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-gold/10 text-brand-gold rounded-xl mb-4">
                {badge.icon}
              </div>
              <h3 className="font-semibold text-brand-black text-lg mb-2">
                {badge.title}
              </h3>
              <p className="text-neutral-500 text-sm">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}