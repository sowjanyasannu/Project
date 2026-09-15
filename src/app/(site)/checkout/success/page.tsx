import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderForConfirmation } from "@/lib/data/orders";
import { formatINR } from "@/lib/format";
import { orderHelpMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { getSiteSettings } from "@/lib/data/site";

export const metadata = { title: "Order Confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const [result, settings] = await Promise.all([getOrderForConfirmation(orderNumber), getSiteSettings()]);
  if (!result) notFound();
  const { order, items } = result;

  return (
    <div className="container-app flex flex-col items-center py-16 text-center">
      <CheckCircle2 className="size-14 text-emerald-600" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-brand-navy sm:text-3xl">
        {order.payment_status === "paid" ? "Order Confirmed!" : "Order Received"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order number <span className="font-semibold text-foreground">{order.order_number}</span>
      </p>

      <div className="mt-8 w-full max-w-md rounded-xl border p-6 text-left">
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.product_name} ({item.colour}, {item.size}) × {item.quantity}</span>
              <span>{formatINR(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t pt-3 text-base font-semibold text-brand-navy">
          <span>Total</span>
          <span>{formatINR(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/account/orders" />}>View My Orders</Button>
        <Button
          variant="outline"
          render={
            <a href={buildWhatsAppLink(orderHelpMessage(order.order_number), settings.whatsapp_number)} target="_blank" rel="noopener noreferrer" />
          }
        >
          Get Order Help on WhatsApp
        </Button>
      </div>
    </div>
  );
}
