import { NextRequest, NextResponse } from "next/server";
import { readContentPage, writeContentPage } from "@/lib/supabase/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readContentPage("about");
    if (!data) {
      return NextResponse.json({ error: "Failed to load about data" }, { status: 500 });
    }
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("GET /api/admin/about error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.hero || !body.mission || !body.vision || !body.values || !body.story || !body.team || !body.stats) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await writeContentPage("about", body);
    return NextResponse.json({ success: true, data: body }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("PUT /api/admin/about error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
