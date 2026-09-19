"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/types/database";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireAdmin(["super_admin", "order_manager"]);
  const admin = createAdminSupabaseClient();

  const { data: order } = await admin
    .from("orders")
    .select("order_number, customer_email, customer_name")
    .eq("id", orderId)
    .single();

  await admin.from("orders").update({ status }).eq("id", orderId);

  if (order) {
    await sendEmail({
      to: order.customer_email,
      subject: `Your order ${order.order_number} is now ${ORDER_STATUS_LABEL[status]}`,
      html: `<p>Hi ${order.customer_name},</p><p>Your order <strong>${order.order_number}</strong> status has been updated to <strong>${ORDER_STATUS_LABEL[status]}</strong>.</p>`,
      template: "order_status_update",
      referenceType: "order",
      referenceId: orderId,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { error: null };
}
