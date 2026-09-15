import "server-only";
import { Resend } from "resend";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  template: string;
  referenceType?: string;
  referenceId?: string;
}

/**
 * Sends a transactional email via Resend when configured; otherwise logs the
 * attempt so development/demo environments keep working without an API key.
 * Every attempt (sent, failed, skipped) is recorded in email_logs for admin
 * visibility (spec §25 / §45).
 */
export async function sendEmail({
  to,
  subject,
  html,
  template,
  referenceType,
  referenceId,
}: SendEmailParams): Promise<void> {
  const resend = getResendClient();
  const admin = createAdminSupabaseClient();

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${template}" to ${to}`);
    await admin.from("email_logs").insert({
      to_email: to,
      template,
      status: "skipped_not_configured",
      reference_type: referenceType,
      reference_id: referenceId,
    });
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Jobert Apparels <orders@jobertapparels.com>",
      to,
      subject,
      html,
    });
    await admin.from("email_logs").insert({
      to_email: to,
      template,
      status: "sent",
      reference_type: referenceType,
      reference_id: referenceId,
    });
  } catch (error) {
    console.error(`[email] failed to send "${template}" to ${to}`, error);
    await admin.from("email_logs").insert({
      to_email: to,
      template,
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      reference_type: referenceType,
      reference_id: referenceId,
    });
  }
}

function emailShell(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: Inter, Arial, sans-serif; background:#f4f6f8; padding:32px 0;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#0f2a4a;padding:24px 32px;">
        <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.02em;">JOBERT APPARELS</span>
      </div>
      <div style="padding:32px;color:#1f2937;font-size:14px;line-height:1.6;">
        <h1 style="font-size:20px;margin:0 0 16px;color:#0f2a4a;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px;background:#f4f6f8;color:#6b7280;font-size:12px;">
        Jobert Apparels Pvt. Ltd. · Bengaluru, Karnataka
      </div>
    </div>
  </div>`;
}

export function orderConfirmationEmail(params: {
  orderNumber: string;
  customerName: string;
  total: number;
  items: { name: string; size: string; colour: string; quantity: number }[];
}): string {
  const rows = params.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${i.name} (${i.colour}, ${i.size})</td><td style="padding:6px 0;text-align:right;">x${i.quantity}</td></tr>`
    )
    .join("");
  return emailShell(
    "Your order is confirmed",
    `<p>Hi ${params.customerName},</p>
     <p>Thank you for your order <strong>${params.orderNumber}</strong>. Here's a summary:</p>
     <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
     <p style="font-weight:600;">Order Total: ₹${params.total.toLocaleString("en-IN")}</p>
     <p>We'll email you again once your order ships.</p>`
  );
}

export function customRequestConfirmationEmail(params: {
  requestNumber: string;
  customerName: string;
  organization?: string | null;
  uniformType: string;
  totalQuantity: number;
}): string {
  return emailShell(
    `Custom Uniform Request ${params.requestNumber}`,
    `<p>Hi ${params.customerName},</p>
     <p>Thank you for sharing your requirements with Jobert Apparels.</p>
     <p><strong>Request ID:</strong> ${params.requestNumber}<br/>
        ${params.organization ? `<strong>Organization:</strong> ${params.organization}<br/>` : ""}
        <strong>Uniform:</strong> ${params.uniformType}<br/>
        <strong>Estimated Quantity:</strong> ${params.totalQuantity}</p>
     <p>Our team will review your request and get back to you with a quotation shortly. You can also continue the conversation on WhatsApp any time.</p>`
  );
}

export function adminNewCustomRequestEmail(params: {
  requestNumber: string;
  customerName: string;
  organization?: string | null;
  phone: string;
  uniformType: string;
  totalQuantity: number;
}): string {
  return emailShell(
    `New Custom Request ${params.requestNumber}`,
    `<p><strong>${params.customerName}</strong> ${params.organization ? `(${params.organization})` : ""} submitted a new custom uniform request.</p>
     <p><strong>Phone:</strong> ${params.phone}<br/>
        <strong>Uniform:</strong> ${params.uniformType}<br/>
        <strong>Quantity:</strong> ${params.totalQuantity}</p>
     <p>Open the admin panel to review measurements, uploaded files and respond.</p>`
  );
}

export function adminNewOrderEmail(params: { orderNumber: string; total: number }): string {
  return emailShell(
    `New Order ${params.orderNumber}`,
    `<p>A new order has been placed for ₹${params.total.toLocaleString("en-IN")}.</p>
     <p>Open the admin panel to process it.</p>`
  );
}
