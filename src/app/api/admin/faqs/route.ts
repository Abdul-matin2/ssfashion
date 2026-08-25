import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FAQS_FILE = path.join(process.cwd(), "src/data/faqs.json");

export async function GET() {
  try {
    const data = await fs.readFile(FAQS_FILE, "utf-8");
    const faqs = JSON.parse(data);
    return NextResponse.json(faqs.sort((a: any, b: any) => a.order - b.order));
  } catch (error) {
    console.error("Failed to read FAQs:", error);
    return NextResponse.json({ error: "Failed to load FAQs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await fs.readFile(FAQS_FILE, "utf-8");
    const faqs = JSON.parse(data);

    const newFaq = {
      id: Date.now().toString(),
      question: body.question,
      answer: body.answer,
      category: body.category || "General",
      order: body.order || faqs.length + 1,
    };

    faqs.push(newFaq);
    await fs.writeFile(FAQS_FILE, JSON.stringify(faqs, null, 2), "utf-8");
    return NextResponse.json(newFaq, { status: 201 });
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}