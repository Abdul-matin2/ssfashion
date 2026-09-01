"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, CartItemWithDetails } from "@/context/CartContext";
import { useUserProfile } from "@/context/UserProfileContext";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { getRegions, DEFAULT_COUNTRY_CODE } from "@/data/countries";

type PaymentMethod = "cod" | "momo" | "card";

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  notes: string;
}

interface ShippingRate {
  region: string;
  standard: string;
  express: string;
  freeThreshold?: string;
}

interface ShippingApiResponse {
  rates: ShippingRate[];
  currency: string;
}

const EMPTY_FORM: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  notes: "",
};

// Default fallback rates (used before API loads or if API fails)
const DEFAULT_RATES: ShippingRate[] = [
  { region: "Northern Ghana", standard: "GHS 20", express: "N/A", freeThreshold: "GHS 500+" },
  { region: "Rest of Ghana", standard: "GHS 50", express: "GHS 50", freeThreshold: "GHS 500+" },
  { region: "West Africa", standard: "GHS 120", express: "GHS 200", freeThreshold: "GHS 1000+" },
];

function parsePrice(priceStr: string): number {
  // Parse "GHS 20", "GHS20", or a bare "20" to number (in pesewas).
  // Returns 0 only when no number is present at all.
  const value = (priceStr || "").trim();
  const match = value.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return Math.round(parseFloat(match[1]) * 100);
  }
  return 0;
}

function parseThreshold(thresholdStr: string): number | null {
  // Parse "GHS 500+" to number (in pesewas). Returns null when no threshold
  // is configured, meaning free shipping does NOT apply for this rate.
  const value = (thresholdStr || "").trim();
  if (!value) return null;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return Math.round(parseFloat(match[1]) * 100);
  }
  return null;
}

const NORTHERN_GHANA_REGIONS = [
  "Northern", "North East", "Savannah", "Upper East", "Upper West",
];

// Map a specific country region to a shipping rate group when the admin has
// configured broader zones (e.g. "Northern Ghana", "Rest of Ghana").
function resolveRateZone(region: string, rates: ShippingRate[]): string {
  const normalizedRegion = (region || "").trim().toLowerCase();

  // 1. Exact match on the rate's own region name
  if (rates.some((r) => r.region.toLowerCase() === normalizedRegion)) {
    return region;
  }

  // 2. Fuzzy match (region name is part of a rate region, or vice versa)
  const fuzzy = rates.find(
    (r) =>
      r.region.toLowerCase().includes(normalizedRegion) ||
      (normalizedRegion.length > 0 && normalizedRegion.includes(r.region.toLowerCase()))
  );
  if (fuzzy) return fuzzy.region;

  // 3. Ghana zone mapping (only relevant when rates use zone groupings)
  if (NORTHERN_GHANA_REGIONS.some((n) => n.toLowerCase() === normalizedRegion)) {
    const northern = rates.find((r) => r.region.toLowerCase() === "northern ghana");
    if (northern) return "Northern Ghana";
  }
  const restOfGhana = rates.find((r) => r.region.toLowerCase() === "rest of ghana");
  if (restOfGhana) return "Rest of Ghana";

  // 4. Fallback to the first rate
  return rates[0]?.region ?? "";
}

