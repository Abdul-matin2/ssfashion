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

// GET /api/admin/affiliates — List all affiliates
export async function GET() {
  try {
    const affiliates = await readAffiliates();
    // Sort by createdAt (newest first)
    affiliates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(affiliates, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Error reading affiliates:", error);
    return NextResponse.json(
      { error: "Failed to read affiliates" },
      { status: 500 }
    );
  }
}

// POST /api/admin/affiliates — Create new affiliate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const affiliates = await readAffiliates();

    // Generate new affiliate ID
    const existingIds = affiliates.map((a) => parseInt(a.id.replace("AFF-", ""))).filter((n) => !isNaN(n));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const affiliateId = `AFF-${nextId.toString().padStart(3, "0")}`;

    // Generate referral code from name
    const referralCode = body.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

    const now = new Date().toISOString();

    const newAffiliate: Affiliate = {
      id: affiliateId,
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      referralCode,
      commissionRate: body.commissionRate || 10,
      totalReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      status: body.status || "pending",
      createdAt: now,
    };

    affiliates.unshift(newAffiliate);
    await writeAffiliates(affiliates);

    return NextResponse.json(newAffiliate, {
      status: 201,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error) {
    console.error("Error creating affiliate:", error);
    return NextResponse.json(
      { error: "Failed to create affiliate" },
      { status: 500 }
    );
  }
}