import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "shipping.json");

// GET /api/admin/shipping — Get shipping data
export async function GET() {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading shipping data:", error);
    return NextResponse.json({ error: "Failed to read shipping data" }, { status: 500 });
  }
}

// PUT /api/admin/shipping — Update shipping data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await writeFile(DATA_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shipping data:", error);
    return NextResponse.json({ error: "Failed to update shipping data" }, { status: 500 });
  }
}