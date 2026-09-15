import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";
import { markOrderPaid } from "@/lib/order-fulfillment";

const verifySchema = z.object({
  orderId: z.uuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  const admin = createAdminSupabaseClient();

  if (!valid) {
    await admin
      .from("payments")
      .update({ status: "failed", provider_payment_id: razorpay_payment_id })
      .eq("order_id", orderId)
      .eq("provider_order_id", razorpay_order_id);
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, customer_name, customer_email, payment_status")
    .eq("id", orderId)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  if (order.payment_status !== "paid") {
    await markOrderPaid({ orderId, providerPaymentId: razorpay_payment_id, providerSignature: razorpay_signature });

    const { data: items } = await admin
      .from("order_items")
      .select("product_name, size, colour, quantity")
      .eq("order_id", orderId);
    const { data: fullOrder } = await admin.from("orders").select("total").eq("id", orderId).single();

    await sendEmail({
      to: order.customer_email,
      subject: `Your order ${order.order_number} is confirmed`,
      html: orderConfirmationEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        total: fullOrder?.total ?? 0,
        items: (items ?? []).map((i) => ({ name: i.product_name, size: i.size, colour: i.colour, quantity: i.quantity })),
      }),
      template: "order_confirmation",
      referenceType: "order",
      referenceId: orderId,
    });
  }

  return NextResponse.json({ orderNumber: order.order_number });
}
