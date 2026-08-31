import { NextRequest, NextResponse } from "next/server";
import { readContentPage, writeContentPage } from "@/lib/supabase/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readContentPage("terms");
    if (!data) {
      return NextResponse.json({ error: "Failed to load Terms" }, { status: 500 });
    }
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to read Terms:", error);
    return NextResponse.json({ error: "Failed to load Terms" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.lastUpdated || !body.effectiveDate || !body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await writeContentPage("terms", body);
    return NextResponse.json({ success: true, data: body }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to update Terms:", error);
    return NextResponse.json({ error: "Failed to update Terms" }, { status: 500 });
  }
}