import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "shipping.json");

// GET /api/shipping — Get public shipping rates
export async function GET() {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    const shippingData = JSON.parse(data);
    // Return only the rates array for public consumption
    return NextResponse.json({ rates: shippingData.rates || [] });
  } catch (error) {
    console.error("Error reading shipping data:", error);
    // Return default fallback rates
    return NextResponse.json({
      rates: [
        { region: "Northern Ghana", standard: "GHS 20", express: "N/A", freeThreshold: "GHS 500+" },
        { region: "Rest of Ghana", standard: "GHS 50", express: "GHS 50", freeThreshold: "GHS 500+" },
        { region: "West Africa", standard: "GHS 120", express: "GHS 200", freeThreshold: "GHS 1000+" },
      ],
    });
  }
}