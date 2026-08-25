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

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    await sendAdminNewOrderEmail({
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      total,
      items,
      shippingAddress,
      paymentMethod,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending admin order email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}