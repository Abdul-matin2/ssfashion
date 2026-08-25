import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/notifications — Get all admin notifications (type=new_order)
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createAdminClient();

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("type", "new_order")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reading admin notifications:", error);
      return NextResponse.json(
        { error: "Failed to read notifications" },
        { status: 500 }
      );
    }

    // Transform to match expected format
    const transformed = (notifications || []).map((n: any) => ({
      id: n.id,
      orderId: n.order_id,
      orderNumber: n.order_id,
      customerName: n.title?.replace("New Order ", "") || "",
      customerPhone: "",
      total: 0,
      items: [],
      shippingAddress: "",
      paymentMethod: "",
      createdAt: n.created_at,
      read: n.is_read,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error reading admin notifications:", error);
    return NextResponse.json(
      { error: "Failed to read notifications" },
      { status: 500 }
    );
  }
}

// POST /api/admin/notifications — Create a new admin notification (used by order creation)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await request.json();

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        type: "new_order",
        order_id: body.orderId,
        user_id: null, // admin notification
        title: `New Order ${body.orderId}`,
        message: `${body.customerName} placed an order of GHS ${(body.total / 100).toFixed(2)}`,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating admin notification:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: notification.id,
      orderId: notification.order_id,
      orderNumber: notification.order_id,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      total: body.total,
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      createdAt: notification.created_at,
      read: notification.is_read,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/notifications — Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("type", "new_order")
        .eq("is_read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return NextResponse.json(
          { error: "Failed to update notifications" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, updated: 0 }); // count not easily available
    }

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error marking notification as read:", error);
      return NextResponse.json(
        { error: "Failed to update notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: notification.id,
      orderId: notification.order_id,
      orderNumber: notification.order_id,
      customerName: notification.title?.replace("New Order ", "") || "",
      customerPhone: "",
      total: 0,
      items: [],
      shippingAddress: "",
      paymentMethod: "",
      createdAt: notification.created_at,
      read: notification.is_read,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}