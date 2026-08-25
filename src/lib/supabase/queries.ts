/**
 * Supabase query helpers — Server Components only
 * Uses the server client with cookies for auth context
 */

import { createClient } from "@/lib/supabase/server";
import type { Product as DbProduct, Brand as DbBrand, Category as DbCategory, Coupon, Order, OrderItem, Notification, Banner } from "@/lib/supabase/types";
import type { Product, Brand, Category, ProductImage, ProductSize, ProductColor } from "@/types/product";

const DEFAULT_LIMIT = 24;

/**
 * Map a DB Product (snake_case) to App Product (camelCase)
 */
function mapProduct(db: DbProduct): Product {
  // Resolve brand name - use joined brand or fallback to brand_id
  const brandName: Brand = (db.brand?.name || db.brand_id || "Other") as Brand;

  // Resolve category name - use joined category or fallback to category_id
  const categoryName: Category = (db.category?.name || db.category_id || "Lifestyle") as Category;

  // Map sizes - db.sizes is already ProductSize[]
  const sizes: ProductSize[] = db.sizes || [];

  // Map colors - db.colors is already ProductColor[]
  const colors: ProductColor[] = db.colors || [];

  // Map images - db.images has public_id, app expects ProductImage without public_id
  const images: ProductImage[] = (db.images || []).map((img) => ({
    url: img.url,
    alt: img.alt,
  }));

  return {
    id: db.id,
    name: db.name,
    brand: brandName,
    category: categoryName,
    gender: db.gender,
    price: db.price,
    compareAtPrice: db.compare_at_price ?? undefined,
    sizes,
    colors,
    images,
    rating: db.rating,
    reviewCount: db.review_count,
    isFeatured: db.is_featured,
    isNew: db.is_new,
    slug: db.slug,
    description: db.description,
    shortDescription: db.short_description,
    tags: db.tags || [],
  };
}

/**
 * Map DB Brand to App Brand (string union)
 */
function mapBrand(db: DbBrand): Brand {
  return db.name as Brand;
}

/**
 * Map DB Category to App Category (string union)
 */
function mapCategory(db: DbCategory): Category {
  return db.name as Category;
}

/**
 * Internal helper: Get brand by name returning DB type with id
 */
async function getBrandByNameDb(name: string): Promise<DbBrand | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("*").eq("name", name).single();
  if (error) return null;
  return data as DbBrand;
}

/**
 * Internal helper: Get category by slug returning DB type with id
 */
async function getCategoryBySlugDb(slug: string): Promise<DbCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single();
  if (error) return null;
  return data as DbCategory;
}

// ============================================================
// Products
// ============================================================

