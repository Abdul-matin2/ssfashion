import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/customer/notifications?email=user@example.com
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

    // First get the user's ID from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json([]);
    }

    // Get notifications for this user
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reading notifications:", error);
      return NextResponse.json(
        { error: "Failed to read notifications" },
        { status: 500 }
      );
    }

    // Transform to match expected format
    const transformed = (notifications || []).map((n: any) => ({
      id: n.id,
      email,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.is_read,
      orderId: n.order_id,
      createdAt: n.created_at,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error reading notifications:", error);
    return NextResponse.json(
      { error: "Failed to read notifications" },
      { status: 500 }
    );
  }
}

// POST /api/customer/notifications — Create a notification (used by admin order status changes)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    if (!body.email || !body.title || !body.message) {
      return NextResponse.json(
        { error: "Email, title, and message are required" },
        { status: 400 }
      );
    }

    // Get user ID from email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", body.email)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        type: body.type || "order_status",
        order_id: body.orderId || null,
        user_id: profile.id,
        title: body.title,
        message: body.message,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: notification.id,
      email: body.email,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.is_read,
      orderId: notification.order_id,
      createdAt: notification.created_at,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PATCH /api/customer/notifications — Mark notification(s) as read
// Supports single: { id, email } or bulk: { email, markAll: true }
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, email, markAll } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Get user ID from email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (markAll) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", profile.id)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return NextResponse.json(
          { error: "Failed to update notifications" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, updated: 0 });
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
      .eq("user_id", profile.id)
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
      email,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.is_read,
      orderId: notification.order_id,
      createdAt: notification.created_at,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}