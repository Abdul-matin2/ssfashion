"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SustainabilityData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
  };
  commitments: Array<{
    title: string;
    description: string;
    icon: string;
    goals: string[];
  }>;
  initiatives: Array<{
    title: string;
    description: string;
    icon: string;
    progress: number;
    target: string;
  }>;
  timeline: Array<{
    year: string;
    milestone: string;
    description: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
  }>;
  partners: Array<{
    name: string;
    description: string;
    logo: string;
  }>;
}

const defaultSustainability: SustainabilityData = {
  hero: {
    title: "Our Commitment to Sustainability",
    subtitle: "Fashion that cares for people and planet",
    description: "At S&S Fashion, we believe style and sustainability go hand in hand. We're committed to reducing our environmental impact while delivering the authentic footwear our customers love.",
    image: "",
  },
  commitments: [
    {
      title: "Ethical Sourcing",
      icon: "handshake",
      description: "We partner with brands that uphold fair labor practices and ethical manufacturing standards.",
      goals: [
        "100% of suppliers audited annually for labor practices",
        "Zero tolerance for child labor or forced labor",
        "Fair wages verified across our supply chain",
      ],
    },
    {
      title: "Eco-Friendly Packaging",
      icon: "leaf",
      description: "Reducing waste through sustainable packaging solutions across our operations.",
      goals: [
        "100% recyclable or biodegradable packaging by 2027",
        "50% reduction in single-use plastics achieved",
        "Partnership with local recyclers for packaging disposal",
      ],
    },
    {
      title: "Carbon Neutral Delivery",
      icon: "globe",
      description: "Working toward carbon-neutral delivery operations across Ghana.",
      goals: [
        "Carbon offset program launched for all deliveries",
        "Transition to electric delivery vehicles by 2028",
        "Route optimization to reduce delivery emissions",
      ],
    },
    {
      title: "Community Impact",
      icon: "users",
      description: "Giving back to the communities where we live and work through education and economic empowerment.",
      goals: [
        "100 scholarships awarded to Ghanaian youth",
        "Local artisan partnerships supporting 50+ artisans",
        "Annual donation drive for underserved communities",
      ],
    },
  ],
  initiatives: [
    {
      title: "Recycled Packaging Program",
      icon: "recycle",
      description: "All shoe boxes are made from 80% recycled cardboard. Tissue paper replaced with seed paper that can be planted.",
      progress: 85,
      target: "100% recycled packaging by 2027",
    },
    {
      title: "Carbon Offset Initiative",
      icon: "cloud",
      description: "Every delivery is carbon-offset through our partnership with verified reforestation projects in Ghana.",
      progress: 100,
      target: "Carbon-neutral delivery achieved",
    },
    {
      title: "Shoe Donation Drive",
      icon: "gift",
      description: "Collecting and donating gently used shoes to communities in need across Ghana.",
      progress: 60,
      target: "10,000 pairs donated by 2027",
    },
    {
      title: "Water Conservation",
      icon: "droplet",
      description: "Working with partner brands to reduce water usage in the manufacturing process.",
      progress: 40,
      target: "30% reduction in water footprint by 2028",
    },
  ],
  timeline: [
    { year: "2024", milestone: "Sustainability Commitment", description: "Launched our sustainability program with formal commitments to ethical sourcing and environmental responsibility." },
    { year: "2025", milestone: "Packaging Transformation", description: "Transitioned to 80% recycled packaging materials and introduced plantable seed paper for tissue wrapping." },
    { year: "2025", milestone: "Carbon Offset Launch", description: "Partnered with Ghana Reforestation Network to offset all delivery emissions." },
    { year: "2026", milestone: "Zero Waste Goal", description: "Achieved 90% waste diversion rate in our warehouse operations through recycling and composting." },
    { year: "2027", milestone: "100% Recyclable Packaging", description: "Target: All packaging fully recyclable or biodegradable, with no single-use plastics." },
    { year: "2028", milestone: "Electric Delivery Fleet", description: "Target: Transition 50% of our delivery fleet to electric vehicles." },
  ],
  stats: [
    { value: "80%", label: "Recycled Packaging" },
    { value: "5,000+", label: "Trees Planted" },
    { value: "3,500", label: "Shoes Donated" },
    { value: "100%", label: "Carbon Offset" },
  ],
  partners: [
    { name: "Ghana Reforestation Network", description: "Carbon offset partner for reforestation projects", logo: "" },
    { name: "Fair Trade Ghana", description: "Ethical sourcing certification and auditing", logo: "" },
    { name: "Recycle Ghana", description: "Packaging recycling and waste management", logo: "" },
    { name: "Education For All Ghana", description: "Scholarship program for underserved youth", logo: "" },
  ],
};

