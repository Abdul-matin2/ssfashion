"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Cookie {
  name: string;
  purpose: string;
  duration: string;
  provider: string;
}

interface CookiesData {
  lastUpdated: string;
  effectiveDate: string;
  essentialCookies: Cookie[];
  analyticsCookies: Cookie[];
  functionalCookies: Cookie[];
  marketingCookies: Cookie[];
}

const cookieCategories = [
  { key: "essentialCookies", label: "Essential Cookies (Always Active)", color: "red", icon: (
    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ) },
  { key: "analyticsCookies", label: "Analytics Cookies", color: "blue", icon: (
    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ) },
  { key: "functionalCookies", label: "Functional Cookies", color: "green", icon: (
    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) },
  { key: "marketingCookies", label: "Marketing Cookies", color: "purple", icon: (
    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) },
] as const;

type CategoryKey = typeof cookieCategories[number]["key"];

const categoryDescriptions = {
  essentialCookies: "These cookies are strictly necessary for the website to function properly. They enable core functionality such as security, authentication, session management, and fraud prevention. You cannot opt out of these cookies.",
  analyticsCookies: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use Google Analytics to analyze site traffic and user behavior. You can opt out of these cookies.",
  functionalCookies: "These cookies enable enhanced functionality and personalization, such as remembering your shopping cart, wishlist, language preference, and currency. They may be set by us or by third-party providers whose services we use. You can opt out of these cookies.",
  marketingCookies: "These cookies are used to track visitors across websites to display relevant and engaging advertisements. They are only set with your explicit consent. You can opt out of these cookies at any time.",
};

