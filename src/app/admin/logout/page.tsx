"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Call logout API then redirect
    fetch("/api/admin/auth/logout", { method: "POST" })
      .then(() => {
        router.push("/admin/login");
        router.refresh();
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-gold border-t-transparent mx-auto mb-4" />
        <p className="text-neutral-500">Signing out...</p>
      </div>
    </div>
  );
}