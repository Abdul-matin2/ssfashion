"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReturnsData {
  hero: {
    title: string;
    subtitle: string;
  };
  policy: {
    title: string;
    content: string[];
  };
  conditions: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  process: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  timeframes: Array<{
    type: string;
    days: string;
    description: string;
  }>;
  exceptions: string[];
  refundMethods: Array<{
    method: string;
    timeline: string;
    details: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

const defaultReturns: ReturnsData = {
  hero: {
    title: "Returns & Exchanges",
    subtitle: "Shop with confidence, hassle-free returns within 30 days",
  },
  policy: {
    title: "Our Return Policy",
    content: [
      "We want you to love your purchase. If you're not completely satisfied, you can return or exchange items within 30 days of delivery.",
      "All items must be in their original condition: unworn, with all tags attached, and in the original packaging (including shoe boxes and dust bags).",
      "Returns are free for all orders over GHS 500. For orders under GHS 500, a GHS 30 return shipping fee applies.",
    ],
  },
  conditions: [
    {
      title: "Unworn Condition",
      icon: "sparkles",
      description: "Items must show no signs of wear, scuffs, or damage. Try them on indoors on clean surfaces only.",
    },
    {
      title: "Original Packaging",
      icon: "box",
      description: "Shoe boxes, dust bags, tags, and all accessories must be included. The box is part of the product.",
    },
    {
      title: "30-Day Window",
      icon: "calendar",
      description: "Returns must be initiated within 30 days of delivery. Exchanges subject to stock availability.",
    },
    {
      title: "Proof of Purchase",
      icon: "receipt",
      description: "Order confirmation email or order number required for all returns and exchanges.",
    },
  ],
  process: [
    {
      step: 1,
      title: "Start Your Return",
      description: "Log into your account, go to 'My Orders', select the order, and click 'Return Item'. Choose return or exchange and select a reason.",
    },
    {
      step: 2,
      title: "Pack Your Items",
      description: "Place items in the original shoe box, then into a shipping box. Include the return slip (printed from email) inside the package.",
    },
    {
      step: 3,
      title: "Drop Off or Schedule Pickup",
      description: "Drop off at any partner location (list provided via email) or schedule a free pickup for orders over GHS 500.",
    },
    {
      step: 4,
      title: "Get Your Refund",
      description: "Once we receive and inspect your return (1-2 business days), refunds are processed to your original payment method within 5-10 business days.",
    },
  ],
  timeframes: [
    { type: "Standard Returns", days: "30 days", description: "Full refund to original payment method" },
    { type: "Exchanges", days: "30 days", description: "Subject to stock availability; size/color changes only" },
    { type: "Defective Items", days: "90 days", description: "Manufacturing defects covered for 90 days with free return shipping" },
    { type: "Sale Items", days: "14 days", description: "Final sale items marked 'Final Sale' cannot be returned" },
  ],
  exceptions: [
    "Final sale items (marked 'Final Sale') cannot be returned or exchanged",
    "Worn, damaged, or altered items will be rejected and returned to sender at customer's expense",
    "Items without original packaging (shoe box, dust bags, tags) may incur a 20% restocking fee",
    "Customized or personalized items are not eligible for return",
    "Gift cards are non-refundable and cannot be exchanged for cash",
  ],
  refundMethods: [
    {
      method: "Original Payment Method",
      timeline: "5-10 business days",
      details: "Refunded to the same card or mobile money account used for purchase",
    },
    {
      method: "Store Credit",
      timeline: "Instant",
      details: "Issued as S&S Fashion credit, never expires, usable on any future purchase",
    },
    {
      method: "Bank Transfer",
      timeline: "7-14 business days",
      details: "For cash-on-delivery orders; requires valid bank account details",
    },
  ],
  faqs: [
    {
      question: "Can I exchange for a different size or color?",
      answer: "Yes! Exchanges for different sizes or colors of the same item are free and subject to stock availability. Select 'Exchange' when initiating your return.",
    },
    {
      question: "Who pays for return shipping?",
      answer: "Free returns for orders over GHS 500. For orders under GHS 500, a GHS 30 return fee is deducted from your refund. Defective items always ship free.",
    },
    {
      question: "How long does a refund take?",
      answer: "Once we receive your return, inspection takes 1-2 business days. Refunds to cards/mobile money take 5-10 business days. Store credit is instant.",
    },
    {
      question: "What if I received a defective or wrong item?",
      answer: "We apologize! Contact us within 48 hours at support@ssfashion.com with photos. We'll arrange free return shipping and send a replacement or full refund.",
    },
    {
      question: "Can I return items bought in-store?",
      answer: "Online purchases must be returned through our online return process. In-store purchases follow the store's return policy. They cannot be mixed.",
    },
  ],
};

const icons: Record<string, React.ReactNode> = {
  sparkles: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  box: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  calendar: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  receipt: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  check: (
    <svg className="h-5 w-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  arrowRight: (
    <svg className="h-5 w-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnsData>(defaultReturns);
  const [expandedFaqs, setExpandedFaqs] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/returns")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setReturns(data);
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (question: string) => {
    setExpandedFaqs((prev) =>
      prev.includes(question) ? prev.filter((q) => q !== question) : [...prev, question]
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            {returns.hero.title}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {returns.hero.subtitle}
          </p>
        </div>

        {/* Policy Overview */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-brand-black mb-4">{returns.policy.title}</h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed">
              {returns.policy.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Conditions */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Return Conditions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {returns.conditions.map((condition, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gold/10 text-brand-gold mb-4 mx-auto">
                  {icons[condition.icon] || icons.sparkles}
                </div>
                <h3 className="text-xl font-semibold text-brand-black mb-2">{condition.title}</h3>
                <p className="text-neutral-600">{condition.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Return Process */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            How to Return or Exchange
          </h2>
          <div className="space-y-4">
            {returns.process.map((step) => (
              <div
                key={step.step}
                className="flex gap-4 bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold text-brand-black font-bold text-lg">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-brand-black">{step.title}</h3>
                  <p className="text-neutral-600 mt-1">{step.description}</p>
                </div>
                <div className="flex-shrink-0 items-center">
                  {icons.arrowRight}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeframes */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Return Timeframes
          </h2>
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-black text-brand-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Return Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Timeframe</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {returns.timeframes.map((item, index) => (
                    <tr key={index} className={cn("hover:bg-neutral-50 transition-colors", index % 2 === 0 && "bg-neutral-50/50")}>
                      <td className="px-4 py-4 font-medium text-brand-black">{item.type}</td>
                      <td className="px-4 py-4 text-neutral-600">{item.days}</td>
                      <td className="px-4 py-4 text-neutral-600">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Exceptions */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Exceptions & Non-Returnable Items
          </h2>
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
            <ul className="space-y-3">
              {returns.exceptions.map((exception, index) => (
                <li key={index} className="flex items-start gap-3 text-neutral-600">
                  <svg className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{exception}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Refund Methods */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Refund Methods
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {returns.refundMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-lg font-semibold text-brand-black mb-2">{method.method}</h3>
                <p className="text-brand-gold font-medium mb-2">{method.timeline}</p>
                <p className="text-neutral-600">{method.details}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Returns FAQs
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {returns.faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-xl border transition-all duration-200"
                open={expandedFaqs.includes(faq.question)}
                onToggle={() => toggleFaq(faq.question)}
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="text-brand-black font-medium pr-4">{faq.question}</span>
                  <svg
                    className={cn(
                      "h-5 w-5 flex-shrink-0 text-brand-gold transition-transform duration-200",
                      expandedFaqs.includes(faq.question) && "rotate-180"
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
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-brand-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-white mb-4">
            Need Help with a Return?
          </h2>
          <p className="text-brand-white/80 text-lg mb-8 max-w-xl mx-auto">
            Our customer service team is here to assist you. Contact us for any return or exchange questions.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            Contact Support
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}