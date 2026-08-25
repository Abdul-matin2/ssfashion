"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CareersData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  culture: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  benefits: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  positions: Array<{
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
    posted: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    quote: string;
    image: string;
  }>;
}

const defaultCareers: CareersData = {
  hero: {
    title: "Join Our Team",
    subtitle: "Help us redefine fashion retail in Ghana",
    description: "We're building something special, a brand that Ghanaians trust for authentic, high-quality footwear. We need passionate people to join us on this journey.",
  },
  culture: [
    {
      title: "Innovation First",
      icon: "lightbulb",
      description: "We encourage creative thinking and new ideas. Every team member has a voice in shaping our future.",
    },
    {
      title: "Growth Mindset",
      icon: "trending",
      description: "We invest in our people. Regular training, mentorship programs, and clear career progression paths.",
    },
    {
      title: "Team Collaboration",
      icon: "users",
      description: "We work together across departments. Silos don't exist here — we succeed as one team.",
    },
    {
      title: "Work-Life Balance",
      icon: "heart",
      description: "We believe happy people do great work. Flexible hours, remote work options, and respect for personal time.",
    },
  ],
  benefits: [
    {
      title: "Competitive Salary",
      icon: "currency",
      description: "Above-market compensation packages with performance bonuses and salary reviews twice a year.",
    },
    {
      title: "Health Insurance",
      icon: "shield",
      description: "Comprehensive health coverage for you and your family. Medical, dental, and vision included.",
    },
    {
      title: "Employee Discounts",
      icon: "tag",
      description: "40% discount on all S&S Fashion products. Plus exclusive access to new collections before public launch.",
    },
    {
      title: "Training & Development",
      icon: "academic",
      description: "Annual learning budget, conference attendance, and online course subscriptions. We invest in your growth.",
    },
    {
      title: "Paid Time Off",
      icon: "calendar",
      description: "25 days annual leave, plus public holidays. Additional personal days when you need them.",
    },
    {
      title: "Remote Flexibility",
      icon: "home",
      description: "Hybrid work model with 3 days in-office and 2 days remote. We trust our team to manage their time.",
    },
  ],
  positions: [
    {
      title: "Social Media Manager",
      department: "Marketing",
      location: "Accra",
      type: "Full-time",
      description: "Lead our social media strategy across Instagram, TikTok, and Twitter. Create engaging content that resonates with our audience.",
      requirements: [
        "3+ years social media management experience",
        "Strong understanding of Ghanaian social media landscape",
        "Experience with content creation tools (Canva, Adobe Suite)",
        "Excellent written and verbal communication skills",
      ],
      posted: "2 days ago",
    },
    {
      title: "Warehouse Operations Lead",
      department: "Operations",
      location: "Accra",
      type: "Full-time",
      description: "Manage daily warehouse operations including inventory, order fulfillment, and quality control.",
      requirements: [
        "5+ years warehouse/logistics experience",
        "Leadership experience managing teams of 10+",
        "Proficiency with inventory management systems",
        "Strong organizational and problem-solving skills",
      ],
      posted: "1 week ago",
    },
    {
      title: "Customer Service Representative",
      department: "Customer Experience",
      location: "Accra (Remote available)",
      type: "Full-time",
      description: "Be the first point of contact for our customers. Handle inquiries, resolve issues, and ensure exceptional service.",
      requirements: [
        "1+ years customer service experience",
        "Excellent phone and email communication",
        "Patient, empathetic, and solution-oriented",
        "Available to work flexible hours including weekends",
      ],
      posted: "3 days ago",
    },
    {
      title: "Photographer / Videographer",
      department: "Creative",
      location: "Accra",
      type: "Contract",
      description: "Capture high-quality product photos and brand videos for our e-commerce platform and social media channels.",
      requirements: [
        "Portfolio demonstrating product/lifestyle photography",
        "Experience with studio and outdoor shoots",
        "Video editing skills (Premiere Pro, Final Cut)",
        "Own equipment (camera, lighting, basic studio setup)",
      ],
      posted: "5 days ago",
    },
  ],
  testimonials: [
    {
      name: "Kofi Mensah",
      role: "Marketing Manager",
      quote: "Working at S&S Fashion has been the most rewarding experience of my career. The team is incredibly supportive, and I've grown more here in 2 years than in my previous 5 years elsewhere.",
      image: "",
    },
    {
      name: "Ama Darko",
      role: "Customer Service Lead",
      quote: "What I love most is that my ideas actually get heard and implemented. Management genuinely cares about employee feedback, and we see real changes based on our suggestions.",
      image: "",
    },
  ],
};

const icons: Record<string, React.ReactNode> = {
  lightbulb: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  trending: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  users: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  heart: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  currency: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  shield: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  tag: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  academic: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    </svg>
  ),
  calendar: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  home: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  mapPin: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  briefcase: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

export default function CareersPage() {
  const [careers, setCareers] = useState<CareersData>(defaultCareers);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/careers")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setCareers(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            {careers.hero.title}
          </h1>
          <p className="text-xl text-brand-gold font-medium mb-4">
            {careers.hero.subtitle}
          </p>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {careers.hero.description}
          </p>
        </div>

        {/* Culture */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Our Culture
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {careers.culture.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gold/10 text-brand-gold mb-4 mx-auto">
                  {icons[item.icon] || icons.lightbulb}
                </div>
                <h3 className="text-xl font-semibold text-brand-black mb-2">{item.title}</h3>
                <p className="text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Benefits & Perks
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold mb-4">
                  {icons[benefit.icon] || icons.tag}
                </div>
                <h3 className="text-lg font-semibold text-brand-black mb-2">{benefit.title}</h3>
                <p className="text-neutral-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            Open Positions
          </h2>
          <div className="space-y-4">
            {careers.positions.map((position, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setSelectedPosition(selectedPosition === index ? null : index)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-brand-black">{position.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          {icons.briefcase}
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          {icons.mapPin}
                          {position.location}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium">
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-500">{position.posted}</span>
                      <svg
                        className={cn(
                          "h-5 w-5 text-brand-gold transition-transform duration-200",
                          selectedPosition === index && "rotate-90"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {selectedPosition === index && (
                  <div className="px-6 pb-6 border-t border-neutral-200 pt-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-neutral-600 mb-4">{position.description}</p>
                    <h4 className="font-semibold text-brand-black mb-3">Requirements:</h4>
                    <ul className="space-y-2 mb-6">
                      {position.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-neutral-600">
                          <svg className="h-5 w-5 flex-shrink-0 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/careers/apply?position=${encodeURIComponent(position.title)}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors"
                    >
                      Apply Now
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black text-center mb-10">
            What Our Team Says
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {careers.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <svg className="h-8 w-8 text-brand-gold/40 mb-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                </svg>
                <p className="text-neutral-600 italic mb-6 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
                    {testimonial.image ? (
                      <img src={testimonial.image} alt={testimonial.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <svg className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-black">{testimonial.name}</p>
                    <p className="text-sm text-brand-gold">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-brand-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-white mb-4">
            Don&apos;t See Your Role?
          </h2>
          <p className="text-brand-white/80 text-lg mb-8 max-w-xl mx-auto">
            We&apos;re always looking for talented people. Send us your resume and tell us how you can contribute to the S&S Fashion team.
          </p>
          <Link
            href="mailto:careers@ssfashion.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            Send Your Resume
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}