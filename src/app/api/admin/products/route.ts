import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server-auth";

// GET /api/admin/products — List all products (admin)
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, brand:brands(*), category:categories(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing products:", error);
    return NextResponse.json({ error: "Failed to list products" }, { status: 500 });
  }

  // Transform snake_case to camelCase for client components
  const transformed = (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    brand: p.brand?.name || p.brand_id || "Other",
    category: p.category?.name || p.category_id || "Lifestyle",
    gender: p.gender,
    price: p.price,
    compareAtPrice: p.compare_at_price ?? undefined,
    sizes: p.sizes || [],
    colors: p.colors || [],
    images: (p.images || []).map((img: any) => ({ url: img.url, alt: img.alt })),
    rating: p.rating,
    reviewCount: p.review_count,
    isFeatured: p.is_featured,
    isNew: p.is_new,
    slug: p.slug,
    description: p.description,
    shortDescription: p.short_description,
    tags: p.tags || [],
    createdAt: p.created_at,
    stockCount: p.stock_count,
    soldCount: p.sold_count,
  }));

  return NextResponse.json(transformed);
}

// POST /api/admin/products — Create a new product (admin)
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // Resolve brand/category names to ids (create them if missing)
    let brandId: string | null = null;
    if (body.brand) {
      const { data: existing } = await supabase
        .from("brands")
        .select("id")
        .eq("name", body.brand)
        .single();
      if (existing) {
        brandId = existing.id;
      } else {
        const { data: created, error: brandErr } = await supabase
          .from("brands")
          .insert({ name: body.brand })
          .select("id")
          .single();
        if (brandErr) throw brandErr;
        brandId = created.id;
      }
    }

    let categoryId: string | null = null;
    if (body.category) {
      const slug = String(body.category)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .single();
      if (existing) {
        categoryId = existing.id;
      } else {
        const { data: created, error: catErr } = await supabase
          .from("categories")
          .insert({ name: body.category, slug })
          .select("id")
          .single();
        if (catErr) throw catErr;
        categoryId = created.id;
      }
    }

    // Auto-generate slug from name if not provided
    const baseSlug =
      body.slug ||
      String(body.name || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Ensure slug is unique
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: clash } = await supabase
        .from("products")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();
      if (!clash) break;
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // Convert prices to pesewas (minor units)
    const parsePrice = (val: unknown): number => {
      if (typeof val === "number") return val;
      if (typeof val === "string") return Math.round(parseFloat(val) * 100);
      return 0;
    };

    const stockCount = Array.isArray(body.sizes)
      ? body.sizes.filter((s: { inStock?: boolean }) => s.inStock).length
      : 0;

    const { data: newProduct, error } = await supabase
      .from("products")
      .insert({
        name: body.name || "Untitled Product",
        brand_id: brandId,
        category_id: categoryId,
        gender: body.gender || "Unisex",
        price: parsePrice(body.price),
        compare_at_price: body.compareAtPrice ? parsePrice(body.compareAtPrice) : null,
        sizes: body.sizes || [],
        colors: body.colors || [],
        images: body.images || [],
        rating: body.rating || 0,
        review_count: body.reviewCount || 0,
        stock_count: stockCount,
        is_featured: body.isFeatured || false,
        is_new: body.isNew ?? true,
        slug: finalSlug,
        description: body.description || "",
        short_description: body.shortDescription || "",
        tags: body.tags || [],
      })
      .select("*, brand:brands(*), category:categories(*)")
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase for client components
    const transformed = {
      id: newProduct.id,
      name: newProduct.name,
      brand: newProduct.brand?.name || newProduct.brand_id || "Other",
      category: newProduct.category?.name || newProduct.category_id || "Lifestyle",
      gender: newProduct.gender,
      price: newProduct.price,
      compareAtPrice: newProduct.compare_at_price ?? undefined,
      sizes: newProduct.sizes || [],
      colors: newProduct.colors || [],
      images: (newProduct.images || []).map((img: any) => ({ url: img.url, alt: img.alt })),
      rating: newProduct.rating,
      reviewCount: newProduct.review_count,
      isFeatured: newProduct.is_featured,
      isNew: newProduct.is_new,
      slug: newProduct.slug,
      description: newProduct.description,
      shortDescription: newProduct.short_description,
      tags: newProduct.tags || [],
      createdAt: newProduct.created_at,
      stockCount: newProduct.stock_count,
      soldCount: newProduct.sold_count,
    };

    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
