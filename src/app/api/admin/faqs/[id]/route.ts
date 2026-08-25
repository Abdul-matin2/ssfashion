import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FAQS_FILE = path.join(process.cwd(), "src/data/faqs.json");

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await fs.readFile(FAQS_FILE, "utf-8");
    const faqs = JSON.parse(data);

    const index = faqs.findIndex((faq: any) => faq.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    faqs[index] = { ...faqs[index], ...body };
    await fs.writeFile(FAQS_FILE, JSON.stringify(faqs, null, 2), "utf-8");
    return NextResponse.json(faqs[index]);
  } catch (error) {
    console.error("Failed to update FAQ:", error);
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await fs.readFile(FAQS_FILE, "utf-8");
    const faqs = JSON.parse(data);

    const filtered = faqs.filter((faq: any) => faq.id !== id);
    if (filtered.length === faqs.length) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await fs.writeFile(FAQS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}