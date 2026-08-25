"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface HeroSlide {
  image: string;
  alt: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

interface HeroProps {
  className?: string;
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number; // in ms
  showDots?: boolean;
  showArrows?: boolean;
}

export function Hero({
  className,
  slides = [],
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
}: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (index !== currentIndex && !isTransitioning && slides.length > 0) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [currentIndex, isTransitioning, slides.length]);

  const goNext = useCallback(() => {
    if (slides.length > 0) {
      goToSlide((currentIndex + 1) % slides.length);
    }
  }, [currentIndex, slides.length, goToSlide]);

  const goPrev = useCallback(() => {
    if (slides.length > 0) {
      goToSlide((currentIndex - 1 + slides.length) % slides.length);
    }
  }, [currentIndex, slides.length, goToSlide]);

  // Auto-play effect
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const interval = setInterval(goNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slides.length, goNext]);

  // Pause on hover
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const interval = isHovered ? null : setInterval(goNext, autoPlayInterval);
    return () => clearInterval(interval as NodeJS.Timeout);
  }, [autoPlay, autoPlayInterval, slides.length, goNext, isHovered]);

  const currentSlide = slides[currentIndex];

  return (
    <section
      className={cn(
        "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24",
        className
      )}
      aria-labelledby="hero-heading"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Slides Container */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className="absolute inset-0 transition-all duration-700 ease-out"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              transform: `translateX(${((index - currentIndex) * 100)}%)`,
              opacity: index === currentIndex ? 1 : 0,
              pointerEvents: index === currentIndex ? "auto" : "none",
              zIndex: index === currentIndex ? 1 : 0,
            }}
            role="img"
            aria-label={slide.alt}
          >
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-black/80 via-brand-black/60 to-transparent" />
          </div>
        ))}
      </div>

      {/* Gradient Background (fallback when no slides) */}
      {slides.length === 0 && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-transparent to-brand-orange/10 rounded-3xl blur-3xl z-0" />
      )}

      {/* Floating Badge Card - Bottom Right of Hero Section */}
      <div className="absolute -bottom-6 -right-6 lg:-bottom-8 lg:-right-8 z-20 animate-in slide-in-from-bottom-4 duration-500 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 lg:p-6 shadow-card max-w-xs pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-brand-gold/20 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-brand-gold uppercase tracking-wide">New Arrivals</p>
              <p className="text-sm font-semibold text-brand-white">Nike Air Jordan 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column - Content */}
        <div className="text-center lg:text-left">
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-brand-white mb-6"
          >
            {currentSlide.subheadline || (
              <>
                Step Into{" "}
                <span className="text-brand-gold">Greatness</span>
              </>
            )}
          </h1>
          <p className="text-lg sm:text-xl text-neutral-300 mb-8 max-w-xl mx-auto lg:mx-0">
            Discover the latest sneakers, shoes, and slides from top brands.
            Premium quality, authentic styles, and unbeatable comfort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            {currentSlide.ctaText && currentSlide.ctaHref ? (
              <a href={currentSlide.ctaHref}>
                <Button size="lg" className="w-full sm:w-auto">
                  {currentSlide.ctaText}
                </Button>
              </a>
            ) : (
              <Button size="lg" className="w-full sm:w-auto">
                Shop Now →
              </Button>
            )}
            {currentSlide.secondaryCtaText && currentSlide.secondaryCtaHref ? (
              <a href={currentSlide.secondaryCtaHref}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black">
                  {currentSlide.secondaryCtaText}
                </Button>
              </a>
            ) : (
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black">
                Explore Brands
              </Button>
            )}
          </div>
        </div>

        {/* Right Column - Carousel Controls */}
        <div className="relative">
          {/* Carousel Dots */}
          {showDots && slides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 lg:bottom-8" role="tablist" aria-label="Hero slides">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    index === currentIndex
                      ? "bg-brand-gold"
                      : "bg-neutral-300 hover:bg-brand-gold"
                  )}
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Carousel Arrows */}
          {showArrows && slides.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 lg:left-0 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-brand-white transition-colors"
                aria-label="Previous slide"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 lg:right-0 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-brand-white transition-colors"
                aria-label="Next slide"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// Default export for easy importing
export default Hero;