"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Order, OrderStatus } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  momo: "Mobile Money",
  card: "Card Payment",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    const previousStatus = order.status;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Create notification for customer about status change
        if (previousStatus !== newStatus) {
          try {
            await fetch("/api/customer/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: order.shipping.email,
                title: `Order ${order.id} Status Updated`,
                message: `Your order status has been updated from ${STATUS_LABELS[previousStatus]} to ${STATUS_LABELS[newStatus]}.`,
                type: "order",
                orderId: order.id,
              }),
            });
          } catch (notificationError) {
            console.error("Failed to create notification:", notificationError);
          }
        }
        fetchOrder();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
        <p className="text-neutral-500">Order not found</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-brand-gold hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-black transition-colors mb-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-brand-black">Order {order.id}</h1>
          <p className="text-neutral-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value as OrderStatus)}
            className={cn(
              "text-sm font-medium px-4 py-2 rounded-lg border-0 cursor-pointer",
              STATUS_STYLES[order.status]
            )}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-brand-black">Order Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-neutral-200">
              {order.items.map((item, i) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0">
                    <img src={typeof item.image === 'object' ? item.image.url : item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-black truncate">{item.name}</p>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {item.brand} · Size: {item.size}
                      {item.color && (
                        <span className="inline-flex items-center gap-1 ml-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full border border-neutral-200"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          {item.color}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-brand-black">{formatPrice(item.price)}</p>
                    <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-brand-black">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-brand-black mb-4">Order Summary</h2>
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd className="font-medium text-brand-black">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-neutral-500">Shipping</dt>
                <dd className="font-medium text-brand-black">
                  {order.shippingFee === 0 ? (
                    <span className="text-brand-green">Free</span>
                  ) : (
                    formatPrice(order.shippingFee)
                  )}
                </dd>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between text-lg font-bold text-brand-black">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar: Shipping & Payment */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-brand-black mb-4">Customer</h2>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium text-brand-black">{order.shipping.firstName} {order.shipping.lastName}</span></p>
              <p className="text-neutral-600">{order.shipping.email}</p>
              <p className="text-neutral-600">{order.shipping.phone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-brand-black mb-4">Shipping Address</h2>
            <address className="text-sm text-neutral-600 not-italic space-y-1">
              <p>{order.shipping.address}</p>
              <p>{order.shipping.city}, {order.shipping.region}</p>
              {order.shipping.notes && (
                <p className="text-xs text-neutral-500 mt-2">
                  <span className="font-medium">Notes:</span> {order.shipping.notes}
                </p>
              )}
            </address>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-brand-black mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-brand-black">Method:</span>{" "}
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-brand-black mb-4">Timeline</h2>
            <div className="space-y-4 border-l-2 border-neutral-200 pl-4">
              <div className="relative">
                <div className="absolute left-[-10px] top-0 w-4 h-4 rounded-full bg-brand-black border-4 border-white" />
                <p className="text-sm text-neutral-500">Order placed</p>
                <p className="font-medium text-brand-black">{formatDate(order.createdAt)}</p>
              </div>
              {order.updatedAt !== order.createdAt && (
                <div className="relative">
                  <div className="absolute left-[-10px] top-0 w-4 h-4 rounded-full bg-brand-gold border-4 border-white" />
                  <p className="text-sm text-neutral-500">Status updated to {STATUS_LABELS[order.status]}</p>
                  <p className="font-medium text-brand-black">{formatDate(order.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}