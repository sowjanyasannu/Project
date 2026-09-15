"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function toggleWishlistAction(productId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "login_required" as const, wished: false };

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id);
    revalidatePath("/account/wishlist");
    return { error: null, wished: false };
  }

  await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
  revalidatePath("/account/wishlist");
  return { error: null, wished: true };
}

export async function getWishlistProductIds(): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.from("wishlist_items").select("product_id").eq("user_id", user.id);
  return (data ?? []).map((d) => d.product_id);
}
