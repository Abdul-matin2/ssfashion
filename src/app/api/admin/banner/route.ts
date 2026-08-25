import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/server-auth";

// Convert snake_case DB columns to camelCase for frontend
function toCamelCase(data: Record<string, unknown>): Record<string, unknown> {
  if (!data) return {};
  return {
    id: data.id,
    enabled: data.enabled,
    badge: data.badge,
    title: data.title,
    subtitle: data.subtitle,
    discountText: data.discount_text,
    discountLabel: data.discount_label,
    ctaText: data.cta_text,
    ctaLink: data.cta_link,
    image: data.image,
    imageAlt: data.image_alt,
    backgroundColor: data.background_color,
    textColor: data.text_color,
    accentColor: data.accent_color,
    badgeColor: data.badge_color,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Convert camelCase frontend fields to snake_case for DB
function toSnakeCase(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    switch (key) {
      case "discountText":
        result.discount_text = value;
        break;
      case "discountLabel":
        result.discount_label = value;
        break;
      case "ctaText":
        result.cta_text = value;
        break;
      case "ctaLink":
        result.cta_link = value;
        break;
      case "imageAlt":
        result.image_alt = value;
        break;
      case "backgroundColor":
        result.background_color = value;
        break;
      case "textColor":
        result.text_color = value;
        break;
      case "accentColor":
        result.accent_color = value;
        break;
      case "badgeColor":
        result.badge_color = value;
        break;
      case "createdAt":
      case "updatedAt":
      case "id":
        // Skip read-only fields
        break;
      default:
        result[key] = value;
    }
  }
  return result;
}

export async function GET() {
  try {
    // Use admin client to bypass RLS (admin API should see all banners)
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("banner")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json(toCamelCase(data || {}));
  } catch (error) {
    console.error("Error reading banner:", error);
    return NextResponse.json(
      { error: "Failed to read banner" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/admin/banner - checking admin...");
    const adminCheck = await isAdmin();
    console.log("PUT /api/admin/banner - adminCheck:", adminCheck);
    if (!adminCheck) {
      console.log("PUT /api/admin/banner - unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await request.text();
    console.log("PUT /api/admin/banner - rawBody:", rawBody);
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log("PUT /api/admin/banner - JSON.parse success:", body);
    } catch (e) {
      console.error("PUT /api/admin/banner - JSON.parse error:", e);
      body = {};
    }
    console.log("PUT /api/admin/banner - body:", body);

    // Use admin client (service role) to bypass RLS for admin operations
    const supabase = await createAdminClient();

    // Get current banner or create default - use maybeSingle to avoid error on no rows
    const { data: existing, error: existingError } = await supabase
      .from("banner")
      .select("*")
      .maybeSingle();

    console.log("PUT /api/admin/banner - existing:", existing, "existingError:", existingError);

    // Convert camelCase to snake_case for DB
    const dbBody = toSnakeCase(body);
    console.log("PUT /api/admin/banner - dbBody:", dbBody);

    if (existing) {
      const { data, error } = await supabase
        .from("banner")
        .update({
          ...dbBody,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("PUT /api/admin/banner - update error:", error);
        throw error;
      }
      console.log("PUT /api/admin/banner - updated:", data);
      return NextResponse.json(toCamelCase(data));
    } else {
      const { data, error } = await supabase
        .from("banner")
        .insert({
          ...dbBody,
          enabled: true,
        })
        .select()
        .single();

      if (error) {
        console.error("PUT /api/admin/banner - insert error:", error);
        throw error;
      }
      console.log("PUT /api/admin/banner - inserted:", data);
      return NextResponse.json(toCamelCase(data));
    }
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner", details: String(error) },
      { status: 500 }
    );
  }
}