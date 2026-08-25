"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CartItem, Product, ProductColor, ProductImage } from "@/types/product";
import { formatPrice } from "@/lib/currency";

// Extended cart item with full product details for display
export interface CartItemWithDetails extends CartItem {
  name: string;
  brand: string;
  category: string;
  image: ProductImage;
  price: number;
  compareAtPrice?: number;
  slug: string;
  colors: ProductColor[];
}

interface CartContextType {
  items: CartItemWithDetails[];
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getItemCount: (productId: string, size: string, color: string) => number;
  isInCart: (productId: string, size: string, color: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "ssfashion_cart";

function toCartItemWithDetails(product: Product, size: string, color: string, quantity: number): CartItemWithDetails {
  return {
    productId: product.id,
    quantity,
    selectedSize: size,
    selectedColor: color,
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migration: if old format (without product details), try to populate
        // For now just use as-is; user will re-add items if needed
        setItems(parsed);
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
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
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [items, isLoaded]);

  const addItem = useCallback(
    (product: Product, size: string, color: string, quantity = 1) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.productId === product.id &&
            item.selectedSize === size &&
            item.selectedColor === color
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        return [...prev, toCartItemWithDetails(product, size, color, quantity)];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, size, color);
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity }
            : item
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const getItemCount = useCallback(
    (productId: string, size: string, color: string) => {
      const item = items.find(
        (i) => i.productId === productId && i.selectedSize === size && i.selectedColor === color
      );
      return item?.quantity || 0;
    },
    [items]
  );

  const isInCart = useCallback(
    (productId: string, size: string, color: string) => {
      return items.some(
        (item) =>
          item.productId === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
    },
    [items]
  );

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    getItemCount,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Helper hook for getting cart display info
export function useCartDisplay() {
  const { getTotalItems, getSubtotal } = useCart();
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  return {
    totalItems,
    subtotal,
    formattedSubtotal: formatPrice(subtotal),
  };
}