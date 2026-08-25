import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Order } from "@/types/product";
import type { PaymentStatus } from "@/types/product";
import { sendCustomerStatusEmail } from "@/lib/email";

const DATA_FILE = path.join(process.cwd(), "src", "data", "orders.json");
const NOTIFICATIONS_FILE = path.join(process.cwd(), "src", "data", "notifications.json");

async function readOrders(): Promise<Order[]> {
  const data = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

async function writeOrders(orders: Order[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf-8");
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

function createCustomerNotification(order: Order, newStatus: string) {
  const statusLabels: Record<string, { title: string; message: string }> = {
    processing: {
      title: "Order is being processed",
      message: "Your order is now being prepared for shipment.",
    },
    shipped: {
      title: "Order shipped!",
      message: "Your order has been shipped and is on its way to you.",
    },
    delivered: {
      title: "Order delivered",
      message: "Your order has been delivered. Enjoy your purchase!",
    },
    cancelled: {
      title: "Order cancelled",
      message: "Your order has been cancelled. Contact support for details.",
    },
  };

  const statusInfo = statusLabels[newStatus] || { title: "Order updated", message: `Your order status has been updated to ${newStatus}.` };

  return {
    id: `NTF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    email: order.shipping.email,
    title: statusInfo.title,
    message: statusInfo.message,
    type: "order",
    read: false,
    orderId: order.id,
    createdAt: new Date().toISOString(),
  };
}

// GET /api/admin/orders/[id] — Get single order
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orders = await readOrders();
    const order = orders.find((o) => o.id === id);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error reading order:", error);
    return NextResponse.json(
      { error: "Failed to read order" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders/[id] — Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const orders = await readOrders();
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow updating status
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const oldStatus = orders[index].status;
    const newStatus = body.status || orders[index].status;

    // Only proceed if status actually changed
    if (oldStatus === newStatus) {
      return NextResponse.json(orders[index]);
    }

    orders[index] = {
      ...orders[index],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    await writeOrders(orders);

    // Create customer notification for status change
    const customerNotification = createCustomerNotification(orders[index], newStatus);
    const notifications = await readNotifications();
    notifications.push(customerNotification);
    await writeNotifications(notifications);

    // Send customer email notification
    await sendCustomerStatusEmail({
      orderId: orders[index].id,
      customerName: `${orders[index].shipping.firstName} ${orders[index].shipping.lastName}`,
      customerEmail: orders[index].shipping.email,
      newStatus,
      trackingNumber: body.trackingNumber,
      estimatedDelivery: body.estimatedDelivery,
    });

    return NextResponse.json(orders[index]);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders/[id] — Update payment status (for Paystack callback)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const orders = await readOrders();
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow updating paymentStatus
    const allowedPaymentStatuses: PaymentStatus[] = ["pending", "paid", "failed", "cancelled"];
    const newPaymentStatus = body.paymentStatus as PaymentStatus;

    if (!newPaymentStatus || !allowedPaymentStatuses.includes(newPaymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    const oldPaymentStatus = orders[index].paymentStatus;

    // Only proceed if payment status actually changed
    if (oldPaymentStatus === newPaymentStatus) {
      return NextResponse.json(orders[index]);
    }

    // Also update order status based on payment status
    let newOrderStatus = orders[index].status;
    if (newPaymentStatus === "paid") {
      newOrderStatus = "processing";
    } else if (newPaymentStatus === "failed" || newPaymentStatus === "cancelled") {
      newOrderStatus = "cancelled";
    }

    orders[index] = {
      ...orders[index],
      paymentStatus: newPaymentStatus,
      status: newOrderStatus,
      updatedAt: new Date().toISOString(),
    };

    await writeOrders(orders);

    // Create customer notification for status change
    const customerNotification = createCustomerNotification(orders[index], newOrderStatus);
    const notifications = await readNotifications();
    notifications.push(customerNotification);
    await writeNotifications(notifications);

    // Send customer email notification
    await sendCustomerStatusEmail({
      orderId: orders[index].id,
      customerName: `${orders[index].shipping.firstName} ${orders[index].shipping.lastName}`,
      customerEmail: orders[index].shipping.email,
      newStatus: newOrderStatus,
    });

    return NextResponse.json(orders[index]);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders/[id] — Delete order
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orders = await readOrders();
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const deleted = orders.splice(index, 1)[0];
    await writeOrders(orders);

    return NextResponse.json({ success: true, order: deleted });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
