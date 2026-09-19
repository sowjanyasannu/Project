import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatDate, formatINR } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

export const metadata = { title: "Orders" };

type SortKey = "newest" | "oldest" | "total_desc" | "total_asc";

const SORT_OPTIONS: { key: SortKey; label: string; column: string; ascending: boolean }[] = [
  { key: "newest", label: "Date", column: "created_at", ascending: false },
  { key: "oldest", label: "Date", column: "created_at", ascending: true },
  { key: "total_desc", label: "Total", column: "total", ascending: false },
  { key: "total_asc", label: "Total", column: "total", ascending: true },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;
  const sortOption = SORT_OPTIONS.find((s) => s.key === sort) ?? SORT_OPTIONS[0];

  const admin = createAdminSupabaseClient();
  let query = admin
    .from("orders")
    .select("id, order_number, customer_name, customer_email, status, payment_status, total, created_at")
    .order(sortOption.column, { ascending: sortOption.ascending })
    .limit(100);

  if (q?.trim()) {
    const term = q.trim().replace(/[%_]/g, "");
    query = query.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_email.ilike.%${term}%`);
  }

  const { data: orders } = await query;
  const orderIds = (orders ?? []).map((o) => o.id);

  const { data: items } = orderIds.length
    ? await admin.from("order_items").select("order_id").in("order_id", orderIds)
    : { data: [] as { order_id: string }[] };

  const itemCountByOrder = new Map<string, number>();
  for (const item of items ?? []) {
    itemCountByOrder.set(item.order_id, (itemCountByOrder.get(item.order_id) ?? 0) + 1);
  }

  function sortLink(key: SortKey) {
    const params = new URLSearchParams();
    if (q?.trim()) params.set("q", q.trim());
    params.set("sort", key);
    return `/admin/orders?${params.toString()}`;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-brand-navy">Orders</h1>
        <form method="get" className="flex gap-2">
          {sort && <input type="hidden" name="sort" value={sort} />}
          <Input name="q" defaultValue={q ?? ""} placeholder="Search order #, name, email…" className="w-64" />
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>
                <Link href={sortLink(sortOption.key === "newest" ? "oldest" : "newest")} className="flex items-center gap-1 hover:text-foreground">
                  Date <ArrowUpDown className="size-3" />
                </Link>
              </TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Link
                  href={sortLink(sortOption.key === "total_desc" ? "total_asc" : "total_desc")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Total <ArrowUpDown className="size-3" />
                </Link>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orders ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No orders match your search.
                </TableCell>
              </TableRow>
            )}
            {(orders ?? []).map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-brand-navy hover:underline">
                    {o.order_number}
                  </Link>
                </TableCell>
                <TableCell>
                  <p>{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">{itemCountByOrder.get(o.id) ?? 0}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(o.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={o.payment_status === "paid" ? "secondary" : "outline"}>{o.payment_status}</Badge>
                </TableCell>
                <TableCell>{ORDER_STATUS_LABEL[o.status as keyof typeof ORDER_STATUS_LABEL]}</TableCell>
                <TableCell>{formatINR(o.total)}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" render={<Link href={`/admin/orders/${o.id}`} />}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
