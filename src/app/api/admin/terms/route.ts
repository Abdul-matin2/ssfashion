import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const TERMS_FILE = path.join(process.cwd(), "src/data/terms.json");

export async function GET() {
  try {
    const data = await fs.readFile(TERMS_FILE, "utf-8");
    const terms = JSON.parse(data);
    return NextResponse.json(terms);
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

    await fs.writeFile(TERMS_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Failed to update Terms:", error);
    return NextResponse.json({ error: "Failed to update Terms" }, { status: 500 });
  }
}