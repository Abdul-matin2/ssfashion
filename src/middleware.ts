import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected storefront routes → redirect to sign-in
  const protectedStorefrontRoutes = ["/account", "/checkout", "/wishlist"];
  const isProtectedStorefront =
    !user && protectedStorefrontRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedStorefront) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes → require an authenticated admin profile.
  // The legacy password-gate cookie is still honored so the existing
  // /admin/login flow keeps working until Supabase auth replaces it.
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !pathname.startsWith("/admin/logout")) {
    const legacyAuthCookie = request.cookies.get("admin-auth");

    if (!legacyAuthCookie || legacyAuthCookie.value !== "true") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Supabase session refresh needs to run on all app pages + auth callback
    // Exclude admin API routes to avoid middleware interference
    "/((?!_next/static|_next/image|favicon.ico|images|api/webhooks|api/admin|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// Note: The "middleware" file convention is deprecated in Next.js 16.3.1 in favor of "proxy"
// This file is kept as-is for now. To migrate, run:
// npx @next/codemod@canary middleware-to-proxy .
// See: https://nextjs.org/docs/messages/middleware-to-proxy
