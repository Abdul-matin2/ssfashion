import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack verify error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to verify payment" },
        { status: response.status || 500 }
      );
    }

    const transaction = data.data;

    // Transaction successful
    if (transaction.status === "success") {
      return NextResponse.json({
        success: true,
        reference: transaction.reference,
        amount: transaction.amount, // in pesewas
        currency: transaction.currency,
        paidAt: transaction.paid_at,
        channel: transaction.channel,
        metadata: transaction.metadata,
        customer: transaction.customer,
      });
    }

    // Transaction failed/pending
    return NextResponse.json({
      success: false,
      reference: transaction.reference,
      status: transaction.status,
      gatewayResponse: transaction.gateway_response,
    });
  } catch (error) {
    console.error("Paystack verify exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}