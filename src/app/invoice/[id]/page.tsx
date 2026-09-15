import { notFound } from "next/navigation";
import { getCurrentUser, getCurrentAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/data/site";
import { formatDate, formatINR } from "@/lib/format";
import { PrintButton } from "@/components/orders/print-button";
import type { Order, OrderItem } from "@/types/database";

export const metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const admin = await getCurrentAdmin();
  if (!user && !admin) notFound();

  const db = admin ? createAdminSupabaseClient() : await createServerSupabaseClient();
  let query = db.from("orders").select("*").eq("id", id);
  if (!admin) query = query.eq("user_id", user!.id);
  const { data: order } = await query.maybeSingle();
  if (!order) notFound();

  const { data: items } = await db.from("order_items").select("*").eq("order_id", id);
  const settings = await getSiteSettings();

  const o = order as Order;
  const isIntraState = !settings.address || o.shipping_address.state?.toLowerCase().includes("karnataka");
  const cgst = isIntraState ? o.gst_amount / 2 : 0;
  const sgst = isIntraState ? o.gst_amount / 2 : 0;
  const igst = isIntraState ? 0 : o.gst_amount;

  return (
    <div className="mx-auto max-w-3xl p-8 print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <div className="rounded-xl border p-8">
        <div className="flex items-start justify-between border-b pb-6">
          <div>
            <p className="font-heading text-xl font-bold text-brand-navy">{settings.company_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{settings.address ?? "Bengaluru, Karnataka"}</p>
            {settings.gstin && <p className="text-sm text-muted-foreground">GSTIN: {settings.gstin}</p>}
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Tax Invoice</p>
            <p className="text-muted-foreground">Invoice No: {o.order_number}</p>
            <p className="text-muted-foreground">Date: {formatDate(o.created_at)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Billing Address</p>
            <p className="mt-1 text-sm">
              {o.billing_address.full_name}<br />
              {o.billing_address.line1}<br />
              {o.billing_address.city}, {o.billing_address.state} {o.billing_address.pincode}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Shipping Address</p>
            <p className="mt-1 text-sm">
              {o.shipping_address.full_name}<br />
              {o.shipping_address.line1}<br />
              {o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.pincode}
            </p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">Item</th>
              <th className="py-2">Size/Colour</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {((items as OrderItem[]) ?? []).map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.product_name}</td>
                <td className="py-2">{item.colour}, {item.size}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatINR(item.unit_price)}</td>
                <td className="py-2 text-right">{formatINR(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <dl className="w-64 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
            {o.discount_amount > 0 && (
              <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd>-{formatINR(o.discount_amount)}</dd></div>
            )}
            {isIntraState ? (
              <>
                <div className="flex justify-between"><dt className="text-muted-foreground">CGST</dt><dd>{formatINR(cgst)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">SGST</dt><dd>{formatINR(sgst)}</dd></div>
              </>
            ) : (
              <div className="flex justify-between"><dt className="text-muted-foreground">IGST</dt><dd>{formatINR(igst)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{formatINR(o.shipping_fee)}</dd></div>
            <div className="flex justify-between border-t pt-1 text-base font-semibold text-brand-navy"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
          </dl>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          This is a computer-generated invoice from {settings.company_name}.
        </p>
      </div>
    </div>
  );
}
