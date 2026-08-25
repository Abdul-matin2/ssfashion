import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/product";

// Category images - add your images to public/images/categories/
// Format: { categoryValue: "/images/categories/image-filename.jpg" }
const categoryImages: Record<string, string> = {
  Running: "/images/categories/running.jpg",
  Lifestyle: "/images/categories/lifestyle.jpg",
  Basketball: "/images/categories/basketball.jpg",
  Training: "/images/categories/training.jpg",
  Sneakers: "/images/categories/sneakers.jpg",
  Slides: "/images/categories/slides.jpg",
  Boots: "/images/categories/boots.jpg",
};

// Fallback gradient colors (used when no image is provided or fails to load)
const categoryGradients: Record<string, string> = {
  Running: "from-blue-500 to-blue-600",
  Lifestyle: "from-purple-500 to-purple-600",
  Basketball: "from-orange-500 to-orange-600",
  Training: "from-green-500 to-green-600",
  Sneakers: "from-pink-500 to-pink-600",
  Slides: "from-teal-500 to-teal-600",
  Boots: "from-amber-500 to-amber-600",
};

interface ShopByCategoryProps {
  className?: string;
  categories?: Category[];
}

export async function ShopByCategory({ className, categories: preloadedCategories }: ShopByCategoryProps) {
  const categories = preloadedCategories || [];

  return (
    <section
      className={cn("bg-neutral-100 py-12 lg:py-16", className)}
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2
            id="categories-heading"
            className="text-2xl sm:text-3xl font-bold text-brand-black"
          >
            Shop by Category
          </h2>
          <Link
            href="/shop"
            className="text-sm font-medium text-brand-gold hover:text-brand-accent-hover transition-colors flex items-center gap-1"
          >
            View all
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div
          className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 scrollbar-hide"
          role="list"
          aria-label="Product categories"
        >
          {categories.map((category) => {
            const slug = category.toLowerCase().replace(/\s+/g, "-");
            return (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(slug)}`}
              className={cn(
                "flex flex-col items-center gap-2 min-w-[100px] lg:min-w-[120px] flex-shrink-0",
                "p-4 lg:p-6 bg-white rounded-2xl border border-neutral-200",
                "hover:border-brand-gold hover:shadow-card transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              )}
              role="listitem"
              aria-label={`Shop ${category}`}
            >
              <div className="flex items-center justify-center min-h-[60px] w-full relative rounded-xl overflow-hidden">
                {categoryGradients[category] ? (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br",
                      categoryGradients[category]
                    )}
                  />
                ) : null}
              </div>
              <span className="text-sm font-medium text-brand-black text-center">
                {category}
              </span>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}