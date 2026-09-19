"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addVariantAction, deleteVariantAction, updateVariantStockAction } from "@/lib/admin/products";
import type { ProductVariant } from "@/types/database";

export function VariantManager({ productId, variants }: { productId: string; variants: ProductVariant[] }) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ colour: "", size: "", sku: "", stock: 0, low_stock_threshold: 5 });

  return (
    <div className="rounded-xl border bg-background p-6">
      <p className="mb-4 text-sm font-semibold">Variants (Colour / Size / Stock)</p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colour</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.colour}</TableCell>
                <TableCell>{v.size}</TableCell>
                <TableCell className="text-muted-foreground">{v.sku}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-20"
                    defaultValue={v.stock}
                    onBlur={(e) => startTransition(() => updateVariantStockAction(v.id, productId, Number(e.target.value)))}
                  />
                </TableCell>
                <TableCell>
                  <button
                    aria-label="Delete variant"
                    onClick={() => startTransition(() => deleteVariantAction(v.id, productId))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
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
            else setForm({ colour: "", size: "", sku: "", stock: 0, low_stock_threshold: 5 });
          });
        }}
      >
        <Input placeholder="Colour" value={form.colour} onChange={(e) => setForm((f) => ({ ...f, colour: e.target.value }))} />
        <Input placeholder="Size" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} />
        <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
        <Input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
        />
        <Button type="submit" disabled={pending}>Add Variant</Button>
      </form>
    </div>
  );
}
