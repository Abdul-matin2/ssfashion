"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [type, setType] = useState<"signup" | "recovery">("recovery");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if we have a type parameter (for signup email verification)
  const urlType = searchParams.get("type");
  if (urlType === "signup") {
    setType("signup");
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update password");
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-black">
            {type === "signup" ? "Verify Email & Set Password" : "Set New Password"}
          </h1>
          <p className="mt-2 text-neutral-600">
            {type === "signup"
              ? "Enter the code sent to your email and create your password"
              : "Enter your new password below"}
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
              <h2 className="text-xl font-semibold text-brand-black">
                {type === "signup" ? "Account Created!" : "Password Updated!"}
              </h2>
              <p className="mt-1 text-neutral-600">
                {type === "signup"
                  ? "Your account has been created successfully. You can now sign in."
                  : "Your password has been reset. You can now sign in with your new password."}
              </p>
            </div>
            <Button className="w-full py-3" onClick={() => router.push("/sign-in")}>
              Go to Sign In
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {type === "signup" && (
              <>
                <div>
                  <label htmlFor="emailOtp" className="block text-sm font-medium text-brand-black mb-2">
                    Verification Code
                  </label>
                  <input
                    id="emailOtp"
                    name="emailOtp"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    placeholder="123456"
                    className={cn(
                      "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black placeholder-neutral-400 text-center text-lg tracking-widest",
                      "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                      "transition-colors duration-200",
                      "border-neutral-300 hover:border-neutral-400"
                    )}
                  />
                  <p className="mt-1 text-xs text-neutral-500">Check your email for the 6-digit code</p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-black mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={type === "signup" ? "new-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn(
                    "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black placeholder-neutral-400 pr-12",
                    "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                    "transition-colors duration-200",
                    errors.password ? "border-brand-red" : "border-neutral-300 hover:border-neutral-400"
                  )}
                  placeholder="••••••••"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-brand-gold transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-brand-red" role="alert">
                  {errors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-black mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={cn(
                    "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black placeholder-neutral-400 pr-12",
                    "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                    "transition-colors duration-200",
                    errors.confirmPassword ? "border-brand-red" : "border-neutral-300 hover:border-neutral-400"
                  )}
                  placeholder="••••••••"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-brand-gold transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-error" className="mt-1 text-sm text-brand-red" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-brand-red" role="alert">{error}</p>
            )}

            <div>
              <Button type="submit" className="w-full py-3" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {type === "signup" ? "Creating account..." : "Updating password..."}
                  </span>
                ) : (
                  type === "signup" ? "Create Account" : "Update Password"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Links */}
        <div className="space-y-2 text-center text-sm text-neutral-600">
          {type === "signup" ? (
            <p>
              Already verified?{" "}
              <Link href="/sign-in" className="font-medium text-brand-gold hover:text-brand-accent-hover">
                Sign in
              </Link>
            </p>
          ) : (
            <p>
              <Link href="/sign-in" className="font-medium text-brand-gold hover:text-brand-accent-hover">
                Back to Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="animate-pulse text-brand-gold">Loading...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}