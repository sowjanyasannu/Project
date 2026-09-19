import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatDate, formatINR } from "@/lib/format";
import type { Order, OrderItem } from "@/types/database";

export const metadata = { title: "Order Detail" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminSupabaseClient();

  const [{ data: order }, { data: items }, { data: payments }] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).maybeSingle(),
    admin.from("order_items").select("*").eq("order_id", id),
    admin.from("payments").select("*").eq("order_id", id),
  ]);

  if (!order) notFound();
  const o = order as Order;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-navy">{o.order_number}</h1>
          <p className="text-xs text-muted-foreground">Placed {formatDate(o.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect orderId={id} status={o.status} />
          <Link href={`/invoice/${id}`} target="_blank" className="text-sm text-brand-navy hover:underline">
            View Invoice
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border bg-background p-6">
          <p className="mb-3 text-sm font-semibold">Items</p>
          <ul className="space-y-2 text-sm">
            {((items as OrderItem[]) ?? []).map((item) => (
              <li key={item.id} className="flex justify-between border-b pb-2 last:border-b-0">
                <span>{item.product_name} ({item.colour}, {item.size}) × {item.quantity}</span>
                <span>{formatINR(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd>-{formatINR(o.discount_amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">GST</dt><dd>{formatINR(o.gst_amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{formatINR(o.shipping_fee)}</dd></div>
            <div className="flex justify-between text-base font-semibold text-brand-navy"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
          </dl>

          {payments && payments.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <p className="mb-2 text-sm font-semibold">Payment</p>
              {payments.map((p) => (
                <p key={p.id} className="text-xs text-muted-foreground">
                  {p.provider} · {p.status} · {p.provider_payment_id ?? "—"}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-background p-6">
            <p className="mb-2 text-sm font-semibold">Customer</p>
            <p className="text-sm">{o.customer_name}</p>
            <p className="text-sm text-muted-foreground">{o.customer_email}</p>
            <p className="text-sm text-muted-foreground">{o.customer_phone}</p>
          </div>
          <div className="rounded-xl border bg-background p-6">
            <p className="mb-2 text-sm font-semibold">Shipping Address</p>
            <p className="text-sm text-muted-foreground">
              {o.shipping_address.full_name}<br />
              {o.shipping_address.line1}<br />
              {o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.pincode}<br />
              {o.shipping_address.phone}
            </p>
          </div>
          {o.customer_notes && (
            <div className="rounded-xl border bg-background p-6">
              <p className="mb-2 text-sm font-semibold">Customer Notes</p>
              <p className="text-sm text-muted-foreground">{o.customer_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
