"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/currency";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);

  const reference = searchParams.get("reference");
  const orderId = searchParams.get("orderId"); // This is the tempReference from checkout
  const total = parseInt(searchParams.get("total") || "0", 10);
  const method = searchParams.get("method") || "momo";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const verifyPayment = async () => {
      if (!reference) {
        setError("Invalid payment reference");
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await response.json();

        if (data.success) {
          // Payment successful - NOW create the order
          try {
            const createOrderResponse = await fetch("/api/admin/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: data.metadata?.items,
                shipping: data.metadata?.shipping,
                paymentMethod: data.metadata?.paymentMethod,
                subtotal: data.metadata?.subtotal,
                shippingFee: data.metadata?.shippingFee,
                total: data.metadata?.total,
              }),
            });

            if (createOrderResponse.ok) {
              const createdOrder = await createOrderResponse.json();
              setNewOrderId(createdOrder.id);
              setOrderCreated(true);

              // Update payment status on the new order
              try {
                await fetch(`/api/admin/orders/${createdOrder.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paymentStatus: "paid" }),
                });
              } catch {
                console.error("Failed to update order payment status");
              }

              router.push(
                `/order-confirmation?method=${method}&total=${total}&orderId=${createdOrder.id}&paid=true`
              );
              return;
            } else {
              throw new Error("Failed to create order after payment");
            }
          } catch (err) {
            console.error("Order creation after payment failed:", err);
            setError("Payment succeeded but order creation failed. Contact support.");
            setIsProcessing(false);
            return;
          }
        } else if (data.status === "abandoned" || data.status === "cancelled") {
          // Payment was cancelled/abandoned by user - NO order was created
          setError("Payment was cancelled. No order was placed.");
          setIsProcessing(false);
        } else {
          // Payment failed - NO order was created
          setError(data.gatewayResponse || "Payment was not successful. Please try again.");
          setIsProcessing(false);
        }
      } catch {
        setError("Failed to verify payment. Please contact support.");
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [isClient, reference, method, total, orderId, router]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-brand-gold">Loading payment...</div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="animate-spin h-16 w-16 mx-auto text-brand-gold mb-6" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-black mb-2">Verifying Payment</h1>
          <p className="text-neutral-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  // Payment was cancelled/abandoned/failed - no order was created
  const isCancelled = error?.toLowerCase().includes("cancelled") || error?.toLowerCase().includes("abandoned");

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        {isCancelled ? (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-red/10 mb-6">
              <svg className="h-12 w-12 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black mb-2">Order Cancelled</h1>
            <p className="text-neutral-600 mb-6">{error || "Payment was cancelled. No order was placed."}</p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-red/10 mb-6">
              <svg className="h-12 w-12 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black mb-2">Payment Failed</h1>
            <p className="text-neutral-600 mb-6">{error || "Your payment could not be processed."}</p>
          </>
        )}
        <div className="space-y-4">
          <Link href="/checkout">
            <Button variant="primary" size="lg" className="w-full">
              Try Again
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="lg" className="w-full">
              Back to Cart
            </Button>
          </Link>
        </div>
        <p className="text-xs text-neutral-400 mt-8">
          If you were charged but see this page, please contact support with your payment reference:{" "}
          <span className="font-mono font-bold ml-1">{reference}</span>
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse text-brand-gold">Loading...</div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}