import { NextRequest, NextResponse } from "next/server";
import { sendAdminNewOrderEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      total,
      items,
      shippingAddress,
      paymentMethod,
    } = body;

    console.log("[send-order-email] Request received:", { orderId, customerName, hasItems: !!items, paymentMethod });

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    const result = await sendAdminNewOrderEmail({
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      total,
      items,
      shippingAddress,
      paymentMethod,
    });

    console.log("[send-order-email] Email result:", result);

    return NextResponse.json({ success: true, emailSent: result });
  } catch (error) {
    console.error("[send-order-email] Error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}