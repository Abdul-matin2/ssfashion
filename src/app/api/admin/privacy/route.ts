import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const PRIVACY_FILE = path.join(process.cwd(), "src/data/privacy.json");

export async function GET() {
  try {
    const data = await fs.readFile(PRIVACY_FILE, "utf-8");
    const privacy = JSON.parse(data);
    return NextResponse.json(privacy, {
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

    await fs.writeFile(PRIVACY_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, data: body }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to update Privacy Policy:", error);
    return NextResponse.json({ error: "Failed to update Privacy Policy" }, { status: 500 });
  }
}