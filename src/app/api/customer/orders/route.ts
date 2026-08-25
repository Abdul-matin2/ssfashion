import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { Order } from "@/types/product";

const DATA_FILE = path.join(process.cwd(), "src", "data", "orders.json");

async function readOrders(): Promise<Order[]> {
  const data = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

// GET /api/customer/orders — Get orders for a customer (by email)
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

    const orders = await readOrders();

    // Filter orders by customer email
    const customerOrders = orders.filter((o) =>
      o.shipping.email.toLowerCase() === email.toLowerCase()
    );

    // Sort by createdAt (newest first)
    customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Transform to simpler format for customer view
    const formattedOrders = customerOrders.map((order) => ({
      id: order.id,
      date: new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      status: order.status,
      total: order.total,
      items: order.items.length,
      itemsDetail: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        image: item.image,
      })),
      shipping: {
        address: order.shipping.address,
        city: order.shipping.city,
        region: order.shipping.region,
      },
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      createdAt: order.createdAt,
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