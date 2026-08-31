import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const COOKIES_FILE = path.join(process.cwd(), "src/data/cookies.json");

export async function GET() {
  try {
    const data = await fs.readFile(COOKIES_FILE, "utf-8");
    const cookies = JSON.parse(data);
    return NextResponse.json(cookies, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to read Cookie Policy:", error);
    return NextResponse.json({ error: "Failed to load Cookie Policy" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.lastUpdated || !body.effectiveDate ||
        !body.essentialCookies || !Array.isArray(body.essentialCookies) ||
        !body.analyticsCookies || !Array.isArray(body.analyticsCookies) ||
        !body.functionalCookies || !Array.isArray(body.functionalCookies) ||
        !body.marketingCookies || !Array.isArray(body.marketingCookies)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await fs.writeFile(COOKIES_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, data: body }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to update Cookie Policy:", error);
    return NextResponse.json({ error: "Failed to update Cookie Policy" }, { status: 500 });
  }
}