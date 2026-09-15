"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/format";
import { checkoutSchema } from "@/lib/validations/checkout";
import type { CartLine } from "@/lib/cart";
import type { OrderTotals } from "@/lib/pricing";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const STEPS = ["Contact", "Shipping Address", "Review & Pay"] as const;

interface FormState {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  customer_notes: string;
  coupon_code: string;
}

export function CheckoutForm({
  lines,
  totals,
  defaultEmail,
  razorpayKeyId,
}: {
  lines: CartLine[];
  totals: OrderTotals;
  defaultEmail: string;
  razorpayKeyId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>({
    customer_name: "",
    customer_email: defaultEmail,
    customer_phone: "",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    customer_notes: "",
    coupon_code: "",
  });
  const [pendingOrderMessage, setPendingOrderMessage] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function goNext() {
    if (step === 0 && (!form.customer_name || !form.customer_email || !form.customer_phone)) {
      toast.error("Please fill in your contact details.");
      return;
    }
    if (step === 1 && (!form.full_name || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode)) {
      toast.error("Please fill in the shipping address.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function placeOrder() {
    const payload = {
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      shipping_address: {
        full_name: form.full_name,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      billing_same_as_shipping: true,
      customer_notes: form.customer_notes || undefined,
      coupon_code: form.coupon_code || undefined,
    };

    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (!data.razorpay) {
        setPendingOrderMessage(data.orderNumber);
        return;
      }

      if (!window.Razorpay) {
        toast.error("Payment gateway is still loading — please try again in a moment.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.razorpay.keyId ?? razorpayKeyId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: "Jobert Apparels",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpay.orderId,
        prefill: { name: form.customer_name, email: form.customer_email, contact: form.customer_phone },
        theme: { color: "#0f2a4a" },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, ...response }),
          });
          if (verifyRes.ok) {
            router.push(`/checkout/success?order=${data.orderNumber}`);
          } else {
            toast.error("We couldn't verify your payment. Please contact us with your order number.");
          }
        },
      });
      razorpay.open();
    });
  }

  if (pendingOrderMessage) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-xl border p-8 text-center">
        <h2 className="font-heading text-xl font-bold text-brand-navy">Order {pendingOrderMessage} received</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Online payment isn&apos;t enabled on this store yet. Our team will contact you on WhatsApp or email to
          confirm payment and delivery details.
        </p>
        <Button className="mt-6" render={<a href={`/checkout/success?order=${pendingOrderMessage}`} />}>
          View Order
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div>
        <div className="mb-6 flex gap-2 text-xs font-medium">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`flex-1 rounded-full border-b-2 pb-2 text-center ${
                i <= step ? "border-brand-navy text-brand-navy" : "border-muted text-muted-foreground"
              }`}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4 rounded-xl border p-6">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile Number</Label>
              <Input value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} placeholder="10-digit mobile number" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 rounded-xl border p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Recipient Name</Label>
                <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address Line 1</Label>
              <Input value={form.line1} onChange={(e) => update("line1", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Address Line 2 (optional)</Label>
              <Input value={form.line2} onChange={(e) => update("line2", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 rounded-xl border p-6">
            <div>
              <p className="text-sm font-medium">Items</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {lines.map((l) => (
                  <li key={l.id}>
                    {l.product.name} ({l.variant.colour}, {l.variant.size}) × {l.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-1.5">
              <Label>Coupon Code (optional)</Label>
              <Input value={form.coupon_code} onChange={(e) => update("coupon_code", e.target.value.toUpperCase())} placeholder="e.g. WELCOME10" />
            </div>
            <div className="space-y-1.5">
              <Label>Order Notes (optional)</Label>
              <Textarea value={form.customer_notes} onChange={(e) => update("customer_notes", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked disabled /> Billing address same as shipping
            </label>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext}>Continue</Button>
          ) : (
            <Button disabled={pending} onClick={placeOrder}>
              {pending ? "Placing order…" : `Pay ${formatINR(totals.total)}`}
            </Button>
          )}
        </div>
      </div>

      <div className="h-fit rounded-xl border p-6">
        <p className="font-heading text-lg font-semibold text-brand-navy">Order Summary</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatINR(totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">GST (est.)</dt><dd>{formatINR(totals.gstAmount)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{totals.shippingFee === 0 ? "Free" : formatINR(totals.shippingFee)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold text-brand-navy">
            <dt>Total</dt><dd>{formatINR(totals.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
