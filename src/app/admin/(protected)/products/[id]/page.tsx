import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { VariantManager } from "@/components/admin/variant-manager";
import { ImageManager } from "@/components/admin/image-manager";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Category, Product, ProductImage, ProductVariant, SizeChart } from "@/types/database";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminSupabaseClient();

  const [{ data: product }, { data: categories }, { data: sizeCharts }, { data: variants }, { data: images }] =
    await Promise.all([
      admin.from("products").select("*").eq("id", id).maybeSingle(),
      admin.from("categories").select("*").order("name"),
      admin.from("size_charts").select("*").order("name"),
      admin.from("product_variants").select("*").eq("product_id", id),
      admin.from("product_images").select("*").eq("product_id", id).order("display_order"),
    ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-brand-navy">Edit Product</h1>
      <ProductForm
        product={product as Product}
        categories={(categories as Category[]) ?? []}
        sizeCharts={(sizeCharts as SizeChart[]) ?? []}
      />
      <VariantManager productId={id} variants={(variants as ProductVariant[]) ?? []} />
      <ImageManager productId={id} images={(images as ProductImage[]) ?? []} />
    </div>
  );
}
