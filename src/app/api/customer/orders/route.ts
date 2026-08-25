import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/customer/orders — Get orders for a customer (by email)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Get user ID from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json([]);
    }

    // Get orders for this user with order items
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          name,
          image_url,
          size,
          color,
          qty,
          price
        )
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reading customer orders:", error);
      return NextResponse.json(
        { error: "Failed to read orders" },
        { status: 500 }
      );
    }

    // Transform to simpler format for customer view
    const formattedOrders = (orders || []).map((order: any) => ({
      id: order.id,
      date: new Date(order.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      status: order.status,
      total: order.total,
      items: order.order_items?.length || 0,
      itemsDetail: (order.order_items || []).map((item: any) => ({
        name: item.name,
        quantity: item.qty,
        size: item.size,
        color: item.color,
        price: item.price,
        image: item.image_url,
      })),
      shipping: {
        address: order.shipping_address?.address || "",
        city: order.shipping_address?.city || "",
        region: order.shipping_address?.region || "",
      },
      paymentMethod: order.payment_method,
      subtotal: order.subtotal,
      shippingFee: order.delivery_fee,
      createdAt: order.created_at,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error reading customer orders:", error);
    return NextResponse.json(
      { error: "Failed to read orders" },
      { status: 500 }
    );
  }
}