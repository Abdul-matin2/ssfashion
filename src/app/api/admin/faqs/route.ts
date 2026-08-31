import { NextRequest, NextResponse } from "next/server";
import { readContentPage, writeContentPage } from "@/lib/supabase/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readContentPage("faqs");
    if (!data) {
      return NextResponse.json({ error: "Failed to load FAQs" }, { status: 500 });
    }
    const faqs = Array.isArray(data) ? data : data.faqs || [];
    return NextResponse.json(faqs.sort((a: any, b: any) => a.order - b.order), {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to read FAQs:", error);
    return NextResponse.json({ error: "Failed to load FAQs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await readContentPage("faqs");
    const faqs = Array.isArray(data) ? data : (data?.faqs || []);

    const newFaq = {
      id: Date.now().toString(),
      question: body.question,
      answer: body.answer,
      category: body.category || "General",
      order: body.order || faqs.length + 1,
    };

    faqs.push(newFaq);
    await writeContentPage("faqs", faqs);
    return NextResponse.json(newFaq, {
      status: 201,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}
