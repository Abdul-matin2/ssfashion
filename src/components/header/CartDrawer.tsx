"use client";

import React, { useEffect } from "react";
import { useCart, CartItemWithDetails } from "@/context/CartContext";
import { formatPriceWithSymbol } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = getSubtotal();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-drawer",
          "animate-in slide-in-from-right-full duration-300",
          "flex flex-col"
        )}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-brand-black">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-brand-black hover:bg-neutral-100 rounded-xl transition-colors"
            aria-label="Close cart"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <svg className="h-16 w-16 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg font-medium text-brand-black mb-2">Your cart is empty</p>
              <p className="text-neutral-500 mb-6">Looks like you haven't added any items yet.</p>
              <Button onClick={onClose} className="w-full max-w-xs">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {(items as CartItemWithDetails[]).map((item) => {
                const selectedColor = item.colors?.find((c) => c.name === item.selectedColor);
                const imageUrl = selectedColor?.image || item.image?.url || "/images/placeholder.png";

                return (
                  <div
                    key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-3 p-2 bg-neutral-50 rounded-xl"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden"
                      aria-label={`View ${item.name}`}
                    >
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-medium text-brand-black hover:text-brand-gold transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-neutral-500 mt-0.5">
                          {item.brand} · {item.category}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-600">
                          <span>Size: {item.selectedSize}</span>
                          {selectedColor && (
                            <span className="flex items-center gap-1">
                              <span
                                className="h-3 w-3 rounded-full border border-neutral-300"
                                style={{ backgroundColor: selectedColor.hex }}
                              />
                              {selectedColor.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 border border-neutral-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="p-1.5 text-neutral-500 hover:text-brand-black hover:bg-neutral-100 rounded-l-lg transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="p-1.5 text-neutral-500 hover:text-brand-black hover:bg-neutral-100 rounded-r-lg transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                          className="text-neutral-400 hover:text-brand-red transition-colors p-1"
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="font-semibold text-brand-black">
                        {formatPriceWithSymbol(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Summary & Actions */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Subtotal</span>
              <span className="font-semibold text-brand-black text-lg">
                {formatPriceWithSymbol(subtotal)}
              </span>
            </div>
            <p className="text-xs text-neutral-500 text-center">
              Shipping and taxes calculated at checkout
            </p>
            <Link href="/checkout">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}