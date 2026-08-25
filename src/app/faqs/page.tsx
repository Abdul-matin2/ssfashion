"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const categories = ["All", "Orders", "Shipping", "Returns", "Payment", "General"];

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/faqs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFaqs(data);
      })
      .catch(() => {});
  }, []);

  const filteredFaqs = activeCategory === "All"
    ? faqs
    : faqs.filter((faq) => faq.category === activeCategory);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isExpanded = (id: string) => expandedIds.includes(id);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Quick answers to common questions. Can&apos;t find what you&apos;re looking for?
            {" "}
            <Link href="/contact" className="text-brand-gold hover:text-brand-accent-hover font-medium">
              Contact us
            </Link>
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10" role="tablist" aria-label="FAQ categories">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === category
                  ? "bg-brand-black text-brand-white shadow-sm"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-brand-black border border-neutral-200"
              )}
              role="tab"
              aria-selected={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4" role="list" aria-label="Frequently asked questions">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <svg className="h-12 w-12 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.5-3.186 3-2.5.687-3.705 1.89-3.705 3.931A3.705 3.705 0 009 20.96v-1.23c0-1.634 2.254-3 4.5-3 1.384 0 2.64.781 3.207 1.944l.199 1.265c-.572.644-1.426 1.159-2.37 1.159-2.3 0-4.178-1.632-4.178-4 0-2.757 2.79-3.49 4.086-4.347" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 13h-8" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 17h-8" />
              </svg>
              <p className="text-lg">No questions in this category yet.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <details
                key={faq.id}
                className={cn(
                  "group bg-white rounded-xl border transition-all duration-200",
                  isExpanded(faq.id)
                    ? "border-brand-gold shadow-md"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
                open={isExpanded(faq.id)}
                onToggle={() => toggleExpand(faq.id)}
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="text-brand-black font-medium pr-4">{faq.question}</span>
                  <svg
                    className={cn(
                      "h-5 w-5 flex-shrink-0 text-brand-gold transition-transform duration-200",
                      isExpanded(faq.id) && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-0 border-t border-neutral-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-neutral-600 mb-4">Still have questions?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black text-brand-white rounded-xl font-medium hover:bg-brand-black/90 transition-colors"
          >
            Contact Support
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}