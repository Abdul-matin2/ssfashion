"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { WishlistItem, Product, ProductColor, ProductImage } from "@/types/product";

// Extended wishlist item with full product details for display
export interface WishlistItemWithDetails extends WishlistItem {
  name: string;
  brand: string;
  category: string;
  image: ProductImage;
  price: number;
  compareAtPrice?: number;
  slug: string;
  colors: ProductColor[];
}

interface WishlistContextType {
  items: WishlistItemWithDetails[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
  getTotalItems: () => number;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "ssfashion_wishlist";

function toWishlistItemWithDetails(product: Product): WishlistItemWithDetails {
  return {
    productId: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    image: product.images[0],
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    slug: product.slug,
    colors: product.colors,
  };
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItemWithDetails[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migration: if old format (without product details), try to populate
        // For now just use as-is; user will re-add items if needed
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => setItems(parsed), 0);
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save wishlist to localStorage:", error);
      }
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.productId === product.id)) {
        return prev; // Already in wishlist
      }
      return [...prev, toWishlistItemWithDetails(product)];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const toggleItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.productId === product.id)) {
        return prev.filter((item) => item.productId !== product.id);
      }
      return [...prev, toWishlistItemWithDetails(product)];
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.length;
  }, [items]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  const value: WishlistContextType = {
    items,
    addItem,
    removeItem,
    toggleItem,
    clearWishlist,
    getTotalItems,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

// Helper hook for getting full product details from wishlist
export function useWishlistProducts() {
  const { items } = useWishlist();
  return items;
}