"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/header/Logo";
import { cn } from "@/lib/utils";

export default function GiftCardsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Header */}
        <div>
          <Logo size="lg" className="mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-black mb-4">
            Gift Cards
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed">
            We&apos;re working on something special. Gift cards will be available soon, the perfect way to share the S&S Fashion experience with friends and family.
          </p>
        </div>

        {/* Features preview */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 text-left">
          <h3 className="font-semibold text-brand-black flex items-center gap-2">
            <svg className="h-5 w-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            What to expect
          </h3>
          <ul className="space-y-3 text-neutral-600 text-sm">
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Digital gift cards delivered instantly via email</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Custom amounts and personalized messages</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No expiration dates, shop anytime</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Redeemable online and in-store</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" className="w-full sm:w-auto" onClick={() => window.location.href = "/shop"}>
            Continue Shopping
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.location.href = "/contact"}>
            Notify Me
          </Button>
        </div>

        {/* Back link */}
        <p className="text-sm text-neutral-500">
          <Link href="/" className="font-medium text-brand-gold hover:text-brand-accent-hover flex items-center justify-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}