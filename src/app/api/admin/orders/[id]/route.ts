import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendCustomerStatusEmail } from "@/lib/email";
import { Order, OrderItem, ShippingAddress } from "@/types/product";
import type { PaymentStatus } from "@/types/product";

// GET /api/admin/orders/[id] — Get single order
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient();
    const { id } = await params;

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          name,
          image_url,
          size,
          color,
          qty,
          price
        )
      `)
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Transform to match Order interface
    const transformedOrder: Order = {
      id: order.id,
      items: (order.order_items || []).map((item: any) => ({
        productId: item.product_id || "",
        name: item.name,
        brand: "",
        image: item.image_url || "",
        price: item.price,
        quantity: item.qty,
        size: item.size,
        color: item.color,
        colorHex: undefined,
      })),
      shipping: {
        email: order.customer_email || "",
        firstName: order.customer_name?.split(" ")[0] || "",
        lastName: order.customer_name?.split(" ").slice(1).join(" ") || "",
        phone: order.customer_phone || "",
        address: order.shipping_address?.address || "",
        city: order.shipping_address?.city || "",
        region: order.shipping_address?.region || "",
        notes: "",
      },
      paymentMethod: order.payment_method,
      subtotal: order.subtotal,
      shippingFee: order.delivery_fee,
      total: order.total,
      status: order.status,
      paymentStatus: order.payment_status || "pending",
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };

    return NextResponse.json(transformedOrder);
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
    const supabase = await createAdminClient();
    const { id } = await params;
    const body = await request.json();

    // Only allow updating status
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const newStatus = body.status;

    // Get current order for notifications
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("status, customer_name, customer_email, customer_phone, shipping_address")
      .eq("id", id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const oldStatus = currentOrder.status;

    // Only proceed if status actually changed
    if (oldStatus === newStatus) {
      return NextResponse.json({ ...currentOrder, status: newStatus });
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        tracking_number: body.trackingNumber,
        estimated_delivery: body.estimatedDelivery,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating order:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    // Send customer email notification
    await sendCustomerStatusEmail({
      orderId: updatedOrder.id,
      customerName: currentOrder.customer_name || "",
      customerEmail: currentOrder.customer_email || "",
      newStatus,
      trackingNumber: body.trackingNumber,
      estimatedDelivery: body.estimatedDelivery,
    });

    // Create customer notification in database
    const statusNotifications: Record<string, { title: string; message: string }> = {
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

    const notificationData = statusNotifications[newStatus];
    if (notificationData) {
      await supabase.from("notifications").insert({
        type: "order_status",
        order_id: updatedOrder.id,
        user_id: updatedOrder.user_id,
        title: notificationData.title,
        message: notificationData.message,
        is_read: false,
      });
    }

    // Transform response
    const responseOrder: Order = {
      id: updatedOrder.id,
      items: [],
      shipping: currentOrder.shipping_address || {},
      paymentMethod: updatedOrder.payment_method,
      subtotal: updatedOrder.subtotal,
      shippingFee: updatedOrder.delivery_fee,
      total: updatedOrder.total,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.payment_status || "pending",
      createdAt: updatedOrder.created_at,
      updatedAt: updatedOrder.updated_at,
    };

    return NextResponse.json(responseOrder);
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
    const supabase = await createAdminClient();
    const { id } = await params;
    const body = await request.json();

    // Only allow updating paymentStatus
    const allowedPaymentStatuses: PaymentStatus[] = ["pending", "paid", "failed", "cancelled"];
    const newPaymentStatus = body.paymentStatus as PaymentStatus;

    if (!newPaymentStatus || !allowedPaymentStatuses.includes(newPaymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("payment_status, status, customer_name, customer_email, shipping_address")
      .eq("id", id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const oldPaymentStatus = currentOrder.payment_status;

    // Only proceed if payment status actually changed
    if (oldPaymentStatus === newPaymentStatus) {
      return NextResponse.json({ ...currentOrder, payment_status: newPaymentStatus });
    }

    // Also update order status based on payment status
    let newOrderStatus = currentOrder.status;
    if (newPaymentStatus === "paid") {
      newOrderStatus = "processing";
    } else if (newPaymentStatus === "failed" || newPaymentStatus === "cancelled") {
      newOrderStatus = "cancelled";
    }

    // Build update object - include paymentReference if provided
    const updateData: any = {
      payment_status: newPaymentStatus,
      status: newOrderStatus,
      updated_at: new Date().toISOString(),
    };
    if (body.paymentReference) {
      updateData.payment_reference = body.paymentReference;
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating payment status:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }

    // Send customer email notification if status changed
    if (newOrderStatus !== currentOrder.status) {
      await sendCustomerStatusEmail({
        orderId: updatedOrder.id,
        customerName: currentOrder.customer_name || "",
        customerEmail: currentOrder.customer_email || "",
        newStatus: newOrderStatus,
      });

      // Create customer notification in database
      const statusNotifications: Record<string, { title: string; message: string }> = {
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

      const notificationData = statusNotifications[newOrderStatus];
      if (notificationData) {
        await supabase.from("notifications").insert({
          type: "order_status",
          order_id: updatedOrder.id,
          user_id: updatedOrder.user_id,
          title: notificationData.title,
          message: notificationData.message,
          is_read: false,
        });
      }
    }

    // Transform response
    const responseOrder: Order = {
      id: updatedOrder.id,
      items: [],
      shipping: currentOrder.shipping_address || {},
      paymentMethod: updatedOrder.payment_method,
      subtotal: updatedOrder.subtotal,
      shippingFee: updatedOrder.delivery_fee,
      total: updatedOrder.total,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.payment_status,
      createdAt: updatedOrder.created_at,
      updatedAt: updatedOrder.updated_at,
    };

    return NextResponse.json(responseOrder);
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
    const supabase = await createAdminClient();
    const { id } = await params;

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting order:", error);
      return NextResponse.json(
        { error: "Failed to delete order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}