import { NextRequest, NextResponse } from "next/server";
import { readContentPage, writeContentPage } from "@/lib/supabase/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readContentPage("returns");
    if (!data) {
      return NextResponse.json({ error: "Failed to read returns data" }, { status: 500 });
    }
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Error reading returns data:", error);
    return NextResponse.json({ error: "Failed to read returns data" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await writeContentPage("returns", body);
    return NextResponse.json({ success: true }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Error updating returns data:", error);
    return NextResponse.json({ error: "Failed to update returns data" }, { status: 500 });
  }
}
