/**
 * Supabase Auth helpers — Server-side only (RSC/Route Handlers)
 * Uses server client with cookie-based session
 */

import { createClient } from "@/lib/supabase/server";

// ============================================================
// Server-side (RSC/Route Handler) auth helpers
// ============================================================

export async function getServerSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getServerUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getServerProfile() {
  const supabase = await createClient();
  const user = await getServerUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
}

export async function requireAuth() {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function isAdmin(): Promise<boolean> {
  // First check Supabase Auth + profiles table (new auth system)
  const user = await getServerUser();
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (data?.role === "admin") return true;
  }

  // Fallback: check legacy admin-auth cookie (for backward compatibility)
  // This allows the existing /admin/login flow to work until migrated to Supabase Auth
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const legacyAuthCookie = cookieStore.get("admin-auth");
  if (legacyAuthCookie?.value === "true") return true;

  return false;
}

export async function requireAdmin() {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (data?.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}