export type Brand =
  | "Nike"
  | "Adidas"
  | "Puma"
  | "New Balance"
  | "Converse"
  | "Vans"
  | "Jordan"
  | "Reebok"
  | "Fila"
  | "Skechers"
  | "Other";

export type Category =
  | "Running"
  | "Lifestyle"
  | "Basketball"
  | "Training"
  | "Sneakers"
  | "Slides"
  | "Boots";

export type Gender = "Men" | "Women" | "Kids" | "Unisex";

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductColor {
  name: string;
  hex: string;
  image: string; // URL for the color variant
}

export interface ProductSize {
  value: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  category: Category;
  gender: Gender;
  price: number; // in GHS (minor units, e.g., 11500 = ₵115.00)
  compareAtPrice?: number; // in GHS (for sale items)
  sizes: ProductSize[];
  colors: ProductColor[];
  images: ProductImage[];
  rating: number; // 0-5
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  slug: string;
  description: string;
  shortDescription: string;
  tags: string[];
  // Optional fields returned by the admin API (not used by storefront UI)
  createdAt?: string;
  stockCount?: number;
  soldCount?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface WishlistItem {
  productId: string;
}

export interface FilterState {
  brands: Brand[];
  categories: Category[];
  sizes: string[];
  priceRange: [number, number]; // [min, max] in GHS
  genders: Gender[];
  sortBy: "price-asc" | "price-desc" | "rating" | "newest" | "featured";
}

export const BRANDS: { value: Brand; label: string; logo?: string }[] = [
  { value: "Nike", label: "Nike" },
  { value: "Adidas", label: "Adidas" },
  { value: "Puma", label: "Puma" },
  { value: "New Balance", label: "New Balance" },
  { value: "Converse", label: "Converse" },
  { value: "Vans", label: "Vans" },
  { value: "Jordan", label: "Jordan" },
  { value: "Reebok", label: "Reebok" },
  { value: "Fila", label: "Fila" },
  { value: "Skechers", label: "Skechers" },
  { value: "Other", label: "Other" },
];

export const CATEGORIES: { value: Category; label: string; image?: string }[] = [
  { value: "Running", label: "Running" },
  { value: "Lifestyle", label: "Lifestyle" },
  { value: "Basketball", label: "Basketball" },
  { value: "Training", label: "Training" },
  { value: "Sneakers", label: "Sneakers" },
  { value: "Slides", label: "Slides" },
  { value: "Boots", label: "Boots" },
];

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "Men", label: "Men" },
  { value: "Women", label: "Women" },
  { value: "Kids", label: "Kids" },
  { value: "Unisex", label: "Unisex" },
];

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

// Order types
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "momo" | "card";

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string | { url: string; alt: string };
  price: number;
  quantity: number;
  size: string;
  color: string;
  colorHex?: string;
}

export interface ShippingAddress {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  notes?: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export interface Order {
  id: string;
  items: OrderItem[];
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}