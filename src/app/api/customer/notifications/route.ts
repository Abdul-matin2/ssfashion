import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "notifications.json");

async function readNotifications(): Promise<any[]> {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function writeNotifications(notifications: any[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(notifications, null, 2), "utf-8");
}

// GET /api/customer/notifications?email=user@example.com
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const notifications = await readNotifications();
    const userNotifications = notifications
      .filter((n) => n.email && n.email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(userNotifications);
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
    const body = await request.json();

    if (!body.email || !body.title || !body.message) {
      return NextResponse.json(
        { error: "Email, title, and message are required" },
        { status: 400 }
      );
    }

    const notification = {
      id: `NTF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      email: body.email,
      title: body.title,
      message: body.message,
      type: body.type || "order",
      read: false,
      orderId: body.orderId || null,
      createdAt: new Date().toISOString(),
    };

    const notifications = await readNotifications();
    notifications.push(notification);
    await writeNotifications(notifications);

    return NextResponse.json(notification);
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
    const body = await request.json();
    const { id, email, markAll } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const notifications = await readNotifications();

    if (markAll) {
      // Mark all notifications for this email as read
      let updated = 0;
      notifications.forEach((n) => {
        if (n.email.toLowerCase() === email.toLowerCase() && !n.read) {
          n.read = true;
          updated++;
        }
      });
      await writeNotifications(notifications);
      return NextResponse.json({ success: true, updated });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const index = notifications.findIndex((n) => n.id === id && n.email && n.email.toLowerCase() === email.toLowerCase());

    if (index === -1) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    notifications[index].read = true;
    await writeNotifications(notifications);

    return NextResponse.json(notifications[index]);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
