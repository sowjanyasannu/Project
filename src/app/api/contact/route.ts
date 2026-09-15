import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { contactSchema } from "@/lib/validations/contact";
import { getSiteSettings } from "@/lib/data/site";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const input = parsed.data;

  const admin = createAdminSupabaseClient();
  await admin.from("contact_messages").insert(input);

  const settings = await getSiteSettings();
  await sendEmail({
    to: process.env.ADMIN_NOTIFICATION_EMAIL || settings.email || "",
    subject: `New contact message: ${input.subject || "Website enquiry"}`,
    html: `<p><strong>${input.name}</strong> (${input.email}${input.phone ? `, ${input.phone}` : ""}) wrote:</p><p>${input.message}</p>`,
    template: "contact_message",
  });

  return NextResponse.json({ ok: true });
}
