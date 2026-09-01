import { NextResponse } from "next/server";
import { readContentPage } from "@/lib/supabase/content";

const DEFAULT_RATES = [
  { region: "Northern Ghana", standard: "GHS 20", express: "N/A", freeThreshold: "GHS 500+" },
  { region: "Rest of Ghana", standard: "GHS 50", express: "GHS 50", freeThreshold: "GHS 500+" },
  { region: "West Africa", standard: "GHS 120", express: "GHS 200", freeThreshold: "GHS 1000+" },
];

const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

// GET /api/shipping — Get public shipping rates (Supabase-first, fallback to defaults)
export async function GET() {
  try {
    const data = await readContentPage("shipping");
    if (data?.rates?.length) {
      return NextResponse.json({ rates: data.rates }, { headers: CACHE_HEADERS });
    }
  } catch (error) {
    console.error("Supabase read failed, using fallback:", error);
  }
  // Fallback to hardcoded defaults
  return NextResponse.json({ rates: DEFAULT_RATES }, { headers: CACHE_HEADERS });
}