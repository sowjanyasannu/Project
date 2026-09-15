import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatINR } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const admin = createAdminSupabaseClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    { data: todayOrders },
    { count: pendingOrders },
    { count: customRequestsPending },
    { count: bulkEnquiriesPending },
    { count: customersCount },
    { count: productsCount },
    { data: lowStockVariants },
    { data: recentOrders },
    { data: paidOrders },
  ] = await Promise.all([
    admin.from("orders").select("total").gte("created_at", startOfToday.toISOString()).eq("payment_status", "paid"),
    admin.from("orders").select("id", { count: "exact", head: true }).in("status", ["order_placed", "payment_confirmed", "processing"]),
    admin
      .from("custom_requests")
      .select("id", { count: "exact", head: true })
      .eq("request_type", "custom_uniform")
      .not("status", "in", "(completed,cancelled)"),
    admin
      .from("custom_requests")
      .select("id", { count: "exact", head: true })
      .eq("request_type", "bulk_order")
      .not("status", "in", "(completed,cancelled)"),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin
      .from("product_variants")
      .select("id, colour, size, stock_available, low_stock_threshold, product:products(name)")
      .eq("is_active", true)
      .order("stock_available", { ascending: true })
      .limit(50),
    admin.from("orders").select("id, order_number, status, total, customer_name, created_at").order("created_at", { ascending: false }).limit(6),
    admin.from("orders").select("total").eq("payment_status", "paid"),
  ]);

  const todaySales = (todayOrders ?? []).reduce((s, o) => s + o.total, 0);
  const totalRevenue = (paidOrders ?? []).reduce((s, o) => s + o.total, 0);
  const lowStock = (lowStockVariants ?? []).filter((v) => v.stock_available <= v.low_stock_threshold);

  const tiles = [
    { label: "Today's Sales", value: formatINR(todaySales) },
    { label: "Total Revenue", value: formatINR(totalRevenue) },
    { label: "Pending Orders", value: pendingOrders ?? 0 },
    { label: "Custom Requests", value: customRequestsPending ?? 0 },
    { label: "Bulk Enquiries", value: bulkEnquiriesPending ?? 0 },
    { label: "Customers", value: customersCount ?? 0 },
    { label: "Active Products", value: productsCount ?? 0 },
    { label: "Low Stock Items", value: lowStock.length },
  ];

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-navy">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border bg-background p-4">
            <p className="text-xs text-muted-foreground">{tile.label}</p>
            <p className="mt-1 font-heading text-xl font-bold text-brand-navy">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-background p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Recent Orders</p>
            <Link href="/admin/orders" className="text-xs text-brand-navy hover:underline">View all</Link>
          </div>
          {!recentOrders || recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-muted">
                    <span>
                      <span className="font-medium">{o.order_number}</span>
                      <span className="text-muted-foreground"> · {o.customer_name}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{ORDER_STATUS_LABEL[o.status as keyof typeof ORDER_STATUS_LABEL]}</Badge>
                      {formatINR(o.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-background p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Low Stock</p>
            <Link href="/admin/products" className="text-xs text-brand-navy hover:underline">Manage products</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing running low right now.</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.slice(0, 8).map((v) => (
                <li key={v.id} className="flex items-center justify-between rounded-md p-2 text-sm">
                  <span>
                    {(v.product as unknown as { name: string })?.name} — {v.colour}, {v.size}
                  </span>
                  <Badge variant={v.stock_available === 0 ? "destructive" : "secondary"} className="text-[10px]">
                    {v.stock_available} left
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
