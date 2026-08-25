"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/currency";

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  momo: "Mobile Money",
  card: "Card Payment",
};

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  const method = searchParams.get("method") || "cod";
  const total = parseInt(searchParams.get("total") || "0", 10);
  const orderId = searchParams.get("orderId") || `SSF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const orderDate = new Date().toLocaleDateString("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-brand-gold">Loading confirmation...</div>
      </div>
    );
  }

  const handleContinueShopping = () => {
    router.push("/shop");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-green/10 mb-6">
            <svg className="h-12 w-12 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-black mb-2">Order Confirmed!</h1>
          <p className="text-neutral-600 text-lg">
            Thank you for shopping with S&S Fashion. Your order has been received.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-neutral-200">
            <div>
              <p className="text-sm text-neutral-500">Order Number</p>
              <p className="font-mono font-bold text-lg text-brand-black">{orderId}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-neutral-500">Order Date</p>
                <p className="font-medium text-brand-black">{orderDate}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Payment Method</p>
                <p className="font-medium text-brand-black">
                  {PAYMENT_LABELS[method] || method}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-neutral-600">Order Total</span>
              <span className="font-bold text-brand-black text-lg">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">
                {method === "cod" ? "Amount Due on Delivery" : "Amount Charged"}
              </span>
              <span className="font-bold text-brand-black text-lg">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-neutral-50 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-brand-black mb-4">What happens next?</h2>
          <ul className="space-y-3 text-neutral-700">
            <li className="flex items-start gap-3">
              <svg className="flex-shrink-0 h-5 w-5 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <span className="font-medium text-brand-black">Confirmation sent: </span>
                Check your email for the order details and receipt.
              </span>
            </li>
            {method === "cod" && (
              <li className="flex items-start gap-3">
                <svg className="flex-shrink-0 h-5 w-5 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <span className="font-medium text-brand-black">Prepare payment: </span>
                  Have the exact amount (${formatPrice(total)}) ready for the courier.
                </span>
              </li>
            )}
            <li className="flex items-start gap-3">
              <svg className="flex-shrink-0 h-5 w-5 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-2h14a2 2 0 110 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>
                <span className="font-medium text-brand-black">Delivery scheduled: </span>
                Our courier will contact you within 24 hours to arrange delivery.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="flex-shrink-0 h-5 w-5 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>
                <span className="font-medium text-brand-black">Track your order: </span>
                You'll receive a tracking link via SMS once your order ships.
              </span>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-brand-black mb-3">Need help?</h2>
          <p className="text-neutral-600 mb-4">
            Our customer support team is here to assist you.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="tel:+233240000000"
              className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-brand-gold hover:bg-neutral-50 transition-colors"
            >
              <svg className="h-6 w-6 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="font-medium text-brand-black">Call Us</p>
                <p className="text-sm text-neutral-500">+233 24 000 0000</p>
              </div>
            </Link>
            <Link
              href="mailto:ssfashion233@gmail.com"
              className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-brand-gold hover:bg-neutral-50 transition-colors"
            >
              <svg className="h-6 w-6 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium text-brand-black">Email Us</p>
                <p className="text-sm text-neutral-500">support@ssfashion.gh</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={handleContinueShopping}>
            Continue Shopping
          </Button>
          <Link href="/account">
            <Button variant="outline" size="lg">
              View My Orders
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-8">
          Save your order number <span className="font-mono font-bold">{orderId}</span> for future reference.
        </p>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse text-brand-gold">Loading confirmation...</div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}