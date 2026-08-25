/**
 * Format price in GHS (Ghana Cedis)
 * Input: price in minor units (pesewas) - e.g., 115000 = ₵1,150.00
 * Output: formatted string like "₵1,150.00"
 */
export function formatPrice(price: number): string {
  // Convert from pesewas to cedis (divide by 100)
  const cedis = price / 100;
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cedis);
}

/**
 * Format price without currency symbol
 */
export function formatPricePlain(price: number): string {
  const cedis = price / 100;
  return cedis.toFixed(2);
}

/**
 * Format price with custom symbol
 */
export function formatPriceWithSymbol(price: number, symbol = "₵"): string {
  const cedis = price / 100;
  return `${symbol}${cedis.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(price: number, compareAtPrice: number): number {
  if (compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Check if product is on sale
 */
export function isOnSale(price: number, compareAtPrice?: number): boolean {
  return !!compareAtPrice && compareAtPrice > price;
}