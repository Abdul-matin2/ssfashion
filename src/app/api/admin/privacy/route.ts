import { NextRequest, NextResponse } from "next/server";
import { readContentPage, writeContentPage } from "@/lib/supabase/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readContentPage("privacy");
    if (!data) {
      return NextResponse.json({ error: "Failed to load Privacy Policy" }, { status: 500 });
    }
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to read Privacy Policy:", error);
    return NextResponse.json({ error: "Failed to load Privacy Policy" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.lastUpdated || !body.effectiveDate || !body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await writeContentPage("privacy", body);
    return NextResponse.json({ success: true, data: body }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to update Privacy Policy:", error);
    return NextResponse.json({ error: "Failed to update Privacy Policy" }, { status: 500 });
  }
}