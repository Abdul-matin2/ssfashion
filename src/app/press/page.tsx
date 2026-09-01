"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useContact } from "@/hooks/useContact";

interface PressData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  pressKit: {
    description: string;
    assets: Array<{
      name: string;
      description: string;
      icon: string;
    }>;
  };
  media: Array<{
    title: string;
    publication: string;
    date: string;
    excerpt: string;
    url: string;
    logo?: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
  }>;
  contact: {
    email: string;
    phone: string;
    name: string;
  };
}

const defaultPress: PressData = {
  hero: {
    title: "Press & Media",
    subtitle: "Stories about Ghana's fastest-growing fashion brand",
    description: "S&S Fashion has been featured in leading publications across Ghana and West Africa. Download our press kit or get in touch with our media team.",
  },
  pressKit: {
    description: "Everything you need to write about S&S Fashion. Our press kit includes brand guidelines, logos, executive photos, and key facts.",
    assets: [
      {
        name: "Brand Guidelines",
        description: "PDF document with our brand story, mission, values, and visual identity",
        icon: "document",
      },
      {
        name: "Logo Pack",
        description: "High-resolution logos in PNG, SVG, and EPS formats (light and dark versions)",
        icon: "image",
      },
      {
        name: "Executive Photos",
        description: "Professional headshots of our founding team and key leadership",
        icon: "camera",
      },
      {
        name: "Fact Sheet",
        description: "Key statistics, milestones, and facts about S&S Fashion",
        icon: "chart",
      },
    ],
  },
  media: [
    {
      title: "How S&S Fashion is Revolutionizing Sneaker Culture in Ghana",
      publication: "Tech & Style Africa",
      date: "2026-08-10",
      excerpt: "From a small online store to one of Ghana's most trusted footwear retailers, S&S Fashion's journey is nothing short of inspiring. We dive deep into how this local brand is competing with international giants.",
      url: "#",
    },
    {
      title: "10 Ghanaian Brands You Need to Watch in 2026",
      publication: "Business Insider Africa",
      date: "2026-07-22",
      excerpt: "S&S Fashion makes the list of ten innovative Ghanaian brands reshaping retail. Their focus on authenticity and customer experience sets them apart in a crowded market.",
      url: "#",
    },
    {
      title: "The Rise of Authentic Footwear in West Africa",
      publication: "Fashion Ghana Magazine",
      date: "2026-06-15",
      excerpt: "As counterfeit products flood the market, brands like S&S Fashion are building trust through transparency and guaranteed authenticity. A look at the changing landscape.",
      url: "#",
    },
    {
      title: "S&S Fashion Partners with Local Artisans for Limited Edition Collection",
      publication: "Ghana Web",
      date: "2026-05-08",
      excerpt: "In a move that celebrates Ghanaian craftsmanship, S&S Fashion has partnered with local artisans to create a limited-edition collection blending traditional motifs with modern sneaker design.",
      url: "#",
    },
    {
      title: "E-Commerce in Ghana: The Brands Leading the Digital Revolution",
      publication: "Disrupt Africa",
      date: "2026-04-12",
      excerpt: "S&S Fashion's seamless online shopping experience and nationwide delivery network make them a standout in Ghana's growing e-commerce ecosystem.",
      url: "#",
    },
    {
      title: "From Sneaker Enthusiasts to Business Partners: The S&S Story",
      publication: "Citi Business News",
      date: "2026-03-05",
      excerpt: "The founders of S&S Fashion share their journey from passionate sneaker collectors to building one of Ghana's most beloved footwear brands. An inspiring founder story.",
      url: "#",
    },
  ],
  stats: [
    { value: "50+", label: "Media Features" },
    { value: "20+", label: "Countries Reached" },
    { value: "100K+", label: "Social Media Following" },
    { value: "4.8", label: "Average Rating" },
  ],
  contact: {
    email: "press@ssfashion.com",
    phone: "+233 24 123 4567",
    name: "Ama Serwaa, Head of Communications",
  },
};

const icons: Record<string, React.ReactNode> = {
  document: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  image: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  camera: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chart: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

export default function PressPage() {
  const [press, setPress] = useState<PressData>(defaultPress);
  const { contact } = useContact();

  useEffect(() => {
    fetch("/api/admin/press")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setPress(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            {press.hero.title}
          </h1>
          <p className="text-xl text-brand-gold font-medium mb-4">
            {press.hero.subtitle}
          </p>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {press.hero.description}
          </p>
        </div>

        {/* Stats */}
        <section className="mb-16">
          <div className="bg-brand-black rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {press.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-brand-gold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-brand-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Press Kit */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-4">
            Press Kit
          </h2>
          <p className="text-neutral-600 text-center max-w-2xl mx-auto mb-10">
            {press.pressKit.description}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {press.pressKit.assets.map((asset, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300 text-center group cursor-pointer"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gold/10 text-brand-gold mb-4 group-hover:bg-brand-gold group-hover:text-brand-black transition-colors">
                  {icons[asset.icon] || icons.document}
                </div>
                <h3 className="text-lg font-semibold text-brand-black mb-2">{asset.name}</h3>
                <p className="text-neutral-600 text-sm mb-4">{asset.description}</p>
                <span className="inline-flex items-center gap-1 text-brand-gold font-medium text-sm group-hover:gap-2 transition-all">
                  Download
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Media Coverage */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Media Coverage
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {press.media.map((article, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-medium">
                    {article.publication}
                  </span>
                  <span className="text-sm text-neutral-500">{article.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-brand-black mb-3 line-clamp-2">{article.title}</h3>
                <p className="text-neutral-600 text-sm mb-4 flex-1 line-clamp-4">{article.excerpt}</p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-gold hover:text-brand-gold/80 font-medium text-sm transition-colors"
                >
                  Read Article
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Media Inquiries
          </h2>
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold/10 text-brand-gold mb-6">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-brand-black mb-2">{press.contact.name}</h3>
            <p className="text-neutral-600 mb-4">For interviews, features, and media requests</p>
            <div className="space-y-2">
              <a
                href={`mailto:${contact.email}`}
                className="block text-brand-gold hover:text-brand-gold/80 font-medium transition-colors"
              >
                {contact.email}
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="block text-neutral-600 hover:text-brand-black transition-colors"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-brand-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-white mb-4">
            Share Our Story
          </h2>
          <p className="text-brand-white/80 text-lg mb-8 max-w-xl mx-auto">
            Help us spread the word about authentic footwear in Ghana. Tag us on social media or share our story with your audience.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href={contact.socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Follow Us
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-white/20 text-brand-white rounded-xl font-semibold hover:bg-brand-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}