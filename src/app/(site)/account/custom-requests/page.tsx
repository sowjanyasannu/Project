import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { CustomRequest } from "@/types/database";

export const metadata = { title: "Custom Requests" };

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  need_more_info: "Need More Information",
  quote_sent: "Quote Sent",
  customer_approved: "Approved",
  production: "In Production",
  quality_check: "Quality Check",
  ready_for_dispatch: "Ready for Dispatch",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function CustomRequestsPage() {
  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();
  const { data: requests } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-navy">Custom Requests &amp; Bulk Quotes</h1>
      {!requests || requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No requests yet. Start one from{" "}
          <Link href="/custom-uniforms" className="text-brand-navy hover:underline">Custom Uniforms</Link> or{" "}
          <Link href="/bulk-orders" className="text-brand-navy hover:underline">Bulk Orders</Link>.
        </p>
      ) : (
        <div className="space-y-3">
          {(requests as CustomRequest[]).map((r) => (
            <div key={r.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{r.request_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.uniform_type} · {r.total_quantity} pcs · {formatDate(r.created_at)}
                  </p>
                </div>
                <Badge variant="secondary">{STATUS_LABEL[r.status] ?? r.status}</Badge>
              </div>
              {r.quote_amount != null && (
                <p className="mt-2 text-sm">
                  Quote: <span className="font-semibold">₹{r.quote_amount.toLocaleString("en-IN")}</span>
                  {r.quote_notes && <span className="text-muted-foreground"> — {r.quote_notes}</span>}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
