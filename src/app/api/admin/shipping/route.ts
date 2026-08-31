import { NextRequest, NextResponse } from "next/server";
import { readContentPage, writeContentPage } from "@/lib/supabase/content";

export const dynamic = "force-dynamic";

// GET /api/admin/shipping — Get shipping data
export async function GET() {
  try {
    const data = await readContentPage("shipping");
    if (!data) {
      return NextResponse.json({ error: "Failed to read shipping data" }, { status: 500 });
    }
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Error reading shipping data:", error);
    return NextResponse.json({ error: "Failed to read shipping data" }, { status: 500 });
  }
}

// PUT /api/admin/shipping — Update shipping data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await writeContentPage("shipping", body);
    return NextResponse.json({ success: true }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Error updating shipping data:", error);
    return NextResponse.json({ error: "Failed to update shipping data" }, { status: 500 });
  }
}