const icons: Record<string, React.ReactNode> = {
  handshake: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  leaf: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  globe: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  users: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  recycle: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  cloud: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17a5 5 0 01-.916-9.916 5.002 5.002 0 019.832 0A5.002 5.002 0 0116 17H8z" />
    </svg>
  ),
  gift: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  droplet: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21c-4.97 0-9-4.03-9-9 0-3.53 2.61-7.59 5.2-10.5.46-.51 1.28-.51 1.74 0C12.39 4.41 15 8.47 15 12c0 4.97-4.03 9-9 9zm0-18c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
    </svg>
  ),
};

export default function SustainabilityPage() {
  const [data, setData] = useState<SustainabilityData>(defaultSustainability);

  useEffect(() => {
    fetch("/api/admin/sustainability")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            {data.hero.title}
          </h1>
          <p className="text-xl text-brand-gold font-medium mb-4">
            {data.hero.subtitle}
          </p>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {data.hero.description}
          </p>
        </div>

        {/* Stats */}
        <section className="mb-16">
          <div className="bg-brand-black rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {data.stats.map((stat, index) => (
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

        {/* Commitments */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Our Commitments
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {data.commitments.map((commitment, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold flex-shrink-0">
                    {icons[commitment.icon] || icons.leaf}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-brand-black">{commitment.title}</h3>
                    <p className="text-neutral-600 mt-1">{commitment.description}</p>
                  </div>
                </div>
                <ul className="space-y-2 ml-16">
                  {commitment.goals.map((goal, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <svg className="h-4 w-4 flex-shrink-0 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Initiatives with Progress */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Current Initiatives
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {data.initiatives.map((initiative, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold">
                    {icons[initiative.icon] || icons.leaf}
                  </div>
                  <h3 className="text-lg font-semibold text-brand-black">{initiative.title}</h3>
                </div>
                <p className="text-neutral-600 mb-4">{initiative.description}</p>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600">Progress</span>
                    <span className="font-medium text-brand-gold">{initiative.progress}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div
                      className="bg-brand-gold h-2 rounded-full transition-all duration-500"
                      style={{ width: `${initiative.progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">Target: {initiative.target}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Our Journey
          </h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-brand-gold/20" />
            <div className="space-y-8">
              {data.timeline.map((item, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="hidden md:block md:w-1/2" />
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-brand-gold rounded-full -translate-x-2 md:-translate-x-2 z-10" />
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12"}`}>
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
                      <span className="text-sm font-bold text-brand-gold">{item.year}</span>
                      <h3 className="text-lg font-semibold text-brand-black mt-1">{item.milestone}</h3>
                      <p className="text-neutral-600 text-sm mt-2">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Our Partners
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.name} className="h-16 mx-auto mb-4 object-contain" />
                ) : (
                  <div className="h-16 w-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <h3 className="font-semibold text-brand-black mb-2">{partner.name}</h3>
                <p className="text-neutral-600 text-sm">{partner.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-brand-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-white mb-4">
            Join Our Sustainability Journey
          </h2>
          <p className="text-brand-white/80 text-lg mb-8 max-w-xl mx-auto">
            Every purchase you make supports our commitment to ethical practices and environmental responsibility. Shop consciously with S&S Fashion.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors"
            >
              Shop Sustainable
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-brand-white/20 text-brand-white rounded-xl font-semibold hover:bg-brand-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}