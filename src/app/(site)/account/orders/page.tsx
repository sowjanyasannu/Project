import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatINR } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { Order } from "@/types/database";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-navy">My Orders</h1>
      {!orders || orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {(orders as Order[]).map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex flex-col gap-2 rounded-xl border p-4 hover:border-brand-navy sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{ORDER_STATUS_LABEL[order.status]}</Badge>
                <span className="font-medium">{formatINR(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
