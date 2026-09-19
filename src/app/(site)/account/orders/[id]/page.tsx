import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatINR } from "@/lib/format";
import { getSiteSettings } from "@/lib/data/site";
import { buildWhatsAppLink, orderHelpMessage } from "@/lib/whatsapp";
import type { Order, OrderItem } from "@/types/database";

export const metadata = { title: "Order Details" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).eq("user_id", user!.id).maybeSingle();
  if (!order) notFound();

  const [{ data: items }, settings] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", id),
    getSiteSettings(),
  ]);

  const o = order as Order;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-navy">{o.order_number}</h1>
          <p className="text-xs text-muted-foreground">Placed {formatDate(o.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" render={<Link href={`/invoice/${id}`} target="_blank" />}>
            Download Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={
              <a href={buildWhatsAppLink(orderHelpMessage(o.order_number), settings.whatsapp_number)} target="_blank" rel="noopener noreferrer" />
            }
          >
            Get Help on WhatsApp
          </Button>
        </div>
      </div>

      {o.delay_note && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>{o.delay_note}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border p-6">
          <p className="mb-4 text-sm font-semibold">Items</p>
          <ul className="space-y-3 text-sm">
            {((items as OrderItem[]) ?? []).map((item) => (
              <li key={item.id} className="flex justify-between border-b pb-3 last:border-b-0">
                <span>{item.product_name} ({item.colour}, {item.size}) × {item.quantity}</span>
                <span>{formatINR(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
            {o.discount_amount > 0 && (
              <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd>-{formatINR(o.discount_amount)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-muted-foreground">GST</dt><dd>{formatINR(o.gst_amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{o.shipping_fee === 0 ? "Free" : formatINR(o.shipping_fee)}</dd></div>
            <div className="flex justify-between text-base font-semibold text-brand-navy"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-6">
            <p className="mb-4 text-sm font-semibold">Status</p>
            <OrderTimeline status={o.status} />
          </div>
          <div className="rounded-xl border p-6">
            <p className="mb-2 text-sm font-semibold">Shipping Address</p>
            <p className="text-sm text-muted-foreground">
              {o.shipping_address.full_name}<br />
              {o.shipping_address.line1}{o.shipping_address.line2 ? `, ${o.shipping_address.line2}` : ""}<br />
              {o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.pincode}<br />
              {o.shipping_address.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
