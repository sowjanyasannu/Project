"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addVariantAction, deleteVariantAction, updateVariantStockAction } from "@/lib/admin/products";
import type { ProductVariant } from "@/types/database";

function VariantRow({ productId, variant }: { productId: string; variant: ProductVariant }) {
  const [pending, startTransition] = useTransition();
  const lastStockRef = useRef(variant.stock_available > 0 ? variant.stock_available : 1);
  const unavailable = variant.stock_available === 0;

  return (
    <TableRow>
      <TableCell>{variant.colour}</TableCell>
      <TableCell>{variant.size}</TableCell>
      <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
      <TableCell>
        <Input
          type="number"
          className="w-20"
          disabled={pending}
          defaultValue={variant.stock_available}
          onBlur={(e) => {
            const next = Number(e.target.value);
            if (next > 0) lastStockRef.current = next;
            startTransition(() => updateVariantStockAction(variant.id, productId, next));
          }}
        />
      </TableCell>
      <TableCell>
        {unavailable ? (
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Not available</Badge>
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => updateVariantStockAction(variant.id, productId, lastStockRef.current))}
              className="text-xs font-medium text-brand-navy hover:underline"
            >
              Restock
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              lastStockRef.current = variant.stock_available;
              startTransition(() => updateVariantStockAction(variant.id, productId, 0));
            }}
            className="text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            Mark unavailable
          </button>
        )}
      </TableCell>
      <TableCell>
        <button
          aria-label="Delete variant"
          onClick={() => startTransition(() => deleteVariantAction(variant.id, productId))}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </TableCell>
    </TableRow>
  );
}

export function VariantManager({ productId, variants }: { productId: string; variants: ProductVariant[] }) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ colour: "", size: "", sku: "", stock_available: 0, low_stock_threshold: 5 });

  return (
    <div className="rounded-xl border bg-background p-6">
      <p className="mb-4 text-sm font-semibold">Variants (Colour / Size / Stock)</p>
      <p className="mb-3 text-xs text-muted-foreground">
        A size at 0 stock shows on the storefront as disabled and can&apos;t be selected.
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colour</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) => (
              <VariantRow key={v.id} productId={productId} variant={v} />
            ))}
          </TableBody>
        </Table>
      </div>

      <form
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.colour || !form.size || !form.sku) {
            toast.error("Colour, size and SKU are required.");
            return;
          }
          startTransition(async () => {
            const result = await addVariantAction({ product_id: productId, ...form });
            if (result.error) toast.error(result.error);
            else setForm({ colour: "", size: "", sku: "", stock_available: 0, low_stock_threshold: 5 });
          });
        }}
      >
        <Input placeholder="Colour" value={form.colour} onChange={(e) => setForm((f) => ({ ...f, colour: e.target.value }))} />
        <Input placeholder="Size" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} />
        <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
        <Input
          type="number"
          placeholder="Stock"
          value={form.stock_available}
          onChange={(e) => setForm((f) => ({ ...f, stock_available: Number(e.target.value) }))}
        />
        <Button type="submit" disabled={pending}>Add Variant</Button>
      </form>
    </div>
  );
}
