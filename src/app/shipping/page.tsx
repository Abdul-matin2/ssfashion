"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useContact } from "@/hooks/useContact";

interface ShippingData {
  hero: {
    title: string;
    subtitle: string;
  };
  policies: Array<{
    title: string;
    content: string[];
    icon: string;
  }>;
  rates: Array<{
    region: string;
    standard: string;
    express: string;
    freeThreshold?: string;
  }>;
  timeline: Array<{
    step: string;
    description: string;
    estimatedDays: string;
  }>;
  restrictions: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

const defaultShipping: ShippingData = {
  hero: {
    title: "Shipping Information",
    subtitle: "Fast, reliable delivery across Ghana and beyond",
  },
  policies: [
    {
      title: "Free Standard Shipping",
      icon: "truck",
      content: [
        "Free standard shipping on all orders over GHS 500",
        "Orders under GHS 500: GHS 30 flat rate",
        "Delivery within 2-5 business days",
      ],
    },
    {
      title: "Express Delivery",
      icon: "clock",
      content: [
        "Available in Accra, Kumasi, and Takoradi",
        "GHS 50 flat rate for express delivery",
        "Delivered within 1-2 business days",
      ],
    },
    {
      title: "International Shipping",
      icon: "globe",
      content: [
        "Ships to West Africa (Nigeria, Ivory Coast, Togo, Benin)",
        "Rates calculated at checkout based on destination",
        "Delivery within 5-10 business days",
        "Customs duties and taxes are the recipient's responsibility",
      ],
    },
  ],
  rates: [
    { region: "Accra & Tema", standard: "GHS 30", express: "GHS 50", freeThreshold: "GHS 500+" },
    { region: "Kumasi", standard: "GHS 30", express: "GHS 50", freeThreshold: "GHS 500+" },
    { region: "Takoradi", standard: "GHS 30", express: "GHS 50", freeThreshold: "GHS 500+" },
    { region: "Other Ghana Cities", standard: "GHS 40", express: "N/A", freeThreshold: "GHS 500+" },
    { region: "West Africa", standard: "GHS 120", express: "GHS 200", freeThreshold: "GHS 1000+" },
  ],
  timeline: [
    { step: "Order Placed", description: "Your order is confirmed and sent to our warehouse", estimatedDays: "Same day" },
    { step: "Processing", description: "Items are picked, packed, and quality checked", estimatedDays: "1 business day" },
    { step: "Dispatched", description: "Package handed to courier partner", estimatedDays: "1 business day" },
    { step: "In Transit", description: "Package is on its way to your address", estimatedDays: "1-3 business days" },
    { step: "Delivered", description: "Package arrives at your doorstep", estimatedDays: "Delivery day" },
  ],
  restrictions: [
    "PO Box addresses not accepted for express delivery",
    "Some remote areas may have extended delivery times",
    "Signature required for orders over GHS 1000",
    "We cannot ship to military addresses (AFO/FPO)",
  ],
  faqs: [
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive an email with a tracking number. You can also track it in your account under 'My Orders' or use our Track Order page.",
    },
    {
      question: "What if I'm not home when my package arrives?",
      answer: "Our courier will attempt delivery twice. After the second attempt, the package will be held at the nearest pickup point for 5 business days. You'll receive SMS notifications with pickup details.",
    },
    {
      question: "Can I change my delivery address after ordering?",
      answer: "If your order hasn't been dispatched yet, contact us immediately at support@ssfashion.com or call +233 24 123 4567. Once dispatched, address changes may not be possible.",
    },
    {
      question: "Do you offer weekend delivery?",
      answer: "Standard delivery operates Monday-Saturday. Express delivery in Accra is available on Saturdays for orders placed before 12 PM Friday. No Sunday delivery.",
    },
  ],
};

const icons: Record<string, React.ReactNode> = {
  truck: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h2m6 0a1 1 0 011 1v3a1 1 0 01-1 1m9-10a1 1 0 01-1 1H8a1 1 0 01-1-1V7a4 4 0 118 0z" />
    </svg>
  ),
  clock: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  globe: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  check: (
    <svg className="h-5 w-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  chevron: (
    <svg className="h-5 w-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

export default function ShippingPage() {
  const [shipping, setShipping] = useState<ShippingData>(defaultShipping);
  const [expandedFaqs, setExpandedFaqs] = useState<string[]>([]);
  const { contact } = useContact();

  useEffect(() => {
    fetch("/api/admin/shipping")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setShipping(data);
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (question: string) => {
    setExpandedFaqs((prev) =>
      prev.includes(question) ? prev.filter((q) => q !== question) : [...prev, question]
    );
  };

  // Replace any hardcoded email in FAQ answers with the admin-configured contact email
  const faqAnswer = (answer: string) =>
    answer.replace(/(support@[\w.-]+\.\w+|ssfashion233@gmail\.com|admin@[\w.-]+\.\w+)/g, contact.email);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            {shipping.hero.title}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {shipping.hero.subtitle}
          </p>
        </div>

        {/* Shipping Policies */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Our Shipping Policies
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shipping.policies.map((policy, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gold/10 text-brand-gold mb-4">
                  {icons[policy.icon] || icons.truck}
                </div>
                <h3 className="text-xl font-semibold text-brand-black mb-3">{policy.title}</h3>
                <ul className="space-y-2 text-neutral-600">
                  {policy.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {icons.check}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping Rates Table */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Shipping Rates by Region
          </h2>
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-black text-brand-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Region</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Standard</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Express</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Free Shipping On Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {shipping.rates.map((rate, index) => (
                    <tr key={index} className={cn("hover:bg-neutral-50 transition-colors", index % 2 === 0 && "bg-neutral-50/50")}>
                      <td className="px-4 py-4 font-medium text-brand-black">{rate.region}</td>
                      <td className="px-4 py-4 text-neutral-600">{rate.standard}</td>
                      <td className="px-4 py-4 text-neutral-600">{rate.express}</td>
                      <td className="px-4 py-4">
                        {rate.freeThreshold ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                            {icons.check}
                            {rate.freeThreshold}
                          </span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-center text-sm text-neutral-500 mt-4">
            All prices in Ghana Cedis (GHS). Rates subject to change.
          </p>
        </section>

        {/* Delivery Timeline */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Delivery Timeline
          </h2>
          <div className="space-y-4">
            {shipping.timeline.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-brand-black">{item.step}</h3>
                  <p className="text-neutral-600 mt-1">{item.description}</p>
                </div>
                <div className="flex-shrink-0 items-center text-sm font-medium text-brand-gold">
                  {item.estimatedDays}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Restrictions */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Important Restrictions
          </h2>
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
            <ul className="space-y-3">
              {shipping.restrictions.map((restriction, index) => (
                <li key={index} className="flex items-start gap-3 text-neutral-600">
                  <svg className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{restriction}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Shipping FAQs
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {shipping.faqs.map((faq, index) => (
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
                  <p className="text-neutral-600 leading-relaxed">{faqAnswer(faq.answer)}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-brand-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-white mb-4">
            Ready to Shop?
          </h2>
          <p className="text-brand-white/80 text-lg mb-8 max-w-xl mx-auto">
            Enjoy fast, reliable shipping on all your favorite brands. Free delivery on orders over GHS 500.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            Shop Now
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}