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

interface OrderData {
  id: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  customer_name: string;
  payment_method: string;
  payment_reference?: string;
}

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const method = searchParams.get("method") || "cod";
  const total = parseInt(searchParams.get("total") || "0", 10);
  const orderId = searchParams.get("orderId"); // For COD orders (already created)
  const reference = searchParams.get("reference"); // For online payments (temp reference)
  const paid = searchParams.get("paid") === "true";

  useEffect(() => {
    setIsClient(true);
  }, []);

  // For COD orders, we already have orderId
  // For online payments, we need to find the order by reference (webhook creates it)
  useEffect(() => {
    if (!isClient) return;

    const fetchOrder = async () => {
      if (orderId) {
        // COD order - fetch by orderId
        try {
          const response = await fetch(`/api/customer/orders?email=&orderId=${orderId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              setOrder(data[0]);
              return;
            }
          }
        } catch {
          // Ignore, will try other methods
        }
      } else if (reference && paid) {
        // Online payment - wait for webhook to create order, then find it
        // We'll poll for a bit to find the order
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max

        const pollForOrder = async () => {
          if (attempts >= maxAttempts) {
            // Fallback: Create order if webhook didn't fire
            console.log("[OrderConfirmation] Webhook didn't create order, attempting fallback creation...", { reference });
            try {
              const verifyResponse = await fetch(`/api/paystack/verify?reference=${reference}`);
              const verifyData = await verifyResponse.json();

              console.log("[OrderConfirmation] Fallback verify data:", {
                success: verifyData.success,
                hasMetadata: !!verifyData.metadata,
                hasItems: !!verifyData.metadata?.items,
                paymentStatus: verifyData.metadata?.paymentStatus,
                status: verifyData.status
              });

              if (verifyData.success && verifyData.metadata?.items) {
                const createResponse = await fetch("/api/admin/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    items: verifyData.metadata.items,
                    shipping: verifyData.metadata.shipping,
                    paymentMethod: verifyData.metadata.paymentMethod,
                    subtotal: verifyData.metadata.subtotal,
                    shippingFee: verifyData.metadata.shippingFee,
                    total: verifyData.metadata.total,
                  }),
                });

                if (createResponse.ok) {
                  const createdOrder = await createResponse.json();
                  console.log("[OrderConfirmation] Fallback order created:", createdOrder.id);
                  // Update payment status and reference
                  const patchResponse = await fetch(`/api/admin/orders/${createdOrder.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentStatus: "paid", paymentReference: reference }),
                  });
                  console.log("[OrderConfirmation] Patch response:", patchResponse.ok);

                  // Send admin email
                  console.log("[OrderConfirmation] Sending admin email for fallback order");
                  const emailResponse = await fetch("/api/admin/send-order-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderId: createdOrder.id,
                      customerName: verifyData.metadata?.shipping
                        ? `${verifyData.metadata.shipping.firstName} ${verifyData.metadata.shipping.lastName}`
                        : "",
                      customerPhone: verifyData.metadata?.shipping?.phone || "",
                      customerEmail: verifyData.metadata?.shipping?.email || "",
                      total: verifyData.metadata?.total,
                      items: verifyData.metadata?.items?.map((item: any) => ({
                        name: item.name,
                        size: item.size,
                        qty: item.quantity,
                        price: item.price,
                      })) || [],
                      shippingAddress: verifyData.metadata?.shipping
                        ? `${verifyData.metadata.shipping.address}, ${verifyData.metadata.shipping.city}, ${verifyData.metadata.shipping.region}`
                        : "",
                      paymentMethod: verifyData.metadata?.paymentMethod,
                    }),
                  });
                  const emailResult = await emailResponse.json();
                  console.log("[OrderConfirmation] Admin email result:", emailResult);

                  setOrder(createdOrder);
                  return;
                } else {
                  console.error("[OrderConfirmation] Fallback create order failed:", await createResponse.text());
                }
              }
            } catch (err) {
              console.error("[OrderConfirmation] Fallback order creation failed:", err);
            }

            setError("Order is being processed. Please check your account page in a moment.");
            setIsLoadingOrder(false);
            return;
          }

          try {
            // Try fetching via admin orders API (which has all orders)
            const response = await fetch(`/api/admin/orders?status=processing`);
            if (response.ok) {
              const data = await response.json();
              // Find order with matching payment_reference (the Paystack reference)
              const found = data.find((o: OrderData) =>
                o.payment_method === method &&
                o.total === total &&
                o.payment_reference === reference
              );
              if (found) {
                setOrder(found);
                return;
              }
            }
          } catch {
            // Ignore errors during polling
          }

          attempts++;
          setTimeout(pollForOrder, 1000);
        };

        setIsLoadingOrder(true);
        pollForOrder();
      }
    };

    fetchOrder();
  }, [isClient, orderId, reference, paid, method, total]);

  // Also listen for the order being created via the order creation endpoint
  // For COD, orderId is passed directly
  useEffect(() => {
    if (!isClient || order) return;

    if (orderId) {
      // We have an orderId for COD
      setOrder({
        id: orderId,
        status: "pending",
        payment_status: "pending",
        total,
        created_at: new Date().toISOString(),
        customer_name: "",
        payment_method: method,
      });
    }
  }, [isClient, orderId, order, method, total]);

  // Debug: Log order creation attempts
  useEffect(() => {
    if (isClient && reference && paid && !order) {
      console.log("[OrderConfirmation] Waiting for order creation via webhook or fallback...", { reference, method, total });
    }
  }, [isClient, reference, paid, order, method, total]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-brand-gold">Loading confirmation...</div>
      </div>
    );
  }

  // If still loading order for online payments
  if (isLoadingOrder && !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="animate-spin h-16 w-16 mx-auto text-brand-gold mb-6" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-black mb-2">Processing Your Order</h1>
          <p className="text-neutral-600">Your payment was successful! We're creating your order now...</p>
        </div>
      </div>
    );
  }

  // If error occurred
  if (error && !order) {
    return (
      <div className="min-h-screen bg-white px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-red/10 mb-6">
            <svg className="h-12 w-12 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black mb-2">Processing</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <div className="space-y-4">
            <Link href="/account?tab=orders">
              <Button variant="primary" size="lg" className="w-full">
                Check My Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayOrder = order || {
    id: orderId || `SSF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    status: "pending",
    payment_status: paid ? "paid" : "pending",
    total,
    created_at: new Date().toISOString(),
    customer_name: "",
    payment_method: method,
  };

  const orderDate = new Date(displayOrder.created_at).toLocaleDateString("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
              <p className="font-mono font-bold text-lg text-brand-black">{displayOrder.id}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-neutral-500">Order Date</p>
                <p className="font-medium text-brand-black">{orderDate}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Payment Method</p>
                <p className="font-medium text-brand-black">
                  {PAYMENT_LABELS[displayOrder.payment_method] || displayOrder.payment_method}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-neutral-600">Order Total</span>
              <span className="font-bold text-brand-black text-lg">{formatPrice(displayOrder.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">
                {displayOrder.payment_method === "cod" ? "Amount Due on Delivery" : "Amount Charged"}
              </span>
              <span className="font-bold text-brand-black text-lg">{formatPrice(displayOrder.total)}</span>
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
            {displayOrder.payment_method === "cod" && (
              <li className="flex items-start gap-3">
                <svg className="flex-shrink-0 h-5 w-5 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <span className="font-medium text-brand-black">Prepare payment: </span>
                  Have the exact amount ({formatPrice(displayOrder.total)}) ready for the courier.
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
          Save your order number <span className="font-mono font-bold">{displayOrder.id}</span> for future reference.
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