function getShippingFee(region: string, rates: ShippingRate[]): { fee: number; freeThreshold: number } {
  const zone = resolveRateZone(region, rates);
  const matchedRate = rates.find((r) => r.region === zone);

  if (matchedRate) {
    return {
      fee: parsePrice(matchedRate.standard),
      freeThreshold: parseThreshold(matchedRate.freeThreshold ?? "") ?? Infinity,
    };
  }

  // Hardcoded fallback (should rarely be used)
  return {
    fee: 5000,
    freeThreshold: 50000,
  };
}

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    id: "momo",
    label: "Mobile Money",
    description: "MTN / Vodafone / AirtelTigo",
    icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    id: "card",
    label: "Card Payment",
    description: "Visa / Mastercard",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotalItems, clearCart } = useCart();
  const { profile } = useUserProfile();
  const [isClient, setIsClient] = useState(false);
  const [form, setForm] = useState<FormState>(() => ({
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    address: profile.address,
    city: profile.city,
    region: profile.region,
    notes: "",
  }));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>(DEFAULT_RATES);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get country-specific regions for the dropdown
  const userCountry = profile.country || DEFAULT_COUNTRY_CODE;
  const countryRegions = getRegions(userCountry);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get user ID from Supabase for order creation
  useEffect(() => {
    import("@/lib/supabase/auth").then(({ getUser }) => {
      getUser().then((user) => {
        if (user) setUserId(user.id);
      });
    });
  }, []);

  // Fetch shipping rates from admin config
  useEffect(() => {
    fetch("/api/shipping")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates && data.rates.length > 0) {
          setRates(data.rates);
        }
      })
      .catch(() => {
        // Keep default rates on error
      })
      .finally(() => setRatesLoaded(true));
  }, []);

  // Sync region to first available rate option when rates load
  useEffect(() => {
    if (ratesLoaded && rates.length > 0) {
      const regionOptions = rates.map((r) => r.region);
      setForm((prev) => {
        // If current region isn't in the dropdown options, default to first rate
        if (prev.region && !regionOptions.includes(prev.region)) {
          return { ...prev, region: regionOptions[0] };
        }
        return prev;
      });
    }
  }, [ratesLoaded, rates]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-brand-gold">Loading checkout...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="h-24 w-24 text-neutral-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" />
          </svg>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black mb-2">Nothing to check out</h1>
          <p className="text-neutral-500 mb-8">Your cart is empty. Add some items before checking out.</p>
          <Link href="/shop">
            <Button variant="primary" size="lg">
              Browse Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Cart items already carry full product details (stored at add time)
  const lineItems = items as CartItemWithDetails[];

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const { fee: shippingFee, freeThreshold } = getShippingFee(form.region, rates);
  const shipping = subtotal >= freeThreshold ? 0 : shippingFee;
  const total = subtotal + shipping;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address";
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length < 9)
      newErrors.phone = "Enter a valid phone number";
    if (!form.address.trim()) newErrors.address = "Delivery address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.region.trim()) newErrors.region = "Region is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = document.querySelector('[aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Prepare order data
      const orderData = {
        items: lineItems.map((line) => ({
          productId: line.productId,
          name: line.name,
          brand: line.brand,
          image: line.image,
          price: line.price,
          quantity: line.quantity,
          size: line.selectedSize,
          color: line.selectedColor,
          colorHex: line.colors.find((c) => c.name === line.selectedColor)?.hex,
        })),
        shipping: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          region: form.region,
          notes: form.notes,
        },
        paymentMethod,
        subtotal,
        shippingFee: shipping,
        total,
      };

      // For online payments (momo, card), initialize Paystack FIRST, don't create order yet
      // For COD, create order immediately
      let newOrder;
      let orderCreated = false;

      if (paymentMethod === "cod") {
        // Create order immediately for COD
        const response = await fetch("/api/admin/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error("Failed to create order");
        }

        newOrder = await response.json();
        orderCreated = true;
      }

      // Admin notification is now created server-side via API
      // (includes database persistence + email via Resend)

      // Update user profile with latest address info
      // (optional - if user wants to save this address for future)

      clearCart();

      // For online payments (momo, card), redirect to Paystack WITHOUT creating order yet
      if (paymentMethod === "momo" || paymentMethod === "card") {
        // Generate a temporary reference for this checkout session
        const tempReference = `CHK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const callbackUrl = `${window.location.origin}/payment?reference=${tempReference}&method=${paymentMethod}&total=${total}`;
        const initResponse = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            amount: total, // in pesewas
            orderId: tempReference, // Use temp reference
            callbackUrl,
            metadata: {
              // Store full order data in metadata for later creation
              items: orderData.items,
              shipping: orderData.shipping,
              paymentMethod,
              subtotal,
              shippingFee: shipping,
              total,
              tempReference,
              userId: userId, // Include user ID for order creation
            },
            channels: paymentMethod === "momo" ? ["mobile_money"] : ["card", "mobile_money"],
          }),
        });

        const initData = await initResponse.json();

        if (!initResponse.ok || !initData.authorizationUrl) {
          throw new Error(initData.error || "Failed to initialize payment");
        }

        // Redirect to Paystack payment page
        window.location.href = initData.authorizationUrl;
      } else {
        // For COD, go directly to order confirmation
        router.push(
          `/order-confirmation?method=${paymentMethod}&total=${total}&orderId=${newOrder.id}`
        );
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      setIsPlacingOrder(false);
      alert("Failed to place order. Please try again.");
    }
  };

  const inputClass = (field: keyof FormState) =>
    cn(
      "w-full rounded-xl border bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-colors",
      errors[field] ? "border-brand-red" : "border-neutral-200"
    );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-black transition-colors mb-4"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-black mb-2">Checkout</h1>
          <p className="text-neutral-600">{totalItems} item{totalItems !== 1 ? "s" : ""} ready for delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <section className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-brand-black mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-black mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    placeholder="you@example.com"
                    className={inputClass("email")}
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-brand-red">{errors.email}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-brand-black mb-1.5">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={form.firstName}
                      onChange={handleChange}
                      aria-invalid={!!errors.firstName}
                      placeholder="Kwame"
                      className={inputClass("firstName")}
                    />
                    {errors.firstName && <p className="mt-1.5 text-sm text-brand-red">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-brand-black mb-1.5">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={form.lastName}
                      onChange={handleChange}
                      aria-invalid={!!errors.lastName}
                      placeholder="Mensah"
                      className={inputClass("lastName")}
                    />
                    {errors.lastName && <p className="mt-1.5 text-sm text-brand-red">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-brand-black mb-1.5">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    aria-invalid={!!errors.phone}
                    placeholder="024 000 0000"
                    className={inputClass("phone")}
                  />
                  {errors.phone && <p className="mt-1.5 text-sm text-brand-red">{errors.phone}</p>}
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-brand-black mb-6">Delivery Address</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-brand-black mb-1.5">
                    Street address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={handleChange}
                    aria-invalid={!!errors.address}
                    placeholder="12 Independence Avenue"
                    className={inputClass("address")}
                  />
                  {errors.address && <p className="mt-1.5 text-sm text-brand-red">{errors.address}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-brand-black mb-1.5">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={handleChange}
                      aria-invalid={!!errors.city}
                      placeholder="Accra"
                      className={inputClass("city")}
                    />
                    {errors.city && <p className="mt-1.5 text-sm text-brand-red">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-brand-black mb-1.5">
                      Region
                    </label>
                    <select
                      id="region"
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      aria-invalid={!!errors.region}
                      className={cn(inputClass("region"), "appearance-none bg-white")}
                    >
                      {countryRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    {errors.region && <p className="mt-1.5 text-sm text-brand-red">{errors.region}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-brand-black mb-1.5">
                    Order notes <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Delivery instructions, landmarks, etc."
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-brand-black mb-6">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                      paymentMethod === method.id
                        ? "border-brand-black bg-neutral-50 ring-1 ring-brand-black"
                        : "border-neutral-200 hover:border-neutral-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                        paymentMethod === method.id ? "border-brand-black" : "border-neutral-300"
                      )}
                    >
                      {paymentMethod === method.id && (
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-black" />
                      )}
                    </span>
                    <svg className="h-6 w-6 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={method.icon} />
                    </svg>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-brand-black">{method.label}</span>
                      <span className="block text-sm text-neutral-500">{method.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Order Summary */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-brand-black mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
                {lineItems.map((line) => (
                  <div key={`${line.productId}-${line.selectedSize}-${line.selectedColor}`} className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-50">
                        <img
                          src={line.image.url}
                          alt={line.image.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-black text-[10px] font-bold text-white px-1">
                        {line.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-black truncate">{line.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {line.selectedSize}
                        {line.selectedColor && (
                          <span className="inline-flex items-center gap-1 ml-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full border border-neutral-200"
                              style={{ backgroundColor: line.colors.find((c) => c.name === line.selectedColor)?.hex }}
                            />
                            {line.selectedColor}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-brand-black mt-1">
                        {formatPrice(line.price * line.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <dl className="space-y-4 border-t border-neutral-200 pt-4">
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
                {subtotal < freeThreshold && (
                  <p className="text-xs text-brand-gold">
                    Add {formatPrice(freeThreshold - subtotal)} more for free shipping!
                  </p>
                )}
                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-brand-black">
                    <dt>Total</dt>
                    <dd>{formatPrice(total)}</dd>
                  </div>
                </div>
              </dl>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-6"
                isLoading={isPlacingOrder}
              >
                {isPlacingOrder ? "Placing Order..." : `Place Order · ${formatPrice(total)}`}
              </Button>

              <p className="text-xs text-neutral-500 text-center mt-4 flex items-center justify-center gap-1.5">
                <svg className="h-4 w-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure encrypted checkout
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
