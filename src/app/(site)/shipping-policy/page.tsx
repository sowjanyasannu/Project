import { getSiteSettings } from "@/lib/data/site";

export const metadata = { title: "Shipping Policy" };

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-app max-w-3xl py-14 text-sm leading-relaxed text-foreground/90">
      <h1 className="font-heading text-3xl font-bold text-brand-navy">Shipping Policy</h1>
      <div className="mt-6 space-y-4">
        <p>Standard orders are typically dispatched within 5–8 business days and delivered across India through our courier partners.</p>
        <p>
          Shipping fee: {settings.flat_shipping_fee > 0 ? `₹${settings.flat_shipping_fee}` : "Free"}
          {settings.free_shipping_threshold != null &&
            ` — free above ₹${settings.free_shipping_threshold.toLocaleString("en-IN")}`}
          .
        </p>
        <p>Custom and bulk orders follow the delivery timeline confirmed in your quotation, based on production volume and customization complexity.</p>
      </div>
    </div>
  );
}
