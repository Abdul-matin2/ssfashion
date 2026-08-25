import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const NOTIFICATIONS_FILE = path.join(process.cwd(), "src", "data", "notifications.json");

async function readNotifications(): Promise<any[]> {
  try {
    const data = await readFile(NOTIFICATIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeNotifications(notifications: any[]): Promise<void> {
  await writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
}

// GET /api/admin/notifications — Get all admin notifications
export async function GET(_request: NextRequest) {
  try {
    const notifications = await readNotifications();
    // Sort by createdAt (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(notifications);
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
    const body = await request.json();

    const notification = {
      id: `NTF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      orderId: body.orderId,
      orderNumber: body.orderId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      total: body.total,
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      createdAt: body.createdAt || new Date().toISOString(),
      read: false,
    };

    const notifications = await readNotifications();
    notifications.unshift(notification);
    await writeNotifications(notifications);

    return NextResponse.json(notification, { status: 201 });
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
    const body = await request.json();
    const { id, markAll } = body;

    const notifications = await readNotifications();

    if (markAll) {
      let updated = 0;
      notifications.forEach((n) => {
        if (!n.read) {
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

    const index = notifications.findIndex((n) => n.id === id);

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