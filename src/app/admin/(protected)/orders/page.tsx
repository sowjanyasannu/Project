import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatDate, formatINR } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const admin = createAdminSupabaseClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id, order_number, customer_name, status, payment_status, total, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-navy">Orders</h1>
      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orders ?? []).map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-brand-navy hover:underline">
                    {o.order_number}
                  </Link>
                </TableCell>
                <TableCell>{o.customer_name}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(o.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={o.payment_status === "paid" ? "secondary" : "outline"}>{o.payment_status}</Badge>
                </TableCell>
                <TableCell>{ORDER_STATUS_LABEL[o.status as keyof typeof ORDER_STATUS_LABEL]}</TableCell>
                <TableCell>{formatINR(o.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
