import { getProducts } from "@/lib/supabase/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "24");
  const page = parseInt(searchParams.get("page") || "1");
  const offset = (page - 1) * limit;

  if (!q.trim()) {
    return NextResponse.json({ products: [], total: 0 });
  }

  try {
    const { products, total } = await getProducts({
      search: q.trim(),
      limit,
      offset,
    });

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ products: [], total: 0, error: "Search failed" }, { status: 500 });
  }
}