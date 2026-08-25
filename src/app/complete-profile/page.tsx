"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getCountries, getRegions, DEFAULT_COUNTRY_CODE, Country } from "@/data/countries";
import { updateProfile } from "@/lib/supabase/auth";

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    country: DEFAULT_COUNTRY_CODE,
    region: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countries = getCountries();
  const regions = getRegions(formData.country);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      // Update user metadata in Supabase Auth
      const { error: updateError } = await updateProfile({
        phone: formData.phone,
        country: formData.country,
        region: formData.region,
      });

      if (updateError) {
        setError(updateError);
        return;
      }

      // Also update the profiles table so the callback route sees complete profile
      const { error: profileError } = await fetch("/api/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          country: formData.country,
          region: formData.region,
        }),
      }).then((res) => res.json());

      if (profileError) {
        console.error("Failed to update profile table:", profileError);
        // Don't block the user - user_metadata is updated
      }

      // Success - redirect to account or the intended destination
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setFormData((prev) => ({ ...prev, country: newCountry, region: "" }));
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-black">Complete Your Profile</h1>
          <p className="mt-2 text-neutral-600">
            Add a few more details to get the best experience
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                onChange={handleCountryChange}
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
                  Saving...
                </span>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-neutral-600">
          <Link href="/sign-in" className="font-medium text-brand-gold hover:text-brand-accent-hover">
            Already have an account? Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center">Loading...</div>}>
      <CompleteProfileContent />
    </Suspense>
  );
}