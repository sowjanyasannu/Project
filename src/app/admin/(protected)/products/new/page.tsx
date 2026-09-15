import { ProductForm } from "@/components/admin/product-form";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Category, SizeChart } from "@/types/database";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const admin = createAdminSupabaseClient();
  const [{ data: categories }, { data: sizeCharts }] = await Promise.all([
    admin.from("categories").select("*").order("name"),
    admin.from("size_charts").select("*").order("name"),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-navy">Add Product</h1>
      <ProductForm categories={(categories as Category[]) ?? []} sizeCharts={(sizeCharts as SizeChart[]) ?? []} />
    </div>
  );
}
