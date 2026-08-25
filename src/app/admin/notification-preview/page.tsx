"use client";

import React, { useState } from "react";
import { AdminNotification } from "@/types/notification";
import { mockNotifications } from "@/data/notifications";
import { OrderEmailPreview } from "@/components/admin/OrderEmailPreview";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

export default function NotificationPreviewPage() {
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(mockNotifications[0] || null);

  if (mockNotifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-black">Email Preview</h1>
            <p className="text-neutral-600 mt-1">
              Preview of the admin notification email sent for new orders
            </p>
          </div>
          <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-600">
            <span className="font-medium text-brand-red">Note:</span> This is a static preview of the admin email — not a real email.
          </div>
        </div>

        {/* Empty state */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <svg className="h-16 w-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1h6z" />
          </svg>
          <h2 className="text-xl font-semibold text-brand-black mb-2">No notifications to preview</h2>
          <p className="text-neutral-600 mb-6">
            Place an order from the storefront to generate a notification, or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-black">Email Preview</h1>
          <p className="text-neutral-600 mt-1">
            Preview of the admin notification email sent for new orders
          </p>
        </div>
        <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-600">
          <span className="font-medium text-brand-red">Note:</span> This is a static preview of the admin email — not a real email.
        </div>
      </div>

      {/* Notification selector */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6">
        <label htmlFor="notification-select" className="block text-sm font-medium text-brand-black mb-3">
          Select Order to Preview
        </label>
        <select
          id="notification-select"
          value={selectedNotification?.id || ""}
          onChange={(e) => {
            const notif = mockNotifications.find((n) => n.id === e.target.value);
            if (notif) setSelectedNotification(notif);
          }}
          className="w-full sm:w-80 px-4 py-2.5 border border-neutral-300 rounded-xl text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
        >
          {mockNotifications.map((n) => (
            <option key={n.id} value={n.id}>
              {n.orderNumber} — {n.customerName} — {formatPrice(n.total)} — {new Date(n.createdAt).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {/* Email preview */}
      {selectedNotification && <OrderEmailPreview notification={selectedNotification} />}
    </div>
  );
}