const renderCookieTable = (cookies: Cookie[], category: string) => (
  <div className="overflow-x-auto mb-8">
    <table className="w-full text-sm" role="table" aria-label={`${category} cookies`}>
      <thead className="bg-neutral-100">
        <tr>
          <th className="px-4 py-3 text-left font-medium text-brand-black">Cookie Name</th>
          <th className="px-4 py-3 text-left font-medium text-brand-black">Purpose</th>
          <th className="px-4 py-3 text-left font-medium text-brand-black">Duration</th>
          <th className="px-4 py-3 text-left font-medium text-brand-black">Provider</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-200">
        {cookies.map((cookie, index) => (
          <tr key={index} className={cn(index % 2 === 0 && "bg-neutral-50/50")}>
            <td className="px-4 py-3 font-mono text-sm text-brand-black">{cookie.name}</td>
            <td className="px-4 py-3 text-neutral-600">{cookie.purpose}</td>
            <td className="px-4 py-3 text-neutral-600">{cookie.duration}</td>
            <td className="px-4 py-3 text-neutral-600">{cookie.provider}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function CookiePolicyPage() {
  const [data, setData] = useState<CookiesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/cookies");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch cookie data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center p-12">
          <svg className="animate-spin h-16 w-16 mx-auto text-brand-gold mb-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-neutral-500">Loading Cookie Policy...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center p-12">
          <svg className="h-16 w-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-neutral-500">Unable to load Cookie Policy. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { lastUpdated, effectiveDate, essentialCookies, analyticsCookies, functionalCookies, marketingCookies } = data;

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            This policy explains what cookies are, how we use them, and your choices regarding cookies on our website.
          </p>
          <div className="mt-6 text-sm text-neutral-500">
            <p>Last updated: {lastUpdated}</p>
            <p>Effective date: {effectiveDate}</p>
          </div>
        </div>

        {/* What Are Cookies */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-brand-black mb-4">What Are Cookies?</h2>
          <div className="space-y-4 text-neutral-600 leading-relaxed">
            <p>
              Cookies are small text files that are placed on your device (computer, phone, tablet) when you visit a website.
              They are widely used to make websites work more efficiently, as well as to provide information to the site owners.
            </p>
            <p>
              Cookies can be <strong>"session cookies"</strong> (deleted when you close your browser) or <strong>"persistent cookies"</strong>
              (remain on your device until they expire or you delete them). They can also be <strong>"first-party cookies"</strong>
              (set by the website you're visiting) or <strong>"third-party cookies"</strong> (set by other domains, such as analytics or advertising providers).
            </p>
            <p>
              Similar technologies include web beacons, pixels, local storage, and session storage. For simplicity, this policy uses
              the term "cookies" to refer to all such technologies.
            </p>
          </div>
        </section>

        {/* How We Use Cookies */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-brand-black mb-4">How We Use Cookies</h2>
          <div className="space-y-4 text-neutral-600 leading-relaxed">
            <p>We use cookies for the following purposes:</p>
            <ul className="space-y-3 pl-6 list-disc">
              <li><strong>Essential:</strong> To enable core functionality such as security, authentication, and session management. These cookies are strictly necessary and cannot be disabled.</li>
              <li><strong>Analytics:</strong> To understand how visitors interact with our website, which helps us improve the user experience.</li>
              <li><strong>Functional:</strong> To remember your preferences and provide enhanced features like saving your cart and wishlist.</li>
              <li><strong>Marketing:</strong> To deliver relevant advertisements and measure the effectiveness of our marketing campaigns (only with your consent).</li>
            </ul>
          </div>
        </section>

        {/* Cookie Categories Tables */}
        <section className="space-y-12 mb-12">
          {cookieCategories.map((cat) => (
            <div key={cat.key} className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full bg-${cat.color}-100 flex items-center justify-center`}>
                  {cat.icon}
                </div>
                <h2 className="text-2xl font-bold text-brand-black">{cat.label}</h2>
              </div>
              <p className="text-neutral-600 mb-6">
                {categoryDescriptions[cat.key]}
              </p>
              {renderCookieTable(data[cat.key] as Cookie[], cat.label)}
            </div>
          ))}
        </section>

        {/* Managing Cookies */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-brand-black mb-4">Managing Your Cookie Preferences</h2>
          <div className="space-y-4 text-neutral-600 leading-relaxed">
            <p>You have several options to control cookies:</p>
            <ul className="space-y-3 pl-6 list-disc">
              <li><strong>Cookie Banner:</strong> On your first visit (or after clearing cookies), a cookie banner appears allowing you to accept all cookies, reject non-essential cookies, or customize your preferences by category.</li>
              <li><strong>Cookie Settings Link:</strong> You can change your preferences at any time by clicking the "Cookie Settings" link in the footer of any page.</li>
              <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies through their settings. Note that blocking essential cookies may break website functionality.</li>
              <li><strong>Third-Party Opt-Out:</strong> For analytics cookies, you can use the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Google Analytics Opt-out Browser Add-on</a>. For marketing cookies, visit <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Digital Advertising Alliance</a> or <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Your Online Choices (EU)</a>.</li>
            </ul>
          </div>
        </section>

        {/* Cookie Consent Withdrawal */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-brand-black mb-4">Withdrawing Consent</h2>
          <div className="space-y-4 text-neutral-600 leading-relaxed">
            <p>
              You can withdraw your consent for non-essential cookies at any time by:
            </p>
            <ul className="space-y-3 pl-6 list-disc">
              <li>Clicking "Cookie Settings" in the footer and adjusting your preferences</li>
              <li>Clearing cookies from your browser settings</li>
              <li>Using the opt-out tools mentioned above for specific third-party cookies</li>
            </ul>
            <p>
              Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.
              Some cookies may remain on your device until they expire or you manually delete them.
            </p>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-brand-black mb-4">Changes to This Cookie Policy</h2>
          <div className="space-y-4 text-neutral-600 leading-relaxed">
            <p>We may update this Cookie Policy to reflect changes in the cookies we use or for legal, regulatory, or operational reasons.</p>
            <p>When we make material changes, we will update the "Last updated" date at the top of this page and, where appropriate, notify you via our cookie banner or email. We encourage you to review this policy periodically.</p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-brand-black mb-4">Contact Us</h2>
          <div className="space-y-4 text-neutral-600 leading-relaxed">
            <p>If you have any questions about our use of cookies, please contact us:</p>
            <ul className="space-y-2 pl-6 list-disc">
              <li>Email: privacy@ssfashion.com</li>
              <li>Phone: +233 24 123 4567</li>
              <li>Address: S&S Fashion, 12 Independence Avenue, Accra, Greater Accra, Ghana</li>
            </ul>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="mt-16 text-center bg-brand-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-white mb-4">
            Manage Your Cookie Preferences
          </h2>
          <p className="text-brand-white/80 text-lg mb-8 max-w-xl mx-auto">
            You can update your cookie choices at any time through our cookie settings.
          </p>
          <button
            onClick={() => {
              // Trigger cookie consent banner to reappear
              if (typeof window !== "undefined") {
                localStorage.removeItem("cookie-consent");
                window.location.reload();
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            Open Cookie Settings
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}