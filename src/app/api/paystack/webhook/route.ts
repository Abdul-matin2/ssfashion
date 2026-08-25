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
      const reference = transaction.reference;
      const channel = transaction.channel;
      const metadata = transaction.metadata || {};

      console.log(`Payment successful for reference ${reference} via ${channel}`);

      // Check if this is a temp reference (CHK-...) meaning order needs to be created
      if (reference.startsWith("CHK-") && metadata.items) {
        // CREATE ORDER NOW that payment is confirmed
        const now = new Date().toISOString();
        const customerName = metadata.shipping
          ? `${metadata.shipping.firstName} ${metadata.shipping.lastName}`
          : "";

        const { data: newOrder, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: metadata.userId || null,
            items: metadata.items,
            subtotal: metadata.subtotal,
            delivery_fee: metadata.shippingFee,
            discount: 0,
            total: metadata.total,
            status: "processing",
            payment_method: metadata.paymentMethod,
            payment_status: "paid",
            shipping_address: metadata.shipping,
            customer_email: metadata.shipping?.email,
            customer_name: customerName,
            customer_phone: metadata.shipping?.phone,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (orderError) {
          console.error("Error creating order after payment:", orderError);
          return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // Insert order items
        const orderItems = (metadata.items || []).map((item: any) => ({
          order_id: newOrder.id,
          product_id: item.productId,
          name: item.name,
          image_url: typeof item.image === "object" ? item.image.url : item.image,
          size: item.size,
          color: item.color,
          qty: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
        if (itemsError) {
          console.error("Error creating order items:", itemsError);
        }

        // Send admin email notification now that order is created and paid
        await sendAdminNewOrderEmail({
          orderId: newOrder.id,
          customerName,
          customerPhone: metadata.shipping?.phone || "",
          customerEmail: metadata.shipping?.email || "",
          total: metadata.total,
          items: metadata.items.map((item: any) => ({
            name: item.name,
            size: item.size,
            qty: item.quantity,
            price: item.price,
          })),
          shippingAddress: metadata.shipping
            ? `${metadata.shipping.address}, ${metadata.shipping.city}, ${metadata.shipping.region}`
            : "",
          paymentMethod: metadata.paymentMethod,
        });

        console.log(`Order ${newOrder.id} created and paid via webhook`);
      } else {
        // Existing order reference - just update payment status
        const { data: currentOrder, error: fetchError } = await supabase
          .from("orders")
          .select("payment_status")
          .eq("id", reference)
          .single();

        if (fetchError || !currentOrder) {
          console.error(`Order ${reference} not found`);
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (currentOrder.payment_status !== "paid") {
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "processing",
              updated_at: new Date().toISOString(),
            })
            .eq("id", reference);

          if (updateError) {
            console.error("Error updating order:", updateError);
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    // Handle charge.failed event - NO order exists for CHK- references, so nothing to do
    if (event.event === "charge.failed") {
      const transaction = event.data;
      const reference = transaction.reference;
      const gatewayResponse = transaction.gateway_response;

      console.log(`Payment failed for reference ${reference}: ${gatewayResponse}`);

      // If it's an existing order (not CHK-), update it
      if (!reference.startsWith("CHK-")) {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", reference);

        if (updateError) {
          console.error("Error updating order:", updateError);
        }
      }

      return NextResponse.json({ success: true });
    }

    // Handle abandoned event (user cancelled payment) - NO order exists for CHK- references
    if (event.event === "charge.abandoned" || event.event === "cancelled") {
      const transaction = event.data;
      const reference = transaction.reference;

      console.log(`Payment abandoned/cancelled for reference ${reference}`);

      // If it's an existing order (not CHK-), update it
      if (!reference.startsWith("CHK-")) {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "cancelled",
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", reference);

        if (updateError) {
          console.error("Error updating order:", updateError);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}