"use client";

import { formatPrice } from "@/lib/currency";
import { getRelativeTime } from "@/lib/utils";

interface CustomerNotification {
  id: string;
  email: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  orderId: string | null;
  createdAt: string;
}

interface CustomerEmailPreviewProps {
  notification: CustomerNotification | null;
}

export function CustomerEmailPreview({ notification }: CustomerEmailPreviewProps) {
  if (!notification) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-neutral-500">Select a notification to preview the email</p>
        </div>
      </div>
    );
  }

  const paymentMethodLabels: Record<string, string> = {
    cod: "Cash on Delivery",
    momo: "Mobile Money",
    card: "Card Payment",
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Preview Note */}
      <div className="mb-6 p-4 bg-brand-gold/10 border border-brand-gold/30 rounded-xl text-center">
        <p className="text-sm text-brand-black font-medium">
          This is a preview of the email sent to the customer — not a real email
        </p>
      </div>

      {/* Email Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {/* Email Header */}
        <div className="bg-brand-black text-brand-white p-6">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-brand-white/70">
              <span>From:</span>
              <span className="font-mono text-brand-white">orders@ssfashion.com</span>
            </div>
            <div className="flex items-center gap-2 text-brand-white/70">
              <span>To:</span>
              <span className="font-mono text-brand-white">{notification.email}</span>
            </div>
            <div className="flex items-center gap-2 text-brand-white/70">
              <span>Subject:</span>
              <span className="font-semibold text-brand-gold">{notification.title}</span>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 space-y-6">
          {/* Message */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-brand-black whitespace-pre-line">{notification.message}</p>
          </div>

          {/* Order Reference */}
          {notification.orderId && (
            <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">
                Order Reference
              </h4>
              <p className="text-sm text-brand-black font-mono">{notification.orderId}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center pt-4 border-t border-neutral-100">
            <a
              href={`/account?tab=orders`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black text-brand-white rounded-xl font-semibold hover:bg-brand-black/90 transition-colors"
            >
              View Order in Account
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}