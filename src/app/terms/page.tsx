import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  content: string[];
}

interface TermsData {
  lastUpdated: string;
  effectiveDate: string;
  sections: Section[];
}

async function getTermsData(): Promise<TermsData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/terms`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch terms data:", error);
    return null;
  }
}

export default async function TermsOfServicePage() {
  const data = await getTermsData();

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center p-12">
          <svg className="h-16 w-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-neutral-500">Unable to load Terms of Service. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { lastUpdated, effectiveDate, sections } = data;

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our website and services.
          </p>
          <div className="mt-6 text-sm text-neutral-500">
            <p>Last updated: {lastUpdated}</p>
            <p>Effective date: {effectiveDate}</p>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="bg-white rounded-2xl border border-neutral-200 p-6 mb-12" aria-label="Table of contents">
          <h2 className="text-lg font-semibold text-brand-black mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            {sections.map((section, index) => (
              <li key={index}>
                <a
                  href={`#${section.id}`}
                  className="text-neutral-600 hover:text-brand-gold transition-colors"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Terms Content */}
        <article className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-brand-black mb-4">{section.title}</h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                {section.content.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className={cn(paragraphIndex === 0 && "font-medium")}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        {/* Footer CTA */}
        <div className="mt-16 text-center bg-brand-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-white mb-4">
            Questions About Our Terms?
          </h2>
          <p className="text-brand-white/80 text-lg mb-8 max-w-xl mx-auto">
            We're here to help. Contact our legal team for any clarifications.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            Contact Us
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}