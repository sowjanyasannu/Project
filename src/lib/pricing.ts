import type { SiteSettings } from "@/types/database";

export interface PricedLine {
  price: number;
  quantity: number;
  gst_rate: number;
}

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  shippingFee: number;
  total: number;
}

/**
 * The single source of truth for order totals — spec §20/§43: "Never trust
 * price/discount/total values sent from the browser. Calculate final order
 * totals server-side." Both the cart page (for display) and the checkout
 * API (for the authoritative charge) call this with server-fetched prices.
 */
export function computeOrderTotals(params: {
  lines: PricedLine[];
  settings: Pick<SiteSettings, "flat_shipping_fee" | "free_shipping_threshold">;
  discountAmount?: number;
}): OrderTotals {
  const subtotal = round2(params.lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const discountAmount = round2(Math.min(params.discountAmount ?? 0, subtotal));
  const taxableBase = subtotal - discountAmount;

  const gstAmount = round2(
    params.lines.reduce((sum, l) => {
      const lineTotal = l.price * l.quantity;
      const lineShare = subtotal > 0 ? lineTotal / subtotal : 0;
      const lineTaxable = taxableBase * lineShare;
      return sum + lineTaxable * (l.gst_rate / 100);
    }, 0)
  );

  const freeShippingThreshold = params.settings.free_shipping_threshold;
  const shippingFee =
    freeShippingThreshold != null && taxableBase >= freeShippingThreshold
      ? 0
      : round2(params.settings.flat_shipping_fee);

  const total = round2(taxableBase + gstAmount + shippingFee);

  return { subtotal, discountAmount, gstAmount, shippingFee, total };
}

export function computeCouponDiscount(params: {
  subtotal: number;
  coupon: { type: "percentage" | "fixed"; value: number; max_discount: number | null; min_order_value: number } | null;
}): number {
  const { subtotal, coupon } = params;
  if (!coupon || subtotal < coupon.min_order_value) return 0;

  let discount = coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.max_discount != null) discount = Math.min(discount, coupon.max_discount);
  return round2(Math.min(discount, subtotal));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
