import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { sendAdminNewOrderEmail } from "@/lib/email";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
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
      const channel = transaction.channel;

      console.log(`Payment successful for order ${orderId} via ${channel}`);

      // Update order status
      const { data: currentOrder, error: fetchError } = await supabase
        .from("orders")
        .select("payment_status, customer_name, customer_email, customer_phone, shipping_address, payment_method, subtotal, delivery_fee, total")
        .eq("id", orderId)
        .single();

      if (fetchError || !currentOrder) {
        console.error(`Order ${orderId} not found`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Only update if not already paid
      if (currentOrder.payment_status !== "paid") {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "processing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (updateError) {
          console.error("Error updating order:", updateError);
        }

        // Send admin email notification now that payment is confirmed
        await sendAdminNewOrderEmail({
          orderId,
          customerName: currentOrder.customer_name || "",
          customerPhone: currentOrder.customer_phone || "",
          customerEmail: currentOrder.customer_email || "",
          total: currentOrder.total,
          items: [], // We don't have items here easily; could fetch but keeping simple
          shippingAddress: currentOrder.shipping_address
            ? `${currentOrder.shipping_address.address}, ${currentOrder.shipping_address.city}, ${currentOrder.shipping_address.region}`
            : "",
          paymentMethod: currentOrder.payment_method || "online",
        });
      }

      return NextResponse.json({ success: true });
    }

    // Handle charge.failed event
    if (event.event === "charge.failed") {
      const transaction = event.data;
      const orderId = transaction.reference;
      const gatewayResponse = transaction.gateway_response;

      console.log(`Payment failed for order ${orderId}: ${gatewayResponse}`);

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
      }

      return NextResponse.json({ success: true });
    }

    // Handle abandoned event (user cancelled payment)
    if (event.event === "charge.abandoned" || event.event === "cancelled") {
      const transaction = event.data;
      const orderId = transaction.reference;

      console.log(`Payment abandoned/cancelled for order ${orderId}`);

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "cancelled",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}