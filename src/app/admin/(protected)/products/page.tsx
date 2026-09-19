import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const admin = createAdminSupabaseClient();
  const { data: products } = await admin
    .from("products")
    .select("id, name, sku, price, is_active, is_featured, is_best_seller, category:categories(name)")
    .order("created_at", { ascending: false });

  const { data: variants } = await admin.from("product_variants").select("product_id, stock_available");
  const stockByProduct = new Map<string, number>();
  for (const v of variants ?? []) {
    stockByProduct.set(v.product_id, (stockByProduct.get(v.product_id) ?? 0) + v.stock_available);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-brand-navy">Products</h1>
        <Button render={<Link href="/admin/products/new" />}>Add Product</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(products ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                <TableCell className="text-muted-foreground">{(p.category as unknown as { name: string } | null)?.name ?? "—"}</TableCell>
                <TableCell>{formatINR(p.price)}</TableCell>
                <TableCell>{stockByProduct.get(p.id) ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={p.is_active ? "secondary" : "destructive"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/products/${p.id}`} className="text-sm text-brand-navy hover:underline">Edit</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
