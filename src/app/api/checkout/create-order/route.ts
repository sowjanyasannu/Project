import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getCartSummary } from "@/lib/cart";
import { getSiteSettings } from "@/lib/data/site";
import { computeCouponDiscount, computeOrderTotals } from "@/lib/pricing";
import { checkoutSchema } from "@/lib/validations/checkout";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";
import { sendEmail, adminNewOrderEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const input = parsed.data;

  const { lines } = await getCartSummary();
  if (lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();

  // Re-fetch authoritative price/stock/GST straight from the DB — the cart
  // summary is for display only; the charge is computed from this data.
  const variantIds = lines.map((l) => l.variant.id);
  const { data: freshVariants } = await admin
    .from("product_variants")
    .select("id, product_id, colour, size, stock_available, price_override, is_active")
    .in("id", variantIds);

  const productIds = [...new Set(lines.map((l) => l.product.id))];
  const { data: freshProducts } = await admin
    .from("products")
    .select("id, name, sku, price, gst_rate, is_active")
    .in("id", productIds);

  const productById = new Map((freshProducts ?? []).map((p) => [p.id, p]));
  const variantById = new Map((freshVariants ?? []).map((v) => [v.id, v]));

  let orderLinesValidated;
  try {
    orderLinesValidated = lines.map((line) => {
      const product = productById.get(line.product.id);
      const variant = variantById.get(line.variant.id);
      if (!product || !product.is_active || !variant || !variant.is_active) {
        throw new Error(`${line.product.name} is no longer available.`);
      }
      if (variant.stock_available < line.quantity) {
        throw new Error(`Only ${variant.stock_available} left for ${product.name} (${variant.colour}, ${variant.size}).`);
      }
      const unitPrice = variant.price_override ?? product.price;
      return {
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        sku: product.sku,
        colour: variant.colour,
        size: variant.size,
        unit_price: unitPrice,
        quantity: line.quantity,
        line_total: Math.round(unitPrice * line.quantity * 100) / 100,
        gst_rate: product.gst_rate,
      };
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  const settings = await getSiteSettings();

  let discountAmount = 0;
  let couponCode: string | null = null;
  let couponId: string | null = null;
  let couponUsedCount = 0;
  if (input.coupon_code) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("*")
      .eq("code", input.coupon_code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    const subtotal = orderLinesValidated.reduce((s, l) => s + l.line_total, 0);
    const now = new Date();
    const valid =
      coupon &&
      (!coupon.valid_until || new Date(coupon.valid_until) >= now) &&
      new Date(coupon.valid_from) <= now &&
      (coupon.usage_limit == null || coupon.used_count < coupon.usage_limit);

    if (valid && coupon) {
      discountAmount = computeCouponDiscount({ subtotal, coupon });
      couponCode = coupon.code;
      couponId = coupon.id;
      couponUsedCount = coupon.used_count;
    }
  }

  const totals = computeOrderTotals({
    lines: orderLinesValidated.map((l) => ({ price: l.unit_price, quantity: l.quantity, gst_rate: l.gst_rate })),
    settings,
    discountAmount,
  });

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const shippingAddress = input.shipping_address;
  const billingAddress = input.billing_same_as_shipping
    ? shippingAddress
    : input.billing_address ?? shippingAddress;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      status: "order_placed",
      payment_status: "pending",
      subtotal: totals.subtotal,
      discount_amount: totals.discountAmount,
      gst_amount: totals.gstAmount,
      shipping_fee: totals.shippingFee,
      total: totals.total,
      coupon_code: couponCode,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      customer_notes: input.customer_notes ?? null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });
  }

  await admin.from("order_items").insert(
    orderLinesValidated.map((l) => ({
      order_id: order.id,
      product_id: l.product_id,
      variant_id: l.variant_id,
      product_name: l.product_name,
      sku: l.sku,
      colour: l.colour,
      size: l.size,
      unit_price: l.unit_price,
      quantity: l.quantity,
      line_total: l.line_total,
    }))
  );

  if (couponId) {
    await admin.from("coupons").update({ used_count: couponUsedCount + 1 }).eq("id", couponId);
  }

  await sendEmail({
    to: process.env.ADMIN_NOTIFICATION_EMAIL || settings.email || "",
    subject: `New Order ${order.order_number}`,
    html: adminNewOrderEmail({ orderNumber: order.order_number, total: totals.total }),
    template: "admin_new_order",
    referenceType: "order",
    referenceId: order.id,
  });

  if (!isRazorpayConfigured()) {
    await admin.from("payments").insert({
      order_id: order.id,
      provider: "razorpay",
      amount: totals.total,
      status: "pending",
    });
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      total: totals.total,
      razorpay: null,
    });
  }

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totals.total * 100),
    currency: "INR",
    receipt: order.order_number,
    notes: { order_id: order.id },
  });

  await admin.from("payments").insert({
    order_id: order.id,
    provider: "razorpay",
    provider_order_id: razorpayOrder.id,
    amount: totals.total,
    status: "pending",
  });

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.order_number,
    total: totals.total,
    razorpay: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    },
  });
}
