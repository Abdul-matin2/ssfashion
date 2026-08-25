import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { Order, OrderStatus, PaymentStatus } from "@/types/product";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const DATA_FILE = path.join(process.cwd(), "src", "data", "orders.json");
const NOTIFICATIONS_FILE = path.join(process.cwd(), "src", "data", "notifications.json");

async function readOrders(): Promise<Order[]> {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
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

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature || !verifyPaystackSignature(payload, signature)) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);

    // Handle charge.success event
    if (event.event === "charge.success") {
      const transaction = event.data;
      const orderId = transaction.reference;
      const amount = transaction.amount; // in pesewas
      const channel = transaction.channel;
      const paidAt = transaction.paid_at;

      console.log(`Payment successful for order ${orderId} via ${channel}`);

      // Update order status
      const orders = await readOrders();
      const orderIndex = orders.findIndex((o) => o.id === orderId);

      if (orderIndex === -1) {
        console.error(`Order ${orderId} not found`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Only update if not already paid
      if (orders[orderIndex].paymentStatus !== "paid") {
        orders[orderIndex].paymentStatus = "paid";
        orders[orderIndex].status = "processing";
        orders[orderIndex].updatedAt = new Date().toISOString();
        await writeOrders(orders);

        // Create admin notification
        const adminNotification = createAdminNotification(orders[orderIndex]);
        const notifications = await readNotifications();
        notifications.unshift(adminNotification);
        await writeNotifications(notifications);
      }

      return NextResponse.json({ success: true });
    }

    // Handle charge.failed event
    if (event.event === "charge.failed") {
      const transaction = event.data;
      const orderId = transaction.reference;
      const gatewayResponse = transaction.gateway_response;

      console.log(`Payment failed for order ${orderId}: ${gatewayResponse}`);

      const orders = await readOrders();
      const orderIndex = orders.findIndex((o) => o.id === orderId);

      if (orderIndex !== -1 && orders[orderIndex].paymentStatus !== "paid") {
        orders[orderIndex].paymentStatus = "failed";
        orders[orderIndex].status = "cancelled";
        orders[orderIndex].updatedAt = new Date().toISOString();
        await writeOrders(orders);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}