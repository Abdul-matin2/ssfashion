/**
 * Supabase Auth helpers — Client-side only
 * Implements: Email/Password + Email Confirmation (signup) + Google OAuth
 */

import { createClient } from "@/lib/supabase/client";

// ============================================================
// Client-side (browser) auth helpers
// ============================================================

// Sign up: email + password -> email confirmation link -> session
export async function signUpWithPassword(
  email: string,
  password: string,
  fullName?: string
): Promise<{ error: string | null; needsOtp: boolean }> {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });

  if (error) {
    // Handle specific errors
    if (error.message.includes("User already registered")) {
      return { error: "An account with this email already exists. Please sign in instead.", needsOtp: false };
    }
    return { error: error.message, needsOtp: false };
  }

  // Supabase sends email confirmation link (magic link) - no OTP needed
  return { error: null, needsOtp: false };
}

// Sign in: email + password only (no OTP/2FA)
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error: string | null; needsOtp: boolean }> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password. Please try again.", needsOtp: false };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please confirm your email address before signing in. Check your inbox for the confirmation link.", needsOtp: false };
    }
    return { error: error.message, needsOtp: false };
  }

  // Password verified - session created, no OTP needed
  return { error: null, needsOtp: false };
}

// Verify OTP (for signup email confirmation only)
export async function verifyOtp(
  email: string,
  token: string,
  type: "signup" | "email_change" = "signup"
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type,
  });

  if (error) {
    if (error.message.includes("Token has expired")) {
      return { error: "Code has expired. Please request a new one." };
    }
    if (error.message.includes("Invalid token")) {
      return { error: "Invalid code. Please check and try again." };
    }
    return { error: error.message };
  }

  return { error: null };
}

// Resend OTP (for signup email confirmation)
export async function resendOtp(
  email: string,
  type: "signup" | "email_change" = "signup"
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.resend({
    type,
    email,
  });

  if (error) return { error: error.message };
  return { error: null };
}

// Google OAuth
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  return { error: null };
}

// Sign out
export async function signOut(): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  return { error: null };
}

// Get current session (client)
export async function getSession() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Get current user (client)
export async function getUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Listen to auth changes
export function onAuthStateChange(
  callback: (event: string, session: import("@supabase/supabase-js").Session | null) => void
) {
  const supabase = createClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

// Password reset (forgot password)
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/api/auth/callback`,
  });
  if (error) return { error: error.message };
  return { error: null };
}

// Update password (after reset)
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { error: null };
}

// Update user metadata (profile data: phone, country, region, etc.)
export async function updateProfile(
  data: Record<string, string>
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ data });
  if (error) return { error: error.message };
  return { error: null };
}