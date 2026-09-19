"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { formatDate, formatINR } from "@/lib/format";
import { trackOrderAction } from "@/lib/track-order";
import type { Order, OrderItem } from "@/types/database";

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ order: Order; items: OrderItem[] } | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await trackOrderAction(orderNumber, contact);
      if (res.error) {
        setError(res.error);
        setResult(null);
        return;
      }
      setError(null);
      setResult({ order: res.order!, items: res.items! });
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border p-6">
        <div className="space-y-1.5">
          <Label>Order Number</Label>
          <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="JOB-20260914-00001" />
        </div>
        <div className="space-y-1.5">
          <Label>Email or Phone used to order</Label>
          <Input value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Checking…" : "Track Order"}
        </Button>
      </form>

      {result && (
        <div className="mt-8 rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <p className="font-heading text-lg font-semibold text-brand-navy">{result.order.order_number}</p>
            <p className="text-xs text-muted-foreground">Placed {formatDate(result.order.created_at)}</p>
          </div>
          <div className="mt-4">
            <OrderTimeline status={result.order.status} />
          </div>
          <ul className="mt-4 space-y-1 border-t pt-4 text-sm">
            {result.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.product_name} ({item.colour}, {item.size}) × {item.quantity}</span>
                <span>{formatINR(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>{formatINR(result.order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
