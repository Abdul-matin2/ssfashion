"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { signInWithGoogle } from "@/lib/supabase/auth";
import { getCountries, getRegions, DEFAULT_COUNTRY_CODE, Country } from "@/data/countries";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // true = show "check your email" screen
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: DEFAULT_COUNTRY_CODE,
    region: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const countries = getCountries();
  const regions = getRegions(formData.country);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+\d{1,3}[- ]?)?\d{9,}$/.test(formData.phone.replace(/[\s()-]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
    }
    if (!formData.region) {
      newErrors.region = "Region/State is required";
    }
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
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          region: formData.region,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.error || "Failed to create account");
        return;
      }

      // Account created - Supabase sent a confirmation link to the email.
      // Show the "check your inbox" screen; no OTP entry needed.
      setEmailSent(true);
    } catch {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) setGeneralError("");
  };

  // Email confirmation link sent - success screen
  if (emailSent) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold/10">
            <svg
              className="h-8 w-8 text-brand-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-brand-black">Check your email</h1>
            <p className="mt-3 text-neutral-600">
              We&apos;ve sent a verification link to{" "}
              <strong className="text-brand-black">{formData.email}</strong>. Click the link in
              the email to confirm your account and complete sign-up.
            </p>
          </div>

          <p className="text-sm text-neutral-500">
            Didn&apos;t receive it? Check your spam folder, or try signing in — we&apos;ll resend
            the confirmation email automatically.
          </p>

          <div className="space-y-3">
            <Button className="w-full py-3" onClick={() => router.push("/sign-in")}>
              Go to Sign in
            </Button>
            <Button
              variant="outline"
              className="w-full py-3"
              onClick={() => {
                setEmailSent(false);
                setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
              }}
            >
              Use a different email
            </Button>
          </div>

          <p className="text-sm text-neutral-600">
            Already confirmed?{" "}
            <Link href="/sign-in" className="font-medium text-brand-gold hover:text-brand-accent-hover">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-black">Welcome</h1>
          <p className="mt-2 text-neutral-600">Join S&S Fashion for exclusive deals</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-brand-black mb-2">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className={cn(
                  "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black placeholder-neutral-400",
                  "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                  "transition-colors duration-200",
                  errors.firstName ? "border-brand-red" : "border-neutral-300 hover:border-neutral-400"
                )}
                placeholder="John"
                aria-invalid={errors.firstName ? "true" : "false"}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-brand-red" role="alert">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-brand-black mb-2">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className={cn(
                  "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black placeholder-neutral-400",
                  "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                  "transition-colors duration-200",
                  errors.lastName ? "border-brand-red" : "border-neutral-300 hover:border-neutral-400"
                )}
                placeholder="Doe"
                aria-invalid={errors.lastName ? "true" : "false"}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-brand-red" role="alert">{errors.lastName}</p>
              )}
            </div>
          </div>

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
              value={formData.email}
              onChange={handleInputChange}
              className={cn(
                "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black placeholder-neutral-400",
                "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                "transition-colors duration-200",
                errors.email ? "border-brand-red" : "border-neutral-300 hover:border-neutral-400"
              )}
              placeholder="you@example.com"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-brand-red" role="alert">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-brand-black mb-2">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className={cn(
                "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black placeholder-neutral-400",
                "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                "transition-colors duration-200",
                errors.phone ? "border-brand-red" : "border-neutral-300 hover:border-neutral-400"
              )}
              placeholder="+233 24 123 4567"
              aria-invalid={errors.phone ? "true" : "false"}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-brand-red" role="alert">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-brand-black mb-2">
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  setFormData((prev) => ({ ...prev, country: newCountry, region: "" }));
                  if (errors.country) {
                    setErrors((prev) => ({ ...prev, country: "" }));
                  }
                }}
                className={cn(
                  "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black bg-white",
                  "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                  "transition-colors duration-200",
                  errors.country ? "border-brand-red" : "border-neutral-300 hover:border-neutral-400"
                )}
                aria-invalid={errors.country ? "true" : "false"}
              >
                {countries.map((country: Country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-brand-red" role="alert">{errors.country}</p>
              )}
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-brand-black mb-2">
                Region/State *
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                disabled={regions.length === 0}
                className={cn(
                  "appearance-none rounded-xl relative block w-full px-4 py-3 border text-brand-black bg-white",
                  "focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent",
                  "transition-colors duration-200",
                  regions.length === 0
                    ? "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                    : errors.region
                    ? "border-brand-red"
                    : "border-neutral-300 hover:border-neutral-400"
                )}
                aria-invalid={errors.region ? "true" : "false"}
              >
                <option value="">Select region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p className="mt-1 text-sm text-brand-red" role="alert">{errors.region}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-black mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
              <p className="mt-1 text-sm text-brand-red" role="alert">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-black mb-2">
              Confirm password
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
              <p className="mt-1 text-sm text-brand-red" role="alert">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              className={cn(
                "h-4 w-4 mt-1 text-brand-gold border-neutral-300 rounded focus:ring-brand-gold focus:ring-2",
                errors.agreeTerms ? "border-brand-red" : ""
              )}
              aria-invalid={errors.agreeTerms ? "true" : "false"}
            />
            <label htmlFor="agreeTerms" className="text-sm text-neutral-700">
              I agree to the{" "}
              <Link href="/terms" className="text-brand-gold hover:text-brand-accent-hover">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-brand-gold hover:text-brand-accent-hover">Privacy Policy</Link>
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="-mt-4 text-sm text-brand-red" role="alert">{errors.agreeTerms}</p>
          )}

          {generalError && (
            <p className="text-sm text-brand-red" role="alert">{generalError}</p>
          )}

          <div>
            <Button type="submit" className="w-full py-3" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-neutral-50 text-neutral-500">Or sign up with</span>
          </div>
        </div>

        {/* Social Sign Up */}
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 rounded-xl text-sm font-medium text-brand-black hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              const { error } = await signInWithGoogle();
              if (error) {
                setGeneralError(error);
              }
              setIsLoading(false);
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-brand-gold hover:text-brand-accent-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
