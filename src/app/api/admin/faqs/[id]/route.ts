import { NextRequest, NextResponse } from "next/server";
import { readContentPage, writeContentPage } from "@/lib/supabase/content";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await readContentPage("faqs");
    const faqs = Array.isArray(data) ? data : (data?.faqs || []);

    const index = faqs.findIndex((faq: any) => faq.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    faqs[index] = { ...faqs[index], ...body };
    await writeContentPage("faqs", faqs);
    return NextResponse.json(faqs[index], {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
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
    const data = await readContentPage("faqs");
    const faqs = Array.isArray(data) ? data : (data?.faqs || []);

    const filtered = faqs.filter((faq: any) => faq.id !== id);
    if (filtered.length === faqs.length) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await writeContentPage("faqs", filtered);
    return NextResponse.json({ success: true }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
