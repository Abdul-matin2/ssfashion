"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { formatPrice } from "@/lib/currency";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getSubtotal, getTotalItems } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-brand-gold">Loading cart...</div>
      </div>
    );
  }

  // Cart items already carry full product details (stored at add time)
  const lineItems = items;

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const shipping = subtotal > 0 ? (subtotal >= 100000 ? 0 : 5000) : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="h-24 w-24 text-neutral-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black mb-2">Your cart is empty</h1>
          <p className="text-neutral-500 mb-8">Looks like you haven't added any items yet.</p>
          <Link href="/shop">
            <Button variant="primary" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-black mb-2">Shopping Cart</h1>
          <p className="text-neutral-600">
            {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 border-b border-neutral-200 text-sm font-medium text-neutral-500 sm:grid-cols-[1fr_auto_auto_auto]">
                <span>Product</span>
                <span className="hidden sm:block text-center">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-center">Total</span>
              </div>

              {lineItems.map((item) => (
                <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-neutral-100 last:border-0">
                  {/* Product Image & Info */}
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-neutral-50">
                        <img
                          src={item.image.url}
                          alt={item.image.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${item.slug}`} className="block">
                        <h3 className="font-medium text-brand-black truncate sm:truncate">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-neutral-500 mt-1">{item.brand}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {item.selectedSize && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-lg">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-lg">
                            {item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:block w-24 text-center">
                    <Price price={item.price} compareAtPrice={item.compareAtPrice} size="sm" />
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:justify-center">
                    <button
                      onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, Math.max(1, item.quantity - 1))}
                      className="p-2 text-neutral-500 hover:text-brand-black hover:bg-neutral-100 rounded-xl transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-brand-black">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                      className="p-2 text-neutral-500 hover:text-brand-black hover:bg-neutral-100 rounded-xl transition-colors"
                      aria-label="Increase quantity"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="flex flex-col items-center gap-2 w-full sm:w-24">
                    <Price
                      price={item.price * item.quantity}
                      compareAtPrice={item.compareAtPrice ? item.compareAtPrice * item.quantity : undefined}
                      size="sm"
                    />
                    <button
                      onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                      className="text-xs text-neutral-400 hover:text-brand-red transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div>
                    <p className="font-medium text-brand-black">Have a promo code?</p>
                    <p className="text-sm text-neutral-500">Enter it at checkout to apply discount</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Enter Code
                </Button>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6 text-center">
              <Link href="/shop" className="text-brand-gold hover:text-brand-accent-hover font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-brand-black mb-6">Order Summary</h2>

              <dl className="space-y-4">
                <div className="flex justify-between text-sm">
                  <dt className="text-neutral-500">Subtotal</dt>
                  <dd className="font-medium text-brand-black">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-neutral-500">Shipping</dt>
                  <dd className="font-medium text-brand-black">
                    {shipping === 0 ? (
                      <span className="text-brand-green">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </dd>
                </div>
                {subtotal > 0 && subtotal < 100000 && (
                  <p className="text-xs text-brand-gold text-center">
                    Add {formatPrice(100000 - subtotal)} more for free shipping!
                  </p>
                )}
                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-brand-black">
                    <dt>Total</dt>
                    <dd>{formatPrice(total)}</dd>
                  </div>
                </div>
              </dl>

              <p className="text-xs text-neutral-500 text-center mt-4">
                Shipping and taxes calculated at checkout.
              </p>

              <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => router.push("/checkout")}>
                Proceed to Checkout
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                {[
                  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "Secure\nCheckout" },
                  { icon: "M5 8h14M5 8a2 2 0 110-2h14a2 2 0 110 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", text: "Free\nShipping" },
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "100%\nAuthentic" },
                  { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", text: "30-Day\nReturns" },
                ].map((badge, i) => (
                  <div key={i} className="p-3">
                    <svg className="h-8 w-8 text-brand-gold mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={badge.icon} />
                    </svg>
                    <p className="text-xs text-neutral-600 leading-tight">{badge.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}