import "server-only";
import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Marks an order as paid, moves it to payment_confirmed, and — only now,
 * on confirmed payment — decrements inventory (spec §28: "Do NOT reduce
 * inventory for failed payments"). Idempotent: safe to call from both the
 * client-side verify route and the Razorpay webhook without double-counting
 * stock, since callers check order.payment_status !== "paid" first and the
 * update below is a no-op if already applied.
 */
export async function markOrderPaid(params: {
  orderId: string;
  providerPaymentId: string;
  providerSignature?: string;
}) {
  const admin = createAdminSupabaseClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, payment_status, user_id, customer_email")
    .eq("id", params.orderId)
    .single();
  if (!order || order.payment_status === "paid") return;

  await admin
    .from("payments")
    .update({
      status: "paid",
      provider_payment_id: params.providerPaymentId,
      provider_signature: params.providerSignature ?? null,
    })
    .eq("order_id", params.orderId);

  await admin
    .from("orders")
    .update({ payment_status: "paid", status: "payment_confirmed" })
    .eq("id", params.orderId);

  const { data: items } = await admin
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", params.orderId);

  for (const item of items ?? []) {
    if (!item.variant_id) continue;
    const { data: variant } = await admin
      .from("product_variants")
      .select("stock_available, stock_sold")
      .eq("id", item.variant_id)
      .single();
    if (!variant) continue;

    await admin
      .from("product_variants")
      .update({
        stock_available: Math.max(0, variant.stock_available - item.quantity),
        stock_sold: variant.stock_sold + item.quantity,
      })
      .eq("id", item.variant_id);

    await admin.from("inventory_transactions").insert({
      variant_id: item.variant_id,
      change_qty: -item.quantity,
      reason: "order_paid",
      reference_type: "order",
      reference_id: params.orderId,
    });
  }

  // Clear whichever cart this order came from so the customer doesn't see
  // already-purchased items sitting in their cart.
  if (order.user_id) {
    const { data: cart } = await admin.from("carts").select("id").eq("user_id", order.user_id).maybeSingle();
    if (cart) await admin.from("cart_items").delete().eq("cart_id", cart.id);
  } else {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("jobert_cart_token")?.value;
      if (token) {
        const { data: cart } = await admin.from("carts").select("id").eq("session_token", token).maybeSingle();
        if (cart) await admin.from("cart_items").delete().eq("cart_id", cart.id);
      }
    } catch {
      // No request-scoped cookies available (e.g. called from a webhook) — skip.
    }
  }

  await admin.from("notifications").insert({
    recipient_type: "admin",
    title: "New paid order",
    message: `Order payment confirmed.`,
    link: `/admin/orders/${params.orderId}`,
  });
}

export async function markOrderPaymentFailed(orderId: string, providerPaymentId?: string) {
  const admin = createAdminSupabaseClient();
  await admin
    .from("payments")
    .update({ status: "failed", provider_payment_id: providerPaymentId ?? null })
    .eq("order_id", orderId);
}
