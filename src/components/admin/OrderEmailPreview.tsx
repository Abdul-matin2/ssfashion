import React from "react";
import Link from "next/link";
import type { AdminNotification } from "@/types/notification";
import { formatPrice } from "@/lib/currency";

const PAYMENT_LABELS: Record<AdminNotification["paymentMethod"], string> = {
  cod: "Cash on Delivery",
  momo: "Mobile Money",
  card: "Card",
};

interface OrderEmailPreviewProps {
  notification: AdminNotification;
}

export function OrderEmailPreview({ notification }: OrderEmailPreviewProps) {
  const {
    orderNumber,
    customerName,
    customerPhone,
    total,
    items,
    shippingAddress,
    paymentMethod,
  } = notification;

  return (
    <div className="mx-auto max-w-xl bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Email header */}
      <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
        <p className="text-xs text-neutral-500">
          <span className="font-medium text-neutral-700">From:</span> orders@ssfashion.com
        </p>
        <p className="text-xs text-neutral-500">
          <span className="font-medium text-neutral-700">To:</span> admin@ssfashion.com
        </p>
        <p className="mt-2 text-base font-semibold text-brand-black">
          New Order #{orderNumber} — S&amp;S Fashion
        </p>
      </div>

      {/* Email body */}
      <div className="px-6 py-5 space-y-5 text-sm text-neutral-700">
        <p>
          You&apos;ve received a new order. Here are the details:
        </p>

        {/* Customer */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">Customer</h3>
          <p className="font-medium text-brand-black">{customerName}</p>
          <p>{customerPhone}</p>
        </section>

        {/* Items */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">Items</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
                <th scope="col" className="py-1.5 pr-2 font-medium">Item</th>
                <th scope="col" className="py-1.5 px-2 font-medium">Size</th>
                <th scope="col" className="py-1.5 px-2 font-medium text-center">Qty</th>
                <th scope="col" className="py-1.5 pl-2 font-medium text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-b-0">
                  <td className="py-2 pr-2 font-medium text-brand-black">{item.name}</td>
                  <td className="py-2 px-2">{item.size}</td>
                  <td className="py-2 px-2 text-center">{item.qty}</td>
                  <td className="py-2 pl-2 text-right">{formatPrice(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Total */}
        <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
          <span className="font-semibold text-brand-black">Total ({PAYMENT_LABELS[paymentMethod]})</span>
          <span className="text-lg font-bold text-brand-gold">{formatPrice(total)}</span>
        </div>

        {/* Shipping address */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">Ship To</h3>
          <p>{shippingAddress}</p>
        </section>

        {/* CTA */}
        <div className="pt-1">
          <Link
            href={`/admin/orders/${orderNumber}`}
            className="inline-flex items-center justify-center rounded-xl bg-brand-black px-6 py-3 text-sm font-semibold text-brand-white hover:bg-neutral-800 transition-colors"
          >
            View Order
          </Link>
        </div>
      </div>
    </div>
  );
}