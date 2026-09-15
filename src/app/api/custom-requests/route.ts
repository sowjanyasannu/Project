import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { customRequestSchema } from "@/lib/validations/custom-request";
import { sendEmail, customRequestConfirmationEmail, adminNewCustomRequestEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/data/site";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = customRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const input = parsed.data;

  const totalQuantity = input.size_quantity_matrix.reduce((sum, row) => {
    const rowTotal = Object.entries(row)
      .filter(([key]) => key !== "size")
      .reduce((s, [, value]) => s + (Number(value) || 0), 0);
    return sum + rowTotal;
  }, 0);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminSupabaseClient();

  const { data: created, error } = await admin
    .from("custom_requests")
    .insert({
      request_type: input.request_type,
      user_id: user?.id ?? null,
      customer_name: input.customer_name,
      organization_name: input.organization_name || null,
      email: input.email,
      phone: input.phone,
      whatsapp_number: input.whatsapp_number || null,
      city: input.city || null,
      state: input.state || null,
      uniform_type: input.uniform_type,
      wearer_type: input.wearer_type || null,
      garments: input.garments,
      customization_options: input.customization_options,
      fabric_preference: input.fabric_preference || null,
      colour_preference: input.colour_preference || null,
      branding_placement: input.branding_placement || null,
      branding_method: input.branding_method || null,
      measurement_mode: input.measurement_mode || null,
      size_quantity_matrix: input.size_quantity_matrix,
      total_quantity: totalQuantity,
      delivery_date: input.delivery_date || null,
      delivery_location: input.delivery_location || null,
      additional_notes: input.additional_notes || null,
      source_product_id: input.source_product_id || null,
    })
    .select("id, request_number")
    .single();

  if (error || !created) {
    return NextResponse.json({ error: "Could not submit your request. Please try again." }, { status: 500 });
  }

  if (input.measurements.length > 0) {
    await admin.from("custom_request_measurements").insert(
      input.measurements.map((m) => ({
        custom_request_id: created.id,
        garment_type: m.garment_type,
        unit: m.unit,
        measurements: m.measurements,
      }))
    );
  }

  if (input.uploaded_file_urls.length > 0) {
    await admin.from("custom_request_files").insert(
      input.uploaded_file_urls.map((f) => ({
        custom_request_id: created.id,
        file_url: f.url,
        file_name: f.name ?? null,
        file_purpose: f.purpose,
      }))
    );
  }

  const settings = await getSiteSettings();

  await Promise.all([
    sendEmail({
      to: input.email,
      subject: `Jobert Apparels – ${input.request_type === "bulk_order" ? "Bulk Order" : "Custom Uniform"} Request ${created.request_number}`,
      html: customRequestConfirmationEmail({
        requestNumber: created.request_number,
        customerName: input.customer_name,
        organization: input.organization_name,
        uniformType: input.uniform_type,
        totalQuantity,
      }),
      template: "custom_request_confirmation",
      referenceType: "custom_request",
      referenceId: created.id,
    }),
    sendEmail({
      to: process.env.ADMIN_NOTIFICATION_EMAIL || settings.email || "",
      subject: `New ${input.request_type === "bulk_order" ? "Bulk" : "Custom"} Request ${created.request_number}`,
      html: adminNewCustomRequestEmail({
        requestNumber: created.request_number,
        customerName: input.customer_name,
        organization: input.organization_name,
        phone: input.phone,
        uniformType: input.uniform_type,
        totalQuantity,
      }),
      template: "admin_new_custom_request",
      referenceType: "custom_request",
      referenceId: created.id,
    }),
    admin.from("notifications").insert({
      recipient_type: "admin",
      title: "New custom request",
      message: `${input.customer_name} submitted ${created.request_number}`,
      link: `/admin/custom-requests/${created.id}`,
    }),
  ]);

  return NextResponse.json({ requestNumber: created.request_number, requestId: created.id, totalQuantity });
}
