import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendAdminNewOrderEmail } from "@/lib/email";
import { Order, OrderItem, ShippingAddress } from "@/types/product";

// GET /api/admin/orders — List all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(request.url);

    // Filter by status
    const status = searchParams.get("status");
    let query = supabase
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
      .not("status", "in", "('cancelled','failed')") // Exclude cancelled/failed orders by default
      .order("created_at", { ascending: false });

    if (status) {
      // If specific status requested, allow it even if cancelled
      query = supabase
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
        .eq("status", status)
        .order("created_at", { ascending: false });
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Error reading orders:", error);
      return NextResponse.json(
        { error: "Failed to read orders" },
        { status: 500 }
      );
    }

    // Transform to match Order interface
    const transformedOrders: Order[] = (orders || []).map((order: any) => ({
      id: order.id,
      items: (order.order_items || []).map((item: any) => ({
        productId: item.product_id || "",
        name: item.name,
        brand: "",
        image: item.image_url || "",
        price: item.price,
        quantity: item.qty,
        size: item.size,
        color: item.color,
        colorHex: undefined,
      })),
      shipping: {
        email: order.customer_email || "",
        firstName: order.customer_name?.split(" ")[0] || "",
        lastName: order.customer_name?.split(" ").slice(1).join(" ") || "",
        phone: order.customer_phone || "",
        address: order.shipping_address?.address || "",
        city: order.shipping_address?.city || "",
        region: order.shipping_address?.region || "",
        notes: "",
      },
      paymentMethod: order.payment_method,
      subtotal: order.subtotal,
      shippingFee: order.delivery_fee,
      total: order.total,
      status: order.status,
      paymentStatus: order.payment_status || "pending",
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error("Error reading orders:", error);
    return NextResponse.json(
      { error: "Failed to read orders" },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders — Create new order (used by checkout)
export async function POST(request: NextRequest) {
  try {
    // Use regular client to get user session (has access to cookies)
    const supabase = await createClient();
    const body = await request.json();

    const { items, shipping, paymentMethod, subtotal, shippingFee, total } = body;

    // Get current user from session (for logged-in users)
    const { data: { user } } = await supabase.auth.getUser();

    const now = new Date().toISOString();
    const customerName = `${shipping.firstName} ${shipping.lastName}`;

    // Insert order using admin client (bypasses RLS for order creation)
    // Let database handle ID generation via default (ORD-XXXXXX format)
    const adminSupabase = await createAdminClient();
    const { data: newOrder, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user?.id || null, // Link order to authenticated user
        items: items, // Store full items as JSONB
        subtotal,
        delivery_fee: shippingFee,
        discount: 0,
        total,
        status: "pending",
        payment_method: paymentMethod,
        payment_status: "pending",
        shipping_address: shipping,
        customer_email: shipping.email,
        customer_name: customerName,
        customer_phone: shipping.phone,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Insert order items
    const orderItems = items.map((item: OrderItem) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      name: item.name,
      image_url: typeof item.image === "object" ? item.image.url : item.image,
      size: item.size,
      color: item.color,
      qty: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await adminSupabase.from("order_items").insert(orderItems);
    if (itemsError) {
      console.error("Error creating order items:", itemsError);
    }

    // Send admin email notification only for COD orders (online payments wait for payment confirmation)
    if (paymentMethod === "cod") {
      await sendAdminNewOrderEmail({
        orderId: newOrder.id,
        customerName,
        customerPhone: shipping.phone,
        customerEmail: shipping.email,
        total,
        items: items.map((item: OrderItem) => ({
          name: item.name,
          size: item.size,
          qty: item.quantity,
          price: item.price,
        })),
        shippingAddress: `${shipping.address}, ${shipping.city}, ${shipping.region}`,
        paymentMethod,
      });
    }

    // Transform response to match Order interface
    const responseOrder: Order = {
      id: newOrder.id,
      items,
      shipping,
      paymentMethod,
      subtotal,
      shippingFee,
      total,
      status: newOrder.status,
      paymentStatus: newOrder.payment_status || "pending",
      createdAt: newOrder.created_at,
      updatedAt: newOrder.updated_at,
    };

    return NextResponse.json(responseOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
