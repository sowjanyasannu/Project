"use server";

import { trackOrder } from "@/lib/data/orders";

export async function trackOrderAction(orderNumber: string, contact: string) {
  if (!orderNumber.trim() || !contact.trim()) {
    return { error: "Enter your order number and the email or phone used to order." };
  }
  const result = await trackOrder(orderNumber, contact);
  if (!result) return { error: "We couldn't find an order matching those details." };
  return { error: null, order: result.order, items: result.items };
}
