import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { markOrderPaid, markOrderPaymentFailed } from "@/lib/order-fulfillment";

/**
 * Backstop confirmation path: if the customer closes the browser right
 * after paying (before the client-side /api/checkout/verify call lands),
 * this webhook still confirms the order from Razorpay's server directly.
 * Configure it in Razorpay Dashboard → Settings → Webhooks, pointed at
 * <site>/api/webhooks/razorpay, events: payment.captured, payment.failed.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const admin = createAdminSupabaseClient();

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    if (razorpayOrderId) {
      const { data: paymentRow } = await admin
        .from("payments")
        .select("order_id")
        .eq("provider_order_id", razorpayOrderId)
        .maybeSingle();
      if (paymentRow) {
        await markOrderPaid({ orderId: paymentRow.order_id, providerPaymentId: payment.id });
      }
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    if (razorpayOrderId) {
      const { data: paymentRow } = await admin
        .from("payments")
        .select("order_id")
        .eq("provider_order_id", razorpayOrderId)
        .maybeSingle();
      if (paymentRow) await markOrderPaymentFailed(paymentRow.order_id, payment.id);
    }
  }

  return NextResponse.json({ received: true });
}