export async function getProducts({
  limit = DEFAULT_LIMIT,
  offset = 0,
  category,
  brand,
  gender,
  isFeatured,
  isNew,
  sort = "newest",
  search,
  minPrice,
  maxPrice,
  sizes,
}: {
  limit?: number;
  offset?: number;
  category?: string;
  brand?: string;
  gender?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  sort?: "price-asc" | "price-desc" | "rating" | "newest" | "featured" | "name-asc";
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
} = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, brand:brands(*), category:categories(*)", { count: "exact" });

  if (category) query = query.eq("category_id", (await getCategoryBySlugDb(category))?.id);
  if (brand) query = query.eq("brand_id", (await getBrandByNameDb(brand))?.id);
  if (gender) query = query.eq("gender", gender);
  if (isFeatured) query = query.eq("is_featured", true);
  if (isNew) query = query.eq("is_new", true);
  if (minPrice) query = query.gte("price", minPrice);
  if (maxPrice) query = query.lte("price", maxPrice);
  if (search) query = query.ilike("name", `%${search}%`);

  // Size filter: check if any size in `sizes` array has inStock=true
  if (sizes && sizes.length > 0) {
    // This is a JSONB contains query - each size object has {value, inStock}
    query = query.contains("sizes", sizes.map(s => ({ value: s, inStock: true })));
  }

  // Sorting
  switch (sort) {
    case "price-asc": query = query.order("price", { ascending: true }); break;
    case "price-desc": query = query.order("price", { ascending: false }); break;
    case "rating": query = query.order("rating", { ascending: false }); break;
    case "featured": query = query.order("is_featured", { ascending: false }); break;
    case "name-asc": query = query.order("name", { ascending: true }); break;
    case "newest":
    default: query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { products: (data as DbProduct[]).map(mapProduct), total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, brand:brands(*), category:categories(*)")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return mapProduct(data as DbProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, brand:brands(*), category:categories(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return mapProduct(data as DbProduct);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { products } = await getProducts({ isFeatured: true, limit, sort: "featured" });
  return products;
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  const { products } = await getProducts({ isNew: true, limit, sort: "newest" });
  return products;
}

export async function getBestSellers(limit = 10): Promise<Product[]> {
  const { products } = await getProducts({ limit, sort: "rating" });
  return products;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = await createClient();

  // Resolve category_id and brand_id from names
  const [categoryDb, brandDb] = await Promise.all([
    getCategoryBySlugDb(product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")),
    getBrandByNameDb(product.brand),
  ]);

  const categoryId = categoryDb?.id;
  const brandId = brandDb?.id;

  if (!categoryId && !brandId) return [];

  let query = supabase
    .from("products")
    .select("*, brand:brands(*), category:categories(*)")
    .neq("id", product.id)
    .limit(limit);

  if (categoryId && brandId) {
    query = query.or(`category_id.eq.${categoryId},brand_id.eq.${brandId}`);
  } else if (categoryId) {
    query = query.eq("category_id", categoryId);
  } else if (brandId) {
    query = query.eq("brand_id", brandId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as DbProduct[]).map(mapProduct);
}

// ============================================================
// Brands & Categories
// ============================================================

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("*").order("name");
  if (error) throw error;
  return (data as DbBrand[]).map(mapBrand);
}

export async function getBrandByName(name: string): Promise<Brand | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("*").eq("name", name).single();
  if (error) return null;
  return mapBrand(data as DbBrand);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return (data as DbCategory[]).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single();
  if (error) return null;
  return mapCategory(data as DbCategory);
}

// ============================================================
// Coupons
// ============================================================

export async function validateCoupon(code: string): Promise<Coupon | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .single();
  if (error) return null;
  return data as Coupon;
}

// ============================================================
// Orders (admin)
// ============================================================

export async function getOrders({
  limit = 20,
  offset = 0,
  status,
}: {
  limit?: number;
  offset?: number;
  status?: string;
} = {}): Promise<{ orders: Order[]; total: number }> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)", { count: "exact" });

  if (status) query = query.eq("status", status);

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { orders: data as Order[], total: count ?? 0 };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Order;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, order_items(*)")
    .single();
  if (error) throw error;
  return data as Order;
}

// ============================================================
// Banner
// ============================================================

export interface BannerData {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  discountText: string;
  discountLabel: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  imageAlt: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  badgeColor: string;
}

export async function getBanner(): Promise<BannerData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banner")
    .select("*")
    .eq("enabled", true)
    .single();
  if (error) return null;
  return data as BannerData;
}

// ============================================================
// Notifications
// ============================================================

export async function getNotifications({
  userId,
  type,
  limit = 50,
}: {
  userId?: string;
  type?: "new_order" | "order_status";
  limit?: number;
}): Promise<Notification[]> {
  const supabase = await createClient();
  let query = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(limit);

  if (userId) query = query.eq("user_id", userId);
  if (type) query = query.eq("type", type);
  else if (!userId) query = query.eq("type", "new_order"); // admin default

  const { data, error } = await query;
  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function markAllNotificationsRead(userId?: string): Promise<void> {
  const supabase = await createClient();
  let query = supabase.from("notifications").update({ is_read: true });
  if (userId) query = query.eq("user_id", userId);
  else query = query.eq("type", "new_order");
  await query;
}

export async function getUnreadCount(userId?: string): Promise<number> {
  const supabase = await createClient();
  let query = supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false);
  if (userId) query = query.eq("user_id", userId);
  else query = query.eq("type", "new_order");
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}