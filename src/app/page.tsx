import { Hero } from "@/components/homepage/Hero";
import { TopBrands } from "@/components/homepage/TopBrands";
import { ShopByCategory } from "@/components/homepage/ShopByCategory";
import { BestSellers } from "@/components/homepage/BestSellers";
import { PromoBanner } from "@/components/homepage/PromoBanner";
import { TrustBadges } from "@/components/homepage/TrustBadges";
import { getBestSellers, getNewProducts, getBrands, getCategories } from "@/lib/supabase/queries";

export default async function HomePage() {
  const [bestSellers, newProducts, brands, categories] = await Promise.all([
    getBestSellers(5),
    getNewProducts(8),
    getBrands(),
    getCategories(),
  ]);

  const heroSlides = [
    {
      image: "/images/hero-image.jpeg",
      alt: "Summer Collection 2026",
      subheadline: "Step Into Greatness",
      ctaText: "Shop Now →",
      ctaHref: "/shop",
      secondaryCtaText: "Explore Brands",
      secondaryCtaHref: "/shop?view=brands",
    },
    {
      image: "/images/hero-image2.jpeg",
      alt: "Best Selling Sneakers",
      subheadline: "Discover Our Best Sellers",
      ctaText: "View Best Sellers",
      ctaHref: "/shop?sort=rating",
      secondaryCtaText: "New Arrivals",
      secondaryCtaHref: "/shop?new=true",
    },
    {
      image: "/images/hero-image3.jpeg",
      alt: "Exclusive Drops",
      subheadline: "Exclusive Drops You Can't Miss",
      ctaText: "Shop Exclusives",
      ctaHref: "/shop?sale=true",
      secondaryCtaText: "Notify Me",
      secondaryCtaHref: "/contact",
    },
  ];

  return (
    <>
      <Hero
        slides={heroSlides}
        autoPlay={true}
        autoPlayInterval={5000}
        showDots={true}
        showArrows={true}
      />
      <TopBrands brands={brands} />
      <ShopByCategory categories={categories} />
      <BestSellers products={bestSellers} />
      <PromoBanner />
      <TrustBadges />
    </>
  );
}