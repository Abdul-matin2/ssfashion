"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-black">Reset Password</h1>
          <p className="mt-2 text-neutral-600">
            Enter your email and we&apos;ll send you a link to reset your password
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-brand-black">Check your email</h2>
              <p className="mt-1 text-neutral-600">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                The link will expire in 1 hour. If you don&apos;t see it, check your spam folder.
              </p>
            </div>
            <div className="space-y-3">
              <Button className="w-full py-3" onClick={() => router.push("/sign-in")}>
                Back to Sign In
              </Button>
              <Button variant="outline" className="w-full py-3" onClick={() => setSuccess(false)}>
                Send another email
              </Button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-black mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleInputChange}
                className={cn(
                  "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black placeholder-neutral-400",
                  "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                  "transition-colors duration-200",
                  error ? "border-brand-red" : "border-neutral-300 hover:border-neutral-400"
                )}
                placeholder="you@example.com"
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "email-error" : undefined}
              />
              {error && (
                <p id="email-error" className="mt-1 text-sm text-brand-red" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div>
              <Button type="submit" className="w-full py-3" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Back to Sign In */}
        <p className="text-center text-sm text-neutral-600">
          Remember your password?{" "}
          <Link href="/sign-in" className="font-medium text-brand-gold hover:text-brand-accent-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}