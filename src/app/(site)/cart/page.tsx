import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { getCartSummary } from "@/lib/cart";
import { getSiteSettings } from "@/lib/data/site";
import { computeOrderTotals } from "@/lib/pricing";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Your Cart" };

export default async function CartPage() {
  const [{ lines }, settings] = await Promise.all([getCartSummary(), getSiteSettings()]);

  if (lines.length === 0) {
    return (
      <div className="container-app flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold text-brand-navy">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Browse our uniforms and sportswear collection to find what you need.
        </p>
        <Button render={<Link href="/shop" />}>Continue Shopping</Button>
      </div>
    );
  }

  const totals = computeOrderTotals({
    lines: lines.map((l) => ({ price: l.product.price, quantity: l.quantity, gst_rate: settings.default_gst_rate })),
    settings,
  });

  return (
    <div className="container-app py-10">
      <h1 className="font-heading text-2xl font-bold text-brand-navy sm:text-3xl">Your Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border p-4 sm:p-6">
          {lines.map((line) => (
            <CartLineItem key={line.id} line={line} />
          ))}
        </div>

        <div className="h-fit rounded-xl border p-6">
          <p className="font-heading text-lg font-semibold text-brand-navy">Order Summary</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatINR(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">GST (est.)</dt><dd>{formatINR(totals.gstAmount)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{totals.shippingFee === 0 ? "Free" : formatINR(totals.shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold text-brand-navy">
              <dt>Estimated Total</dt><dd>{formatINR(totals.total)}</dd>
            </div>
          </dl>
          <Button size="lg" className="mt-6 w-full" render={<Link href="/checkout" />}>
            Proceed to Checkout
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Taxes and shipping are recalculated securely at checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
