import { TrackOrderForm } from "@/components/orders/track-order-form";

export const metadata = { title: "Track Your Order" };

export default function TrackOrderPage() {
  return (
    <div className="container-app py-14">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-brand-navy sm:text-3xl">Track Your Order</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your order number and contact details to see status.</p>
      </div>
      <TrackOrderForm />
    </div>
  );
}
