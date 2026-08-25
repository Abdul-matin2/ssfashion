"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Newsletter({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("submitting");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setMessage("Thanks for subscribing! You'll hear from us soon.");
      setEmail("");
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-xl text-brand-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
          disabled={status === "submitting" || status === "success"}
          aria-describedby={status === "success" ? "newsletter-success" : status === "error" ? "newsletter-error" : undefined}
        />
        <Button type="submit" size="md" isLoading={status === "submitting"} className="whitespace-nowrap">
          Subscribe
        </Button>
      </div>
      {status === "success" && (
        <p id="newsletter-success" className="text-sm text-green-600" role="status" aria-live="polite">
          {message}
        </p>
      )}
      {status === "error" && (
        <p id="newsletter-error" className="text-sm text-brand-red" role="alert">
          {message}
        </p>
      )}
      <p className="text-xs text-neutral-500">
        By subscribing, you agree to our{" "}
        <a href="/privacy" className="underline hover:text-brand-gold transition-colors">
          Privacy Policy
        </a>
        . Unsubscribe anytime.
      </p>
    </form>
  );
}