import type { OrderStatus } from "@/types/database";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "order_placed",
  "payment_confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  order_placed: "Order Placed",
  payment_confirmed: "Payment Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
