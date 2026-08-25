/**
 * Supabase database types — matches 0001_schema.sql
 * Use these for type-safe queries instead of `any`
 */

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export type Gender = "Men" | "Women" | "Kids" | "Unisex";

export interface ProductSize {
  value: string;
  inStock: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  public_id?: string; // Cloudinary public_id for deletion
}

export interface Product {
  id: string;
  name: string;
  brand_id: string | null;
  category_id: string | null;
  gender: Gender;
  price: number; // GHS minor units
  compare_at_price: number | null;
  description: string;
  short_description: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  images: ProductImage[];
  rating: number;
  review_count: number;
  stock_count: number;
  sold_count: number;
  is_featured: boolean;
  is_new: boolean;
  slug: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Joined fields (when queried with brand/category)
  brand?: Brand;
  category?: Category;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  address: string | null;
  city: string | null;
  region: string | null;
  created_at: string;
}

export interface WishlistItem {
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface CartItem {
  user_id: string;
  product_id: string;
  size: string;
  color: string;
  quantity: number;
  updated_at: string;
}

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "momo" | "card";

export interface Order {
  id: string;
  user_id: string | null;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  coupon_code: string | null;
  shipping_address: ShippingAddress;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  image_url: string | null;
  size: string | null;
  color: string | null;
  qty: number;
  price: number;
  created_at: string;
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

export interface Coupon {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type NotificationType = "new_order" | "order_status";

export interface Notification {
  id: string;
  type: NotificationType;
  order_id: string | null;
  user_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  discount_text: string;
  discount_label: string;
  cta_text: string;
  cta_link: string;
  image: string;
  image_alt: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  badge_color: string;
  created_at: string;
  updated_at: string;
}