import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src/data/about.json");

function readData() {
  try {
    const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Failed to read about data:", error);
    return null;
  }
}

function writeData(data: unknown) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write about data:", error);
    return false;
  }
}

export async function GET() {
  try {
    const data = readData();
    if (!data) {
      return NextResponse.json({ error: "Failed to load about data" }, { status: 500 });
    }
    return NextResponse.json(data);
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

    const success = writeData(body);
    if (!success) {
      return NextResponse.json({ error: "Failed to save about data" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("PUT /api/admin/about error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}