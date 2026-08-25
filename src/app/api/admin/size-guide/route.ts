import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "size-guide.json");

export async function GET() {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading size guide data:", error);
    return NextResponse.json({ error: "Failed to read size guide data" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await writeFile(DATA_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating size guide data:", error);
    return NextResponse.json({ error: "Failed to update size guide data" }, { status: 500 });
  }
}