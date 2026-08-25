import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server-auth";

// GET /api/admin/products/[id] — Get single product (admin)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, brand:brands(*), category:categories(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Transform snake_case to camelCase for client components
  const transformed = {
    id: data.id,
    name: data.name,
    brand: data.brand?.name || data.brand_id || "Other",
    category: data.category?.name || data.category_id || "Lifestyle",
    gender: data.gender,
    price: data.price,
    compareAtPrice: data.compare_at_price ?? undefined,
    sizes: data.sizes || [],
    colors: data.colors || [],
    images: (data.images || []).map((img: any) => ({ url: img.url, alt: img.alt })),
    rating: data.rating,
    reviewCount: data.review_count,
    isFeatured: data.is_featured,
    isNew: data.is_new,
    slug: data.slug,
    description: data.description,
    shortDescription: data.short_description,
    tags: data.tags || [],
    createdAt: data.created_at,
    stockCount: data.stock_count,
    soldCount: data.sold_count,
  };

  return NextResponse.json(transformed);
}

// PUT /api/admin/products/[id] — Update product (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Fetch current row for fallbacks
    const { data: current, error: fetchErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr || !current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Resolve brand/category names to ids
    let brandId = current.brand_id;
    if (body.brand !== undefined) {
      if (body.brand === null || body.brand === "") {
        brandId = null;
      } else {
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
    }

    let categoryId = current.category_id;
    if (body.category !== undefined) {
      if (body.category === null || body.category === "") {
        categoryId = null;
      } else {
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
    }

    // Slug handling: regenerate when name changed and slug wasn't explicitly set
    let slug = current.slug;
    if (body.slug) {
      slug = body.slug;
    } else if (body.name && body.name !== current.name) {
      slug = String(body.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Ensure slug is unique (exclude current product)
    if (slug !== current.slug) {
      const baseSlug = slug;
      let counter = 1;
      while (true) {
        const { data: clash } = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .neq("id", id)
          .maybeSingle();
        if (!clash) break;
        slug = `${baseSlug}-${counter++}`;
      }
    }

    // Convert prices to pesewas (minor units)
    const parsePrice = (val: unknown): number | null | undefined => {
      if (val === undefined) return undefined;
      if (val === null) return null;
      if (typeof val === "number") return val;
      if (typeof val === "string") return Math.round(parseFloat(val) * 100);
      return undefined;
    };

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (brandId !== current.brand_id) updates.brand_id = brandId;
    if (categoryId !== current.category_id) updates.category_id = categoryId;
    if (body.gender !== undefined) updates.gender = body.gender;
    if (body.price !== undefined) updates.price = parsePrice(body.price);
    if (body.compareAtPrice !== undefined)
      updates.compare_at_price =
        body.compareAtPrice === null ? null : parsePrice(body.compareAtPrice);
    if (body.sizes !== undefined) {
      updates.sizes = body.sizes;
      updates.stock_count = Array.isArray(body.sizes)
        ? body.sizes.filter((s: { inStock?: boolean }) => s.inStock).length
        : 0;
    }
    if (body.colors !== undefined) updates.colors = body.colors;
    if (body.images !== undefined) updates.images = body.images;
    if (body.rating !== undefined) updates.rating = body.rating;
    if (body.reviewCount !== undefined) updates.review_count = body.reviewCount;
    if (body.isFeatured !== undefined) updates.is_featured = body.isFeatured;
    if (body.isNew !== undefined) updates.is_new = body.isNew;
    if (slug !== current.slug) updates.slug = slug;
    if (body.description !== undefined) updates.description = body.description;
    if (body.shortDescription !== undefined)
      updates.short_description = body.shortDescription;
    if (body.tags !== undefined) updates.tags = body.tags;

    const { data: updated, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select("*, brand:brands(*), category:categories(*)")
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase for client components
    const transformed = {
      id: updated.id,
      name: updated.name,
      brand: updated.brand?.name || updated.brand_id || "Other",
      category: updated.category?.name || updated.category_id || "Lifestyle",
      gender: updated.gender,
      price: updated.price,
      compareAtPrice: updated.compare_at_price ?? undefined,
      sizes: updated.sizes || [],
      colors: updated.colors || [],
      images: (updated.images || []).map((img: any) => ({ url: img.url, alt: img.alt })),
      rating: updated.rating,
      reviewCount: updated.review_count,
      isFeatured: updated.is_featured,
      isNew: updated.is_new,
      slug: updated.slug,
      description: updated.description,
      shortDescription: updated.short_description,
      tags: updated.tags || [],
      createdAt: updated.created_at,
      stockCount: updated.stock_count,
      soldCount: updated.sold_count,
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] — Delete product (admin)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Best-effort cleanup of Cloudinary assets referenced by this product
    const { data: product } = await supabase
      .from("products")
      .select("images")
      .eq("id", id)
      .single();

    if (product?.images) {
      const publicIds = (product.images as { public_id?: string }[])
        .map((img) => img.public_id)
        .filter((id): id is string => Boolean(id));
      if (publicIds.length > 0) {
        try {
          const { destroyImage } = await import("@/lib/cloudinary");
          await Promise.all(publicIds.map((pid) => destroyImage(pid)));
        } catch (err) {
          console.warn("Cloudinary cleanup skipped:", err);
        }
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
