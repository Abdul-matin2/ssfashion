import { Resend } from "resend";
import { formatPrice } from "./currency";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@ssfashion.com";

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: number;
  items: { name: string; size: string; qty: number; price: number }[];
  shippingAddress: string;
  paymentMethod: string;
}

export async function sendAdminNewOrderEmail(data: OrderEmailData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured - skipping admin order email");
    return false;
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 16px; font-family: system-ui, sans-serif;">${item.name}</td>
        <td style="padding: 12px 16px; font-family: system-ui, sans-serif; text-align: center;">${item.size}</td>
        <td style="padding: 12px 16px; font-family: system-ui, sans-serif; text-align: center;">${item.qty}</td>
        <td style="padding: 12px 16px; font-family: system-ui, sans-serif; text-align: right;">${formatPrice(item.price)}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Card -->
          <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); overflow: hidden;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #fbbf24; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">S&S FASHION</h1>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">New Order Received</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
                  <strong>Order #${data.orderId}</strong> placed by <strong>${data.customerName}</strong>
                </p>
              </div>

              <!-- Order Details -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Size</th>
                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <div style="border-top: 2px solid #e5e7eb; padding-top: 16px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6b7280;">Subtotal</span>
                  <span style="font-weight: 600;">${formatPrice(data.total)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6b7280;">Shipping</span>
                  <span style="font-weight: 600;">Calculated at checkout</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                  <span style="font-size: 18px; font-weight: 700; color: #1a1a1a;">Total</span>
                  <span style="font-size: 18px; font-weight: 700; color: #1a1a1a;">${formatPrice(data.total)}</span>
                </div>
              </div>

              <!-- Customer Info -->
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Customer Information</h3>
                <div style="display: grid; gap: 8px; font-size: 14px;">
                  <div><strong style="color: #374151;">Name:</strong> ${data.customerName}</div>
                  <div><strong style="color: #374151;">Phone:</strong> ${data.customerPhone}</div>
                  <div><strong style="color: #374151;">Email:</strong> ${data.customerEmail}</div>
                  <div><strong style="color: #374151;">Address:</strong> ${data.shippingAddress}</div>
                  <div><strong style="color: #374151;">Payment:</strong> ${data.paymentMethod.toUpperCase()}</div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders/${data.orderId}"
                   style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  View Order in Dashboard
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated notification from S&S Fashion Admin System
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "S&S Fashion Orders <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `New Order #${data.orderId} — ${data.customerName} — ${formatPrice(data.total)}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send admin order email:", error);
    return false;
  }
}

interface CustomerStatusEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export async function sendCustomerStatusEmail(data: CustomerStatusEmailData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured - skipping customer status email");
    return false;
  }

  const statusLabels: Record<string, { label: string; color: string; message: string }> = {
    processing: { label: "Processing", color: "#3b82f6", message: "Your order is now being prepared for shipment." },
    shipped: { label: "Shipped", color: "#8b5cf6", message: "Your order has been shipped and is on its way to you." },
    delivered: { label: "Delivered", color: "#22c55e", message: "Your order has been delivered. Enjoy your purchase!" },
    cancelled: { label: "Cancelled", color: "#ef4444", message: "Your order has been cancelled. Contact support for details." },
  };

  const statusInfo = statusLabels[data.newStatus] || { label: data.newStatus, color: "#6b7280", message: "Your order status has been updated." };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); overflow: hidden;">

            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #fbbf24; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">S&S FASHION</h1>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">Order Status Update</p>
            </div>

            <div style="padding: 32px;">
              <div style="background: ${statusInfo.color}15; border: 1px solid ${statusInfo.color}; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: ${statusInfo.color}; text-transform: uppercase; letter-spacing: 1px;">Order #${data.orderId}</p>
                <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${statusInfo.color};">${statusInfo.label}</p>
              </div>

              <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">Hi ${data.customerName},</p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">${statusInfo.message}</p>

              ${data.trackingNumber ? `
                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
                  <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Tracking Number</p>
                  <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1a1a; font-family: monospace;">${data.trackingNumber}</p>
                </div>
              ` : ""}

              ${data.estimatedDelivery ? `
                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
                  <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Delivery</p>
                  <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${data.estimatedDelivery}</p>
                </div>
              ` : ""}

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/account?tab=orders"
                   style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  View Order Details
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Thank you for shopping with S&S Fashion!<br>
                If you have any questions, contact us at support@ssfashion.com
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "S&S Fashion <onboarding@resend.dev>",
      to: [data.customerEmail],
      subject: `Order #${data.orderId} — ${statusInfo.label} — S&S Fashion`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send customer status email:", error);
    return false;
  }
}