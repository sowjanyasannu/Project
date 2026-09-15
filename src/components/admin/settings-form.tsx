"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSettingsAction, type SiteSettingsInput } from "@/lib/admin/settings";
import type { SiteSettings } from "@/types/database";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState<SiteSettingsInput>({
    company_name: settings.company_name,
    phone: settings.phone ?? "",
    whatsapp_number: settings.whatsapp_number ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
    gstin: settings.gstin ?? "",
    hero_title: settings.hero_title,
    hero_subtitle: settings.hero_subtitle,
    default_gst_rate: settings.default_gst_rate,
    flat_shipping_fee: settings.flat_shipping_fee,
    free_shipping_threshold: settings.free_shipping_threshold,
  });
  const [pending, startTransition] = useTransition();

  function set<K extends keyof SiteSettingsInput>(key: K, value: SiteSettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await updateSiteSettingsAction(form);
          if (result.error) toast.error(result.error);
          else toast.success("Settings saved");
        });
      }}
    >
      <section className="rounded-xl border bg-background p-6">
        <p className="mb-4 text-sm font-semibold">Company Details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Company Name</Label><Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>GSTIN</Label><Input value={form.gstin} onChange={(e) => set("gstin", e.target.value)} placeholder="Enter once available — do not fake" /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>WhatsApp Number</Label><Input value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="919876543210" /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
        </div>
      </section>

      <section className="rounded-xl border bg-background p-6">
        <p className="mb-4 text-sm font-semibold">Homepage Hero</p>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Hero Title</Label><Input value={form.hero_title} onChange={(e) => set("hero_title", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Hero Subtitle</Label><Textarea value={form.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} /></div>
        </div>
      </section>

      <section className="rounded-xl border bg-background p-6">
        <p className="mb-4 text-sm font-semibold">Tax &amp; Shipping</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Default GST Rate (%)</Label><Input type="number" value={form.default_gst_rate} onChange={(e) => set("default_gst_rate", Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Flat Shipping Fee (₹)</Label><Input type="number" value={form.flat_shipping_fee} onChange={(e) => set("flat_shipping_fee", Number(e.target.value))} /></div>
          <div className="space-y-1.5">
            <Label>Free Shipping Above (₹)</Label>
            <Input
              type="number"
              value={form.free_shipping_threshold ?? ""}
              onChange={(e) => set("free_shipping_threshold", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>
      </section>

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save Settings"}</Button>
    </form>
  );
}
