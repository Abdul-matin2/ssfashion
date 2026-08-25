"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SizeGuideData {
  hero: {
    title: string;
    subtitle: string;
  };
  categories: Array<{
    name: string;
    description: string;
    icon: string;
    sizes: Array<{
      name: string;
      us: string;
      eu: string;
      uk: string;
      cm: string;
    }>;
  }>;
  tips: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  fitGuide: Array<{
    brand: string;
    fit: string;
    description: string;
  }>;
}

const defaultSizeGuide: SizeGuideData = {
  hero: {
    title: "Size Guide",
    subtitle: "Find your perfect fit across all our brands",
  },
  categories: [
    {
      name: "Men's Footwear",
      icon: "shoe",
      description: "Men's US sizing",
      sizes: [
        { name: "US 6", us: "6", eu: "39", uk: "5.5", cm: "24" },
        { name: "US 7", us: "7", eu: "40", uk: "6.5", cm: "25" },
        { name: "US 8", us: "8", eu: "41", uk: "7.5", cm: "26" },
        { name: "US 9", us: "9", eu: "42", uk: "8.5", cm: "27" },
        { name: "US 10", us: "10", eu: "43", uk: "9.5", cm: "28" },
        { name: "US 11", us: "11", eu: "44", uk: "10.5", cm: "29" },
        { name: "US 12", us: "12", eu: "45", uk: "11.5", cm: "30" },
        { name: "US 13", us: "13", eu: "46", uk: "12.5", cm: "31" },
      ],
    },
    {
      name: "Women's Footwear",
      icon: "shoe",
      description: "Women's US sizing",
      sizes: [
        { name: "US 5", us: "5", eu: "35", uk: "3", cm: "22" },
        { name: "US 6", us: "6", eu: "36", uk: "4", cm: "23" },
        { name: "US 7", us: "7", eu: "37", uk: "5", cm: "24" },
        { name: "US 8", us: "8", eu: "38", uk: "6", cm: "25" },
        { name: "US 9", us: "9", eu: "39", uk: "7", cm: "26" },
        { name: "US 10", us: "10", eu: "40", uk: "8", cm: "27" },
        { name: "US 11", us: "11", eu: "41", uk: "9", cm: "28" },
      ],
    },
    {
      name: "Kids' Footwear",
      icon: "child",
      description: "Kids' US sizing",
      sizes: [
        { name: "US 1", us: "1", eu: "32", uk: "0.5", cm: "20" },
        { name: "US 2", us: "2", eu: "33", uk: "1.5", cm: "21" },
        { name: "US 3", us: "3", eu: "34", uk: "2.5", cm: "22" },
        { name: "US 4", us: "4", eu: "35", uk: "3.5", cm: "23" },
        { name: "US 5", us: "5", eu: "36", uk: "4.5", cm: "24" },
        { name: "US 6", us: "6", eu: "37", uk: "5.5", cm: "25" },
      ],
    },
  ],
  tips: [
    {
      title: "Measure Your Feet",
      icon: "ruler",
      description: "Stand on a piece of paper and trace your foot. Measure the length from heel to toe in centimeters. Do this in the afternoon when your feet are slightly larger.",
    },
    {
      title: "Consider Sock Thickness",
      icon: "layers",
      description: "Thicker socks may require going up half a size. Athletic shoes should fit snugly with your thinnest socks for the most accurate fit.",
    },
    {
      title: "Try On Both Feet",
      icon: "foot",
      description: "Most people have one foot slightly larger than the other. Always fit to your larger foot and ensure thumb-width space at the toe.",
    },
    {
      title: "Check Brand Variations",
      icon: "label",
      description: "Sizing can vary between brands. Check our Fit Guide below for specific brand recommendations, or consult the product page for fit notes.",
    },
  ],
  fitGuide: [
    { brand: "Nike", fit: "True to Size", description: "Nike running shoes fit true to size. Lifestyle shoes may run slightly small." },
    { brand: "Adidas", fit: "True to Size", description: "Most Adidas sneakers fit true to size. Ultraboost models may run half size small." },
    { brand: "New Balance", fit: "True to Size", description: "NB shoes generally fit true to size. Wide widths available for most models." },
    { brand: "Jordan", fit: "Half Size Down", description: "Jordan retros tend to run half size large. Consider sizing down for a snug fit." },
    { brand: "Puma", fit: "True to Size", description: "Puma sneakers fit true to size with a comfortable, relaxed feel." },
    { brand: "Converse", fit: "Half Size Down", description: "Classic Chuck Taylors run about half size large. Break-in period may be needed." },
  ],
};

const icons: Record<string, React.ReactNode> = {
  shoe: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
    </svg>
  ),
  child: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  ruler: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  layers: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  foot: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
    </svg>
  ),
  label: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
};

export default function SizeGuidePage() {
  const [sizeGuide, setSizeGuide] = useState<SizeGuideData>(defaultSizeGuide);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    fetch("/api/admin/size-guide")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSizeGuide(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            {sizeGuide.hero.title}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {sizeGuide.hero.subtitle}
          </p>
        </div>

        {/* Size Charts */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Size Charts
          </h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {sizeGuide.categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className={cn(
                  "px-6 py-3 rounded-xl font-medium transition-all duration-200",
                  activeCategory === index
                    ? "bg-brand-black text-brand-white shadow-lg"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Size Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-brand-black">
                {sizeGuide.categories[activeCategory]?.name}
              </h3>
              <p className="text-sm text-neutral-600">{sizeGuide.categories[activeCategory]?.description}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-black">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-black">US</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-black">EU</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-black">UK</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-black">CM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {sizeGuide.categories[activeCategory]?.sizes.map((size, index) => (
                    <tr key={index} className={cn("hover:bg-neutral-50 transition-colors", index % 2 === 0 && "bg-neutral-50/50")}>
                      <td className="px-4 py-4 font-medium text-brand-black">{size.name}</td>
                      <td className="px-4 py-4 text-neutral-600">{size.us}</td>
                      <td className="px-4 py-4 text-neutral-600">{size.eu}</td>
                      <td className="px-4 py-4 text-neutral-600">{size.uk}</td>
                      <td className="px-4 py-4 text-neutral-600">{size.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Measuring Tips */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Measuring Tips
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sizeGuide.tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gold/10 text-brand-gold mb-4">
                  {icons[tip.icon] || icons.ruler}
                </div>
                <h3 className="text-xl font-semibold text-brand-black mb-2">{tip.title}</h3>
                <p className="text-neutral-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Brand Fit Guide */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Brand Fit Guide
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sizeGuide.fitGuide.map((brand, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-brand-black mb-2">{brand.brand}</h3>
                <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-sm font-medium mb-3">
                  {brand.fit}
                </span>
                <p className="text-neutral-600">{brand.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-brand-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-white mb-4">
            Still Unsure About Your Size?
          </h2>
          <p className="text-brand-white/80 text-lg mb-8 max-w-xl mx-auto">
            Our customer service team can help you find the perfect fit. Reach out anytime for personalized sizing advice.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            Get Help
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}