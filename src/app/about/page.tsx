"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AboutData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
  };
  mission: {
    title: string;
    content: string;
    icon: string;
  };
  vision: {
    title: string;
    content: string;
    icon: string;
  };
  values: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  story: {
    title: string;
    content: string[];
    image: string;
  };
  team: Array<{
    name: string;
    role: string;
    bio: string;
    image: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

const icons: Record<string, React.ReactNode> = {
  target: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  eye: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  shield: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  heart: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  star: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  truck: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h2m6 0a1 1 0 011 1v3a1 1 0 01-1 1m9-10a1 1 0 01-1 1H8a1 1 0 01-1-1V7a4 4 0 118 0z" />
    </svg>
  ),
};

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/about")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setData(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto text-brand-gold" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">Failed to load content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {data.hero.image && (
          <div className="absolute inset-0 z-0">
            <img
              src={data.hero.image}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-brand-black/60" />
          </div>
        )}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-white mb-4">
              {data.hero.title || "Step Into Authenticity"}
            </h1>
            <h2 className="text-xl sm:text-2xl text-brand-gold font-medium mb-6">
              {data.hero.subtitle || "Ghana's Premier Destination for Genuine Branded Footwear"}
            </h2>
            <p className="text-lg sm:text-xl text-brand-white/90 max-w-2xl mx-auto leading-relaxed">
              {data.hero.description || "Discover a curated collection of authentic sneakers and shoes from the world's most coveted brands. Quality you can trust, style you'll love."}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-black">
        <div className="mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-4 gap-8">
          {data.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-gold mb-2">
                {stat.value || "0"}
              </div>
              <div className="text-brand-white/80 text-lg">{stat.label || "Stat"}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12">
          <div className="bg-brand-black rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold/20 text-brand-gold mb-6">
              {icons[data.mission.icon] || icons.target}
            </div>
            <h2 className="text-2xl font-bold text-brand-white mb-4">{data.mission.title || "Our Mission"}</h2>
            <p className="text-brand-white/80 leading-relaxed">{data.mission.content || "To provide Ghanaians with access to authentic, high-quality branded footwear at fair prices, delivered with exceptional customer service."}</p>
          </div>
          <div className="bg-brand-black rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold/20 text-brand-gold mb-6">
              {icons[data.vision.icon] || icons.eye}
            </div>
            <h2 className="text-2xl font-bold text-brand-white mb-4">{data.vision.title || "Our Vision"}</h2>
            <p className="text-brand-white/80 leading-relaxed">{data.vision.content || "To become the most trusted and loved footwear retailer in West Africa, known for authenticity, variety, and customer satisfaction."}</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-4">Our Core Values</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300 border border-neutral-100"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gold/10 text-brand-gold mb-4">
                  {icons[value.icon] || icons.shield}
                </div>
                <h3 className="text-xl font-semibold text-brand-black mb-2">{value.title || "Value"}</h3>
                <p className="text-neutral-600 leading-relaxed">{value.description || "Description coming soon."}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-6">{data.story.title || "Our Story"}</h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                {(data.story.content || []).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="lg:order-1 mb-8 lg:mb-0">
              {data.story.image ? (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src={data.story.image}
                    alt={data.story.title || "Our Story"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-2xl bg-neutral-100 flex items-center justify-center">
                  <svg className="h-16 w-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-4">Meet Our Team</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              The passionate people behind S&S Fashion
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-neutral-100">
                <div className="aspect-square relative">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name || "Team Member"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      <svg className="h-16 w-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-lg font-semibold text-brand-black">{member.name || "Team Member"}</h3>
                  <p className="text-brand-gold text-sm font-medium mt-1">{member.role || "Role"}</p>
                  <p className="text-neutral-600 text-sm mt-3 leading-relaxed">{member.bio || "Bio coming soon."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-black">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-white mb-4">Ready to Step Up Your Style?</h2>
          <p className="text-brand-white/80 text-lg mb-8">
            Shop our curated collection of authentic branded footwear. Fast delivery across Ghana.
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
      </section>
    </div>
  );
}