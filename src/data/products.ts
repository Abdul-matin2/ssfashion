import type { Product } from "@/types/product";

// Legacy synchronous exports kept only so existing Client Components compile.
// All real data now lives in Supabase and is fetched on the server via
// `@/lib/supabase/queries` (server-only) and passed down as props.
// These stubs return empty results; migrate callers to receive product data
// through props from a Server Component instead of importing them.

export const products: Product[] = [];

export function getProductBySlug(slug: string): Product | undefined {
  console.warn("Using deprecated sync getProductBySlug. Fetch products in a Server Component instead.");
  return undefined;
}

export function getProductById(id: string): Product | undefined {
  console.warn("Using deprecated sync getProductById. Fetch products in a Server Component instead.");
  return undefined;
}

export function getFeaturedProducts(): Product[] {
  console.warn("Using deprecated sync getFeaturedProducts. Fetch products in a Server Component instead.");
  return [];
}

export function getNewProducts(): Product[] {
  console.warn("Using deprecated sync getNewProducts. Fetch products in a Server Component instead.");
  return [];
}

export function getBestSellers(limit = 10): Product[] {
  console.warn("Using deprecated sync getBestSellers. Fetch products in a Server Component instead.");
  return [];
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  console.warn("Using deprecated sync getRelatedProducts. Fetch products in a Server Component instead.");
  return [];
}

export function getProductsByCategory(category: string): Product[] {
  console.warn("Using deprecated sync getProductsByCategory. Fetch products in a Server Component instead.");
  return [];
}

export function getProductsByBrand(brand: string): Product[] {
  console.warn("Using deprecated sync getProductsByBrand. Fetch products in a Server Component instead.");
  return [];
}