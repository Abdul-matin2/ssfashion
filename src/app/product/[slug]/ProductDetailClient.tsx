"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id, selectedSize || "", selectedColor || "");

  useEffect(() => {
    // Pre-select first available size and color
    const firstAvailableSize = product.sizes.find((s) => s.inStock);
    if (firstAvailableSize) {
      setSelectedSize(firstAvailableSize.value);
    }
    if (product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    setIsAdding(true);
    try {
      addItem(product, selectedSize, selectedColor || "", quantity);
      setShowAddedToast(true);
      setTimeout(() => setShowAddedToast(false), 3000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = () => {
    toggleItem(product);
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Added to Cart Toast */}
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6 lg:mb-8">
          <button onClick={() => router.push("/")} className="hover:text-brand-gold transition-colors">
            Home
          </button>
          <span>/</span>
          <button onClick={() => router.push("/shop")} className="hover:text-brand-gold transition-colors">
            Shop
          </button>
          <span>/</span>
          <span className="text-brand-black">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="relative">
              {/* Main Image */}
              <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-50 relative">
                {product.images[selectedImage] && (
                  <img
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && <Badge variant="new">NEW</Badge>}
                  {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
                </div>

                {/* Wishlist Toggle */}
                <button
                  onClick={handleWishlistToggle}
                  className={cn(
                    "absolute top-4 right-4 p-3 rounded-full bg-white shadow-card hover:shadow-lg transition-all",
                    inWishlist ? "text-brand-red" : "text-neutral-400 hover:text-brand-red"
                  )}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg className="h-5 w-5" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                        selectedImage === index
                          ? "border-brand-gold"
                          : "border-transparent hover:border-neutral-300"
                      )}
                    >
                      <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <p className="text-sm font-medium text-brand-gold mb-1">{product.brand}</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-brand-black mb-2">{product.name}</h1>
              <p className="text-neutral-600">{product.shortDescription}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.rating} size="sm" showCount reviewCount={product.reviewCount} />
              <span className="text-sm text-neutral-500">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <Price
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-neutral-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-brand-black">Size</h3>
                {selectedSize && (
                  <span className="text-xs text-neutral-500">
                    Selected: <span className="font-medium text-brand-black">{selectedSize}</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => size.inStock && setSelectedSize(size.value)}
                    disabled={!size.inStock}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-xl border transition-all",
                      selectedSize === size.value
                        ? "bg-brand-black text-brand-white border-brand-black"
                        : size.inStock
                        ? "bg-white text-brand-black border-neutral-200 hover:border-brand-gold"
                        : "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed line-through"
                    )}
                  >
                    {size.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-brand-black mb-2">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                        selectedColor === color.name
                          ? "border-brand-gold bg-brand-gold/5"
                          : "border-neutral-200 hover:border-brand-gold"
                      )}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-neutral-200"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm text-brand-black">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-brand-black mb-2">Quantity</h3>
              <div className="inline-flex items-center border border-neutral-200 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-brand-black hover:bg-neutral-50 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-4 py-2 text-sm font-medium text-brand-black min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    const sizeObj = product.sizes.find((s) => s.value === selectedSize);
                    const maxQty = sizeObj?.inStock ? 10 : 1;
                    setQuantity(Math.min(maxQty, quantity + 1));
                  }}
                  className="px-4 py-2 text-brand-black hover:bg-neutral-50 transition-colors"
                  aria-label="Increase quantity"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1"
              >
                {isAdding ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
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

              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlistToggle}
                className={cn(inWishlist && "border-brand-red text-brand-red")}
              >
                <svg
                  className={cn("h-4 w-4", inWishlist && "fill-current")}
                  fill={inWishlist ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {inWishlist ? "Saved" : "Save"}
              </Button>
            </div>

            {/* Product Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Brand</span>
                <span className="font-medium text-brand-black">{product.brand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Category</span>
                <span className="font-medium text-brand-black">{product.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Gender</span>
                <span className="font-medium text-brand-black capitalize">{product.gender}</span>
              </div>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium bg-neutral-50 text-neutral-600 rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <h2 className="text-2xl lg:text-3xl font-bold text-brand-black mb-6 lg:mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}