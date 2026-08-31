import { NextRequest, NextResponse } from "next/server";
import { readContentPage, writeContentPage } from "@/lib/supabase/content";
import { Affiliate } from "@/types/affiliate";

export const dynamic = "force-dynamic";

async function readAffiliates(): Promise<Affiliate[]> {
  const data = await readContentPage("affiliates");
  if (!data) return [];
  return Array.isArray(data) ? data : data.affiliates || [];
}

async function writeAffiliates(affiliates: Affiliate[]): Promise<void> {
  await writeContentPage("affiliates", affiliates);
}

// GET /api/admin/affiliates/[id] — Get single affiliate
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const affiliates = await readAffiliates();
    const affiliate = affiliates.find((a) => a.id === id);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(affiliate, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Error reading affiliate:", error);
    return NextResponse.json(
      { error: "Failed to read affiliate" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/affiliates/[id] — Update affiliate
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const affiliates = await readAffiliates();
    const index = affiliates.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Only allow updating certain fields
    const allowedFields = ["name", "email", "phone", "commissionRate", "status"] as const;
    const updates: Partial<Affiliate> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    affiliates[index] = {
      ...affiliates[index],
      ...updates,
    };

    await writeAffiliates(affiliates);

    return NextResponse.json(affiliates[index], {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Error updating affiliate:", error);
    return NextResponse.json(
      { error: "Failed to update affiliate" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/affiliates/[id] — Delete affiliate
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const affiliates = await readAffiliates();
    const index = affiliates.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    const deleted = affiliates.splice(index, 1)[0];
    await writeAffiliates(affiliates);

    return NextResponse.json({ success: true, affiliate: deleted }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Error deleting affiliate:", error);
    return NextResponse.json(
      { error: "Failed to delete affiliate" },
      { status: 500 }
    );
  }
}