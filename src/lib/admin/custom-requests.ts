"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import type { CustomRequestStatus } from "@/types/database";

export async function updateCustomRequestStatusAction(requestId: string, status: CustomRequestStatus) {
  await requireAdmin(["super_admin", "sales_manager"]);
  const admin = createAdminSupabaseClient();
  await admin.from("custom_requests").update({ status }).eq("id", requestId);
  revalidatePath(`/admin/custom-requests/${requestId}`);
  revalidatePath("/admin/custom-requests");
  return { error: null };
}

export async function updateAdminNotesAction(requestId: string, notes: string, assignedStaff: string) {
  await requireAdmin(["super_admin", "sales_manager"]);
  const admin = createAdminSupabaseClient();
  await admin.from("custom_requests").update({ admin_notes: notes, assigned_staff: assignedStaff }).eq("id", requestId);
  revalidatePath(`/admin/custom-requests/${requestId}`);
  return { error: null };
}

export async function sendQuoteAction(params: {
  requestId: string;
  quoteAmount: number;
  quoteNotes: string;
  quoteValidUntil: string;
}) {
  await requireAdmin(["super_admin", "sales_manager"]);
  const admin = createAdminSupabaseClient();

  const { data: reqRow } = await admin
    .from("custom_requests")
    .select("request_number, email, customer_name")
    .eq("id", params.requestId)
    .single();

  await admin
    .from("custom_requests")
    .update({
      quote_amount: params.quoteAmount,
      quote_notes: params.quoteNotes,
      quote_valid_until: params.quoteValidUntil || null,
      status: "quote_sent",
    })
    .eq("id", params.requestId);

  if (reqRow) {
    await sendEmail({
      to: reqRow.email,
      subject: `Your quotation for request ${reqRow.request_number}`,
      html: `
        <p>Hi ${reqRow.customer_name},</p>
        <p>Here is your quotation for request <strong>${reqRow.request_number}</strong>:</p>
        <p style="font-size:20px;font-weight:700;">₹${params.quoteAmount.toLocaleString("en-IN")}</p>
        <p>${params.quoteNotes}</p>
        ${params.quoteValidUntil ? `<p>Valid until: ${params.quoteValidUntil}</p>` : ""}
        <p>Reply on WhatsApp or email to confirm and proceed.</p>
      `,
      template: "quote_sent",
      referenceType: "custom_request",
      referenceId: params.requestId,
    });
  }

  revalidatePath(`/admin/custom-requests/${params.requestId}`);
  return { error: null };
}
