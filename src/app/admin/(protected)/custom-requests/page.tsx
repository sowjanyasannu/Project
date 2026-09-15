import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Custom & Bulk Requests" };

export default async function AdminCustomRequestsPage() {
  const admin = createAdminSupabaseClient();
  const { data: requests } = await admin
    .from("custom_requests")
    .select("id, request_number, request_type, customer_name, organization_name, uniform_type, total_quantity, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-navy">Custom &amp; Bulk Requests</h1>
      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Uniform</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(requests ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link href={`/admin/custom-requests/${r.id}`} className="font-medium text-brand-navy hover:underline">
                    {r.request_number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{r.request_type === "bulk_order" ? "Bulk" : "Custom"}</Badge>
                </TableCell>
                <TableCell>{r.customer_name}{r.organization_name ? ` (${r.organization_name})` : ""}</TableCell>
                <TableCell>{r.uniform_type}</TableCell>
                <TableCell>{r.total_quantity}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(r.created_at)}</TableCell>
                <TableCell><Badge variant="secondary">{r.status.replace(/_/g, " ")}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
