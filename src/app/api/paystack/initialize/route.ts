import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface InitializeRequest {
  email: string;
  amount: number; // in pesewas (minor units)
  orderId: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
  channels?: string[]; // ["mobile_money", "card", "bank", "ussd", "qr", "bank_transfer"]
}

export async function POST(request: NextRequest) {
  try {
    const body: InitializeRequest = await request.json();
    const { email, amount, orderId, callbackUrl, metadata, channels } = body;

    if (!email || !amount || !orderId || !callbackUrl) {
      return NextResponse.json(
        { error: "Missing required fields: email, amount, orderId, callbackUrl" },
        { status: 400 }
      );
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        reference: orderId,
        callback_url: callbackUrl,
        metadata: {
          orderId,
          ...metadata,
        },
        channels: channels || ["mobile_money", "card", "bank", "ussd", "qr"],
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack initialize error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to initialize payment" },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Paystack initialize exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}