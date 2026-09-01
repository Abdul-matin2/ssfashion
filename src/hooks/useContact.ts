"use client";

import { useEffect, useState } from "react";

export interface ContactData {
  address: string;
  phone: string;
  email: string;
  hours: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    x: string;
    youtube: string;
    tiktok: string;
  };
  mapEmbedUrl: string;
}

const defaultContact: ContactData = {
  address: "123 Fashion Street, Accra, Ghana",
  phone: "+233 24 123 4567",
  email: "support@ssfashion.com",
  hours: "Mon - Sat: 9:00 AM - 8:00 PM\nSun: 10:00 AM - 6:00 PM",
  socialMedia: {
    instagram: "https://instagram.com/ssfashion",
    facebook: "https://facebook.com/ssfashion",
    x: "https://x.com/ssfashion",
    youtube: "https://youtube.com/ssfashion",
    tiktok: "https://tiktok.com/@ssfashion",
  },
  mapEmbedUrl: "",
};

/**
 * Hook to fetch contact information from the admin API.
 * This is the single source of truth for email and social media links across the entire site.
 * Admin edits in /admin/contact update this data in Supabase, and all pages using this hook
 * will reflect the changes automatically.
 */
export function useContact() {
  const [contact, setContact] = useState<ContactData>(defaultContact);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchContact = async () => {
      try {
        const res = await fetch("/api/admin/contact", {
          cache: "no-store", // Always fetch fresh data
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error && mounted) {
            // Merge with defaults to ensure all fields exist
            setContact({
              ...defaultContact,
              ...data,
              socialMedia: {
                ...defaultContact.socialMedia,
                ...(data.socialMedia || {}),
              },
            });
          }
        }
      } catch (error) {
        console.warn("Failed to fetch contact data, using defaults:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchContact();

    return () => {
      mounted = false;
    };
  }, []);

  return { contact, isLoading };
}

/**
 * Convenience hook for just the email address
 */
export function useContactEmail(): string {
  const { contact } = useContact();
  return contact.email;
}

/**
 * Convenience hook for just the phone number
 */
export function useContactPhone(): string {
  const { contact } = useContact();
  return contact.phone;
}

/**
 * Convenience hook for social media links
 */
export function useSocialMedia(): ContactData["socialMedia"] {
  const { contact } = useContact();
  return contact.socialMedia;
}