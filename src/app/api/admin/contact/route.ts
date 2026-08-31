import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const CONTACT_FILE = path.join(process.cwd(), "src/data/contact.json");

export async function GET() {
  try {
    const data = await fs.readFile(CONTACT_FILE, "utf-8");
    return NextResponse.json(JSON.parse(data), {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to read contact data:", error);
    return NextResponse.json({ error: "Failed to load contact information" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await fs.writeFile(CONTACT_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to update contact data:", error);
    return NextResponse.json({ error: "Failed to update contact information" }, { status: 500 });
  }
}