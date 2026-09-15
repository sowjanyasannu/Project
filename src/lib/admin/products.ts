"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/format";

export interface ProductInput {
  name: string;
  sku: string;
  category_id: string | null;
  description: string;
  short_description: string;
  gender: string;
  age_group: string;
  fabric: string;
  price: number;
  mrp: number | null;
  gst_rate: number;
  tags: string[];
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  size_chart_id: string | null;
}

export async function createProductAction(input: ProductInput) {
  await requireAdmin(["super_admin", "product_manager"]);
  const admin = createAdminSupabaseClient();

  const { data, error } = await admin
    .from("products")
    .insert({ ...input, slug: `${slugify(input.name)}-${Date.now().toString(36)}` })
    .select("id, slug")
    .single();

  if (error) return { error: error.message, id: null };
  revalidatePath("/admin/products");
  return { error: null, id: data.id };
}

export async function updateProductAction(id: string, input: ProductInput) {
  await requireAdmin(["super_admin", "product_manager"]);
  const admin = createAdminSupabaseClient();

  const { error } = await admin.from("products").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { error: null };
}

export async function toggleProductActiveAction(id: string, isActive: boolean) {
  await requireAdmin(["super_admin", "product_manager"]);
  const admin = createAdminSupabaseClient();
  await admin.from("products").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/products");
}

export async function addVariantAction(params: {
  product_id: string;
  colour: string;
  size: string;
  sku: string;
  stock_available: number;
  low_stock_threshold: number;
}) {
  await requireAdmin(["super_admin", "product_manager"]);
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("product_variants").insert(params);
  if (error) return { error: error.message };
  revalidatePath(`/admin/products/${params.product_id}`);
  return { error: null };
}

export async function updateVariantStockAction(variantId: string, productId: string, stockAvailable: number) {
  await requireAdmin(["super_admin", "product_manager"]);
  const admin = createAdminSupabaseClient();
  await admin.from("product_variants").update({ stock_available: stockAvailable }).eq("id", variantId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariantAction(variantId: string, productId: string) {
  await requireAdmin(["super_admin", "product_manager"]);
  const admin = createAdminSupabaseClient();
  await admin.from("product_variants").delete().eq("id", variantId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function addProductImageAction(productId: string, url: string) {
  await requireAdmin(["super_admin", "product_manager"]);
  const admin = createAdminSupabaseClient();
  const { count } = await admin
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  await admin.from("product_images").insert({ product_id: productId, url, display_order: count ?? 0 });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImageAction(imageId: string, productId: string) {
  await requireAdmin(["super_admin", "product_manager"]);
  const admin = createAdminSupabaseClient();
  await admin.from("product_images").delete().eq("id", imageId);
  revalidatePath(`/admin/products/${productId}`);
}
