import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, country, region, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || undefined,
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          phone: phone || undefined,
          country: country || undefined,
          region: region || undefined,
        },
        // Supabase sends a confirmation email containing a link.
        // Clicking it lands on /api/auth/callback which exchanges the code for a session.
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/api/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // No OTP step - the user confirms via the emailed verification link
    return NextResponse.json({ success: true, needsOtp: false });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
