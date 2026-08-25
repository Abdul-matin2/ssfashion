import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { BannerData } from "@/lib/supabase/queries";

const DEFAULT_BANNER: BannerData = {
  enabled: true,
  badge: "Limited Time Only",
  title: "Summer Sale",
  subtitle: "Get up to 40% off on selected sneakers, slides, and lifestyle shoes. Don't miss these incredible deals.",
  discountText: "40%",
  discountLabel: "OFF",
  ctaText: "Shop the Sale",
  ctaLink: "/shop?sale=true",
  image: "https://placehold.co/800x800/1a1a1a/D4A843?text=Summer+Sale",
  imageAlt: "Summer Sale Collection",
  backgroundColor: "brand-black",
  textColor: "brand-white",
  accentColor: "brand-gold",
  badgeColor: "brand-red",
};

function PromoBannerContent({ className, banner: preloadedBanner }: { className?: string; banner?: BannerData | null }) {
  // preloadedBanner can be:
  // - undefined: not passed (client-side fallback, use DEFAULT_BANNER)
  // - null: explicitly no banner (disabled or not found from server)
  // - BannerData: actual banner data
  const banner = preloadedBanner === undefined ? DEFAULT_BANNER : preloadedBanner;

  if (!banner || !banner.enabled) {
    return null;
  }

  // Map color tokens to actual CSS classes
  const getBgClass = (color: string) => {
    const colors: Record<string, string> = {
      "brand-black": "bg-brand-black",
      "brand-white": "bg-brand-white",
      "brand-gold": "bg-brand-gold",
      "brand-orange": "bg-brand-orange",
      "brand-red": "bg-brand-red",
      "brand-green": "bg-brand-green",
      "brand-accent-hover": "bg-brand-accent-hover",
    };
    return colors[color] || "bg-brand-black";
  };

  const getTextClass = (color: string) => {
    const colors: Record<string, string> = {
      "brand-black": "text-brand-black",
      "brand-white": "text-brand-white",
      "brand-gold": "text-brand-gold",
      "brand-orange": "text-brand-orange",
      "brand-red": "text-brand-red",
      "brand-green": "text-brand-green",
      "brand-accent-hover": "text-brand-accent-hover",
    };
    return colors[color] || "text-brand-white";
  };

  const getBadgeBgClass = (color: string) => {
    const colors: Record<string, string> = {
      "brand-black": "bg-brand-black/20 text-brand-black",
      "brand-white": "bg-brand-white/20 text-brand-white",
      "brand-gold": "bg-brand-gold/20 text-brand-gold",
      "brand-orange": "bg-brand-orange/20 text-brand-orange",
      "brand-red": "bg-brand-red/20 text-brand-red",
      "brand-green": "bg-brand-green/20 text-brand-green",
      "brand-accent-hover": "bg-brand-accent-hover/20 text-brand-accent-hover",
    };
    return colors[color] || "bg-brand-red/20 text-brand-red";
  };

  const bgClass = getBgClass(banner.backgroundColor);
  const textClass = getTextClass(banner.textColor);
  const accentClass = getTextClass(banner.accentColor);
  const badgeClass = getBadgeBgClass(banner.badgeColor);

  return (
    <section
      className={cn(
        "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 overflow-hidden",
        "rounded-3xl",
        bgClass,
        textClass,
        className
      )}
      aria-labelledby="promo-heading"
    >
      <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column - Content */}
        <div className="text-center lg:text-left">
          {banner.badge && (
            <span className={cn("inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4", badgeClass)}>
              {banner.badge}
            </span>
          )}
          <h2
            id="promo-heading"
            className={cn("text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight", textClass)}
          >
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className={cn("text-lg mb-8 max-w-lg mx-auto lg:mx-0", textClass + "/80")}>
              {banner.subtitle}
            </p>
          )}
          {banner.discountText && (
            <div className="flex items-center justify-center lg:justify-start gap-6 mb-8">
              <div>
                <span className={cn("text-5xl lg:text-6xl font-black", accentClass)}>
                  {banner.discountText}
                </span>
                <span className={cn("text-xl font-bold ml-1", accentClass)}>
                  {banner.discountLabel}
                </span>
              </div>
            </div>
          )}
          {banner.ctaText && banner.ctaLink && (
            <Link href={banner.ctaLink}>
              <Button
                size="lg"
                className={cn(
                  "bg-brand-white text-brand-black hover:bg-neutral-100",
                  banner.backgroundColor === "brand-white" && "bg-brand-black text-brand-white hover:bg-neutral-900"
                )}
              >
                {banner.ctaText}
              </Button>
            </Link>
          )}
        </div>

        {/* Right Column - Product Image */}
        <div className="relative">
          <div className="relative z-10">
            <div className="aspect-square max-w-md mx-auto lg:max-w-lg rounded-3xl overflow-hidden shadow-2xl">
              {banner.image && (
                <img
                  src={banner.image}
                  alt={banner.imageAlt || banner.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </div>

          {/* Floating Badge */}
          {banner.discountText && (
            <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 animate-bounce">
              <div className={cn("rounded-2xl p-4 lg:p-6 shadow-lg", accentClass + " text-white")}>
                <span className="text-3xl lg:text-4xl font-black">{banner.discountText}</span>
                <span className="block text-sm font-bold text-center">{banner.discountLabel}</span>
              </div>
            </div>
          )}

          {/* Background decoration using accent color */}
          <div className={cn("absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2", accentClass + "/10")} />
          <div className={cn("absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2", "bg-brand-orange/10")} />
        </div>
      </div>
    </section>
  );
}

export async function PromoBanner({ className }: { className?: string }) {
  const { getBanner } = await import("@/lib/supabase/queries");
  const banner = await getBanner();

  return (
    <Suspense
      fallback={
        <section
          className={cn(
            "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 overflow-hidden",
            "bg-brand-black rounded-3xl text-brand-white"
          )}
          aria-hidden="true"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-800 w-1/4 rounded" />
            <div className="h-8 bg-neutral-800 w-1/2 rounded" />
            <div className="h-6 bg-neutral-800 w-3/4 rounded" />
          </div>
        </section>
      }
    >
      <PromoBannerContent className={className} banner={banner} />
    </Suspense>
  );
}