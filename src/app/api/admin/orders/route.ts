import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Order } from "@/types/product";
import { sendAdminNewOrderEmail } from "@/lib/email";

const DATA_FILE = path.join(process.cwd(), "src", "data", "orders.json");
const NOTIFICATIONS_FILE = path.join(process.cwd(), "src", "data", "notifications.json");

async function readOrders(): Promise<Order[]> {
  const data = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

async function writeOrders(orders: Order[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(orders, null, 2));
}

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

function createAdminNotification(order: Order) {
  return {
    id: `NTF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    orderId: order.id,
    orderNumber: order.id,
    customerName: `${order.shipping.firstName} ${order.shipping.lastName}`,
    customerPhone: order.shipping.phone,
    total: order.total,
    items: order.items.map((item) => ({
      name: item.name,
      size: item.size,
      qty: item.quantity,
      price: item.price,
    })),
    shippingAddress: `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.region}`,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    read: false,
  };
}

// GET /api/admin/orders — List all orders
export async function GET(request: NextRequest) {
  try {
    const orders = await readOrders();
    const { searchParams } = new URL(request.url);

    // Filter by status
    const status = searchParams.get("status");
    let filtered = status ? orders.filter((o) => o.status === status) : orders;

    // Sort by createdAt (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(filtered);
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
    const body = await request.json();
    const orders = await readOrders();

    // Generate new order ID
    const existingIds = orders.map((o) => parseInt(o.id.replace("ORD-", ""))).filter((n) => !isNaN(n));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const orderId = `ORD-${nextId.toString().padStart(3, "0")}`;

    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      items: body.items,
      shipping: body.shipping,
      paymentMethod: body.paymentMethod,
      subtotal: body.subtotal,
      shippingFee: body.shippingFee,
      total: body.total,
      status: "pending",
      paymentStatus: "pending",
      createdAt: now,
      updatedAt: now,
    };

    orders.unshift(newOrder);
    await writeOrders(orders);

    // Create admin notification
    const adminNotification = createAdminNotification(newOrder);
    const notifications = await readNotifications();
    notifications.unshift(adminNotification);
    await writeNotifications(notifications);

    // Send admin email notification
    await sendAdminNewOrderEmail({
      orderId: newOrder.id,
      customerName: `${newOrder.shipping.firstName} ${newOrder.shipping.lastName}`,
      customerPhone: newOrder.shipping.phone,
      customerEmail: newOrder.shipping.email,
      total: newOrder.total,
      items: newOrder.items.map((item) => ({
        name: item.name,
        size: item.size,
        qty: item.quantity,
        price: item.price,
      })),
      shippingAddress: `${newOrder.shipping.address}, ${newOrder.shipping.city}, ${newOrder.shipping.region}`,
      paymentMethod: newOrder.paymentMethod,
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
