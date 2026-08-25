"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ContactData {
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

export default function AdminContactPage() {
  const [contact, setContact] = useState<ContactData>(defaultContact);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const res = await fetch("/api/admin/contact");
      const data = await res.json();
      if (data && !data.error) setContact(data);
    } catch (error) {
      console.error("Failed to fetch contact:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Contact information updated successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update contact information" });
      }
    } catch (error) {
      console.error("Failed to save contact:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field.startsWith("socialMedia.")) {
      const platform = field.split(".")[1];
      setContact((prev) => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [platform]: value },
      }));
    } else {
      setContact((prev) => ({ ...prev, [field]: value }));
    }
  };

  const socialIcons: Record<string, React.ReactNode> = {
  instagram: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.44-.645 1.44-1.44-.645-1.44-1.44-1.44z" />
    </svg>
  ),
  facebook: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  x: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>
    </svg>
  ),
  youtube: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  tiktok: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
};

const socialFields = [
  { key: "instagram", label: "Instagram", icon: socialIcons.instagram },
  { key: "facebook", label: "Facebook", icon: socialIcons.facebook },
  { key: "x", label: "X", icon: socialIcons.x },
  { key: "youtube", label: "YouTube", icon: socialIcons.youtube },
  { key: "tiktok", label: "TikTok", icon: socialIcons.tiktok },
];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Contact Information</h1>
          <p className="text-neutral-500 mt-1">Manage store contact details and social media links</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-xl text-sm flex items-center gap-3",
          message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        )}>
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            {message.type === "success" ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          {message.text}
        </div>
      )}

      {/* Contact Details */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-brand-black">Store Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-2">Address</label>
            <textarea
              value={contact.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
              placeholder="Enter store address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-black mb-2">Phone</label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                placeholder="+233 24 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-black mb-2">Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                placeholder="support@ssfashion.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-2">Business Hours</label>
            <textarea
              value={contact.hours}
              onChange={(e) => handleChange("hours", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
              placeholder="Mon - Sat: 9:00 AM - 8:00 PM\nSun: 10:00 AM - 6:00 PM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-2">Google Maps Embed URL</label>
            <input
              type="url"
              value={contact.mapEmbedUrl}
              onChange={(e) => handleChange("mapEmbedUrl", e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-neutral-500 mt-1">Get this from Google Maps → Share → Embed a map → Copy HTML → Extract the src URL</p>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-brand-black">Social Media Links</h2>
        <div className="space-y-4">
          {socialFields.map((field) => (
            <div key={field.key} className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-neutral-600">{field.icon}</div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-brand-black mb-1">{field.label} URL</label>
                <input
                  type="url"
                  value={contact.socialMedia[field.key as keyof typeof contact.socialMedia]}
                  onChange={(e) => handleChange(`socialMedia.${field.key}`, e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
                  placeholder={`https://${field.key.toLowerCase()}.com/ssfashion`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-brand-black mb-4">Preview</h2>
        <div className="bg-neutral-50 rounded-xl p-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="font-medium text-brand-black w-32">Address:</span>
            <span className="text-neutral-600">{contact.address}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-brand-black w-32">Phone:</span>
            <span className="text-neutral-600">{contact.phone}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-brand-black w-32">Email:</span>
            <span className="text-neutral-600">{contact.email}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-brand-black w-32">Hours:</span>
            <span className="text-neutral-600 whitespace-pre-line">{contact.hours}</span>
          </div>
          <div className="pt-2 border-t border-neutral-200">
            <span className="font-medium text-brand-black">Social:</span>
            <div className="flex items-center gap-3 mt-2">
              {socialFields.map((field) => (
                contact.socialMedia[field.key as keyof typeof contact.socialMedia] && (
                  <a
                    key={field.key}
                    href={contact.socialMedia[field.key as keyof typeof contact.socialMedia]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-brand-gold/10 text-neutral-600 hover:text-brand-gold flex items-center justify-center transition-colors duration-200"
                    aria-label={field.label}
                  >
                    {field.icon}
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}