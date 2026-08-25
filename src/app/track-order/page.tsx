"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TrackingStep {
  status: string;
  date: string;
  time: string;
  location: string;
  completed: boolean;
  current: boolean;
}

interface TrackingResult {
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  currentStatus: string;
  steps: TrackingStep[];
}

const defaultTrackingResult: TrackingResult | null = null;

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(defaultTrackingResult);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTrackingResult(null);

    if (!orderNumber.trim()) {
      setError("Please enter your order number");
      return;
    }

    setIsLoading(true);

    // Simulate API call - in production, this would call a real tracking API
    setTimeout(() => {
      // Demo: show a mock tracking result for order numbers starting with "SS"
      if (orderNumber.toUpperCase().startsWith("SS")) {
        setTrackingResult({
          orderId: orderNumber,
          orderDate: "2026-08-15",
          estimatedDelivery: "2026-08-22",
          carrier: "SpeedAf Logistics",
          trackingNumber: "SA" + Math.random().toString(36).substring(2, 14).toUpperCase(),
          currentStatus: "In Transit",
          steps: [
            { status: "Order Placed", date: "2026-08-15", time: "10:30 AM", location: "Online", completed: true, current: false },
            { status: "Processing", date: "2026-08-16", time: "09:15 AM", location: "S&S Fashion Warehouse, Accra", completed: true, current: false },
            { status: "Dispatched", date: "2026-08-17", time: "02:45 PM", location: "SpeedAf Hub, Accra", completed: true, current: false },
            { status: "In Transit", date: "2026-08-18", time: "11:20 AM", location: "SpeedAf Hub, Kumasi", completed: true, current: true },
            { status: "Out for Delivery", date: "", time: "", location: "", completed: false, current: false },
            { status: "Delivered", date: "", time: "", location: "", completed: false, current: false },
          ],
        });
      } else {
        setError("Order not found. Please check your order number and try again. Order numbers start with 'SS'.");
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            Track Your Order
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Enter your order number to see real-time delivery updates
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 mb-12">
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-brand-black mb-2">
                Order Number *
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., SS-2026-12345"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all text-brand-black placeholder-neutral-400"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-black mb-2">
                Email Address (optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Used for additional verification"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all text-brand-black placeholder-neutral-400"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200",
                isLoading
                  ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                  : "bg-brand-black text-brand-white hover:bg-brand-black/90"
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Tracking...
                </span>
              ) : (
                "Track Order"
              )}
            </button>
          </form>
        </div>

        {/* Tracking Result */}
        {trackingResult && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden mb-12">
            {/* Order Info Header */}
            <div className="p-6 border-b border-neutral-200 bg-neutral-50">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Order Number</p>
                  <p className="font-semibold text-brand-black">{trackingResult.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Order Date</p>
                  <p className="font-semibold text-brand-black">{trackingResult.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Estimated Delivery</p>
                  <p className="font-semibold text-brand-gold">{trackingResult.estimatedDelivery}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Carrier</p>
                  <p className="font-semibold text-brand-black">{trackingResult.carrier}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">Tracking Number</p>
                <p className="font-mono text-brand-black">{trackingResult.trackingNumber}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold font-semibold">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h2m6 0a1 1 0 011 1v3a1 1 0 01-1 1m9-10a1 1 0 01-1 1H8a1 1 0 01-1-1V7a4 4 0 118 0z" />
                  </svg>
                  {trackingResult.currentStatus}
                </span>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-brand-black mb-6">Tracking History</h3>
              <div className="space-y-4">
                {trackingResult.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex-shrink-0 mt-1",
                          step.completed && !step.current && "bg-brand-gold",
                          step.current && "bg-brand-gold ring-4 ring-brand-gold/20",
                          !step.completed && "bg-neutral-200"
                        )}
                      />
                      {index < trackingResult.steps.length - 1 && (
                        <div className={cn("w-0.5 flex-1 mt-2", step.completed ? "bg-brand-gold" : "bg-neutral-200")} />
                      )}
                    </div>
                    <div className="pb-8">
                      <h4 className={cn("font-medium", step.completed ? "text-brand-black" : "text-neutral-400")}>
                        {step.status}
                      </h4>
                      {step.date && (
                        <p className="text-sm text-neutral-600 mt-1">
                          {step.date} at {step.time}
                        </p>
                      )}
                      {step.location && (
                        <p className="text-sm text-neutral-500 mt-0.5">{step.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-brand-black mb-4">Where to Find Your Order Number</h2>
          <ul className="space-y-3 text-neutral-600 mb-6">
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 flex-shrink-0 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Check your order confirmation email — it&apos;s in the subject line</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 flex-shrink-0 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Log into your account and check &quot;My Orders&quot;</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 flex-shrink-0 text-brand-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>Order numbers start with &quot;SS-&quot; followed by the date and a number</span>
            </li>
          </ul>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-gold/80 font-medium transition-colors"
          >
            Still need help? Contact us
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}