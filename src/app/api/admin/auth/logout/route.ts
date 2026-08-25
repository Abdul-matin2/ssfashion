import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  response.headers.set("Set-Cookie", clearAuthCookie());
  return response;
}

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", clearAuthCookie());
  return response;
}