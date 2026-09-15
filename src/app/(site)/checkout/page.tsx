import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCartSummary } from "@/lib/cart";
import { getSiteSettings } from "@/lib/data/site";
import { getCurrentUser } from "@/lib/auth";
import { computeOrderTotals } from "@/lib/pricing";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [{ lines }, settings, user] = await Promise.all([getCartSummary(), getSiteSettings(), getCurrentUser()]);

  if (lines.length === 0) redirect("/cart");

  const totals = computeOrderTotals({
    lines: lines.map((l) => ({ price: l.product.price, quantity: l.quantity, gst_rate: settings.default_gst_rate })),
    settings,
  });

  return (
    <div className="container-app py-10">
      <h1 className="font-heading text-2xl font-bold text-brand-navy sm:text-3xl">Checkout</h1>
      <CheckoutForm
        lines={lines}
        totals={totals}
        defaultEmail={user?.email ?? ""}
        razorpayKeyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}
      />
    </div>
  );
}
