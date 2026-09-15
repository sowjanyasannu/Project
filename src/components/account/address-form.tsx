"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addAddressAction } from "@/lib/profile";
import { addressSchema } from "@/lib/validations/checkout";

export function AddressForm({ onAdded }: { onAdded?: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 rounded-xl border p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = addressSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
          return;
        }
        startTransition(async () => {
          const result = await addAddressAction(form);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Address saved");
          setForm({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", is_default: false });
          onAdded?.();
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Address Line 1</Label>
        <Input value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label>Address Line 2 (optional)</Label>
        <Input value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>State</Label>
          <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Pincode</Label>
          <Input value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={form.is_default} onCheckedChange={(v) => setForm((f) => ({ ...f, is_default: Boolean(v) }))} />
        Set as default address
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Address"}
      </Button>
    </form>
  );
}
