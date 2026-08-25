"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWishlist, WishlistItemWithDetails } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Product, Brand, Category, Gender } from "@/types/product";

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItem, clearWishlist, getTotalItems } = useWishlist();
  const { addItem, isInCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-brand-gold">Loading wishlist...</div>
      </div>
    );
  }

  const totalItems = getTotalItems();

  // Items now carry full product details (WishlistItemWithDetails)
  const wishlistItems = items as WishlistItemWithDetails[];

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="h-24 w-24 text-neutral-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black mb-2">Your wishlist is empty</h1>
          <p className="text-neutral-500 mb-8">Save items you love to find them later.</p>
          <Button variant="primary" size="lg" onClick={() => router.push("/shop")}>
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Convert WishlistItemWithDetails to Product for addItem call
  const toProduct = (item: WishlistItemWithDetails): Product => ({
    id: item.productId,
    name: item.name,
    brand: item.brand as Brand,
    category: item.category as Category,
    gender: "Unisex" as Gender,
    price: item.price,
    compareAtPrice: item.compareAtPrice,
    images: [item.image],
    sizes: [{ value: item.colors[0]?.name || "Default", inStock: true }], // placeholder - wishlist items don't have size
    colors: item.colors,
    rating: 0,
    reviewCount: 0,
    isFeatured: false,
    isNew: false,
    slug: item.slug,
    description: "",
    shortDescription: "",
    tags: [],
  });

  const handleAddToCart = (item: WishlistItemWithDetails) => {
    const product = toProduct(item);
    const firstSize = product.sizes.find((s) => s.inStock)?.value || product.sizes[0]?.value || "";
    const firstColor = product.colors[0]?.name || "";
    addItem(product, firstSize, firstColor, 1);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {showAddedToast && (
        <div className="fixed top-24 right-4 z-50 bg-brand-black text-white px-6 py-3 rounded-xl shadow-card animate-in slide-in-from-top-full duration-300">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Added to cart</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 lg:mb-12">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-brand-black mb-2">My Wishlist</h1>
            <p className="text-neutral-600">
              {totalItems} item{totalItems !== 1 ? "s" : ""} saved
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearWishlist} className="text-brand-red border-brand-red hover:bg-brand-red/5">
              Clear Wishlist
            </Button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6" role="list" aria-label="Wishlist items">
          {wishlistItems.map((item) => {
            // Create a minimal Product object for ProductCard
            const product: Product = {
              id: item.productId,
              name: item.name,
              brand: item.brand as Brand,
              category: item.category as Category,
              gender: "Unisex" as Gender,
              price: item.price,
              compareAtPrice: item.compareAtPrice,
              images: [item.image],
              sizes: [{ value: item.colors[0]?.name || "Default", inStock: true }],
              colors: item.colors,
              rating: 0,
              reviewCount: 0,
              isFeatured: false,
              isNew: false,
              slug: item.slug,
              description: "",
              shortDescription: "",
              tags: [],
            };

            const inCart = isInCart(item.productId, item.colors[0]?.name || "Default", "");

            return (
              <article key={`${item.productId}`} className="group relative">
                <ProductCard product={product} className="h-full" />

                {/* Add to Cart Button Overlay */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddToCart(item)}
                    disabled={inCart}
                  >
                    {inCart ? (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        In Cart
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>

                {/* Remove from Wishlist */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-brand-red hover:bg-white rounded-full shadow-card transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}