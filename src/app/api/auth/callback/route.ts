import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error("Code exchange error:", exchangeError);
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent("Failed to complete sign in")}`, request.url)
      );
    }

    // After successful code exchange, check if this user needs to complete their profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if user has a complete profile in the profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, country, region")
        .eq("id", user.id)
        .single();

      // Profile is complete if it has phone, country, and region
      const isComplete = profile?.phone && profile?.country && profile?.region;

      // Check if this is an OAuth user (Google, etc.)
      // providers array in app_metadata shows which auth providers the user has used
      const providers = user.app_metadata?.providers ?? [];
      const isOAuthUser = providers.some((p: string) => p !== "email");

      // If user signed in via OAuth (Google) AND profile is incomplete, redirect to complete-profile
      // This applies to both NEW users and EXISTING users who haven't completed their profile yet
      if (isOAuthUser && !isComplete) {
        // Preserve the next parameter for after profile completion
        const completeProfileUrl = `/complete-profile?next=${encodeURIComponent(next)}`;
        return NextResponse.redirect(new URL(completeProfileUrl, request.url));
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}