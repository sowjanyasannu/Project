"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProductAction, updateProductAction, type ProductInput } from "@/lib/admin/products";
import type { Category, Product, SizeChart } from "@/types/database";

const GENDERS = ["men", "women", "boys", "girls", "unisex"];

export function ProductForm({
  product,
  categories,
  sizeCharts,
}: {
  product?: Product;
  categories: Category[];
  sizeCharts: SizeChart[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ProductInput>({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category_id: product?.category_id ?? null,
    description: product?.description ?? "",
    short_description: product?.short_description ?? "",
    gender: product?.gender ?? "unisex",
    age_group: product?.age_group ?? "",
    fabric: product?.fabric ?? "",
    price: product?.price ?? 0,
    mrp: product?.mrp ?? null,
    gst_percent: product?.gst_percent ?? 5,
    tags: product?.tags ?? [],
    is_featured: product?.is_featured ?? false,
    is_best_seller: product?.is_best_seller ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    is_active: product?.is_active ?? true,
    size_chart_key: product?.size_chart_key ?? null,
  });

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (product) {
        const result = await updateProductAction(product.id, form);
        if (result.error) toast.error(result.error);
        else toast.success("Product updated");
      } else {
        const result = await createProductAction(form);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Product created — now add variants and images");
        router.push(`/admin/products/${result.id}`);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl border bg-background p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Product Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>SKU</Label>
          <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.category_id ?? undefined} onValueChange={(v) => set("category_id", v)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <Select value={form.gender} onValueChange={(v) => set("gender", v ?? "unisex")}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Age Group</Label>
          <Input value={form.age_group} onChange={(e) => set("age_group", e.target.value)} placeholder="kids / adult" />
        </div>
        <div className="space-y-1.5">
          <Label>Fabric</Label>
          <Input value={form.fabric} onChange={(e) => set("fabric", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Price (₹)</Label>
          <Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} required />
        </div>
        <div className="space-y-1.5">
          <Label>MRP (₹)</Label>
          <Input type="number" value={form.mrp ?? ""} onChange={(e) => set("mrp", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="space-y-1.5">
          <Label>GST Rate (%)</Label>
          <Input type="number" value={form.gst_percent} onChange={(e) => set("gst_percent", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label>Size Chart</Label>
          <Select value={form.size_chart_key ?? undefined} onValueChange={(v) => set("size_chart_key", v)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              {sizeCharts.map((s) => (
                <SelectItem key={s.id} value={s.key}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Short Description</Label>
        <Input value={form.short_description} onChange={(e) => set("short_description", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Tags (comma separated)</Label>
        <Input
          value={form.tags.join(", ")}
          onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={form.is_featured} onCheckedChange={(v) => set("is_featured", Boolean(v))} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={form.is_best_seller} onCheckedChange={(v) => set("is_best_seller", Boolean(v))} /> Best Seller
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={form.is_new_arrival} onCheckedChange={(v) => set("is_new_arrival", Boolean(v))} /> New Arrival
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={form.is_active} onCheckedChange={(v) => set("is_active", Boolean(v))} /> Active (visible on site)
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : product ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}
