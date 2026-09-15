import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { StatusPanel, QuotePanel, AdminNotesPanel } from "@/components/admin/custom-request-panels";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import type { CustomRequest, CustomRequestFile, CustomRequestMeasurement } from "@/types/database";

export const metadata = { title: "Custom Request Detail" };

export default async function AdminCustomRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminSupabaseClient();

  const [{ data: request }, { data: files }, { data: measurements }] = await Promise.all([
    admin.from("custom_requests").select("*").eq("id", id).maybeSingle(),
    admin.from("custom_request_files").select("*").eq("custom_request_id", id),
    admin.from("custom_request_measurements").select("*").eq("custom_request_id", id),
  ]);

  if (!request) notFound();
  const r = request as CustomRequest;

  const filesWithUrls = await Promise.all(
    ((files as CustomRequestFile[]) ?? []).map(async (f) => {
      const { data } = await admin.storage.from("custom-uploads").createSignedUrl(f.file_url, 60 * 10);
      return { ...f, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-navy">{r.request_number}</h1>
          <p className="text-xs text-muted-foreground">Submitted {formatDate(r.created_at)}</p>
        </div>
        <StatusPanel requestId={id} status={r.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-xl border bg-background p-6">
            <p className="mb-3 text-sm font-semibold">Customer</p>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <Row label="Name" value={r.customer_name} />
              <Row label="Organization" value={r.organization_name ?? "—"} />
              <Row label="Phone" value={r.phone} />
              <Row label="Email" value={r.email} />
              <Row label="City / State" value={[r.city, r.state].filter(Boolean).join(", ") || "—"} />
            </dl>
          </div>

          <div className="rounded-xl border bg-background p-6">
            <p className="mb-3 text-sm font-semibold">Requirement</p>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <Row label="Uniform Type" value={r.uniform_type} />
              <Row label="Wearer" value={r.wearer_type ?? "—"} />
              <Row label="Garments" value={r.garments.join(", ") || "—"} />
              <Row label="Customization" value={r.customization_options.join(", ") || "—"} />
              <Row label="Fabric" value={r.fabric_preference ?? "—"} />
              <Row label="Colour" value={r.colour_preference ?? "—"} />
              <Row label="Branding" value={[r.branding_placement, r.branding_method].filter(Boolean).join(" · ") || "—"} />
              <Row label="Total Quantity" value={String(r.total_quantity)} />
              <Row label="Delivery Location" value={r.delivery_location ?? "—"} />
              <Row label="Required By" value={r.delivery_date ?? "—"} />
            </dl>

            {r.size_quantity_matrix.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Size / Quantity Matrix</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="py-1">Size</th>
                      {Object.keys(r.size_quantity_matrix[0]).filter((k) => k !== "size").map((k) => (
                        <th key={k} className="py-1">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {r.size_quantity_matrix.map((row, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="py-1 font-medium">{row.size}</td>
                        {Object.keys(row).filter((k) => k !== "size").map((k) => (
                          <td key={k} className="py-1">{row[k]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {measurements && measurements.length > 0 && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Measurements</p>
                {(measurements as CustomRequestMeasurement[]).map((m) => (
                  <p key={m.id} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{m.garment_type}:</span>{" "}
                    {Object.entries(m.measurements).map(([k, v]) => `${k} ${v}${m.unit}`).join(", ")}
                  </p>
                ))}
              </div>
            )}

            {r.additional_notes && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Additional Requirements</p>
                <p className="text-sm text-muted-foreground">{r.additional_notes}</p>
              </div>
            )}
          </div>

          {filesWithUrls.length > 0 && (
            <div className="rounded-xl border bg-background p-6">
              <p className="mb-3 text-sm font-semibold">Uploaded Files</p>
              <ul className="space-y-2">
                {filesWithUrls.map((f) => (
                  <li key={f.id}>
                    <a
                      href={f.signedUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-navy hover:underline"
                    >
                      <FileText className="size-4" /> {f.file_name ?? f.file_url} ({f.file_purpose})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <QuotePanel requestId={id} quoteAmount={r.quote_amount} quoteNotes={r.quote_notes} quoteValidUntil={r.quote_valid_until} />
          <AdminNotesPanel requestId={id} adminNotes={r.admin_notes} assignedStaff={r.assigned_staff} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
