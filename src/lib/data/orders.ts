import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/types/database";

export async function getOrderForConfirmation(
  orderNumber: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const admin = createAdminSupabaseClient();
  const { data: order } = await admin.from("orders").select("*").eq("order_number", orderNumber).maybeSingle();
  if (!order) return null;
  const { data: items } = await admin.from("order_items").select("*").eq("order_id", order.id);
  return { order: order as Order, items: (items as OrderItem[]) ?? [] };
}

/** Order tracking requires the order number *and* the contact used to place it. */
export async function trackOrder(
  orderNumber: string,
  contact: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const admin = createAdminSupabaseClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber.trim())
    .maybeSingle();
  if (!order) return null;

  const normalizedContact = contact.trim().toLowerCase();
  const matches =
    order.customer_email.toLowerCase() === normalizedContact || order.customer_phone === contact.trim();
  if (!matches) return null;

  const { data: items } = await admin.from("order_items").select("*").eq("order_id", order.id);
  return { order: order as Order, items: (items as OrderItem[]) ?? [] };
}
