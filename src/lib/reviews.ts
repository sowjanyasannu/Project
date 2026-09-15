"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function submitReviewAction(params: {
  productId: string;
  productSlug: string;
  rating: number;
  title?: string;
  comment?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to write a review." };

  const admin = createAdminSupabaseClient();

  const { data: verifiedOrderItem } = await admin
    .from("order_items")
    .select("id, orders!inner(user_id, status)")
    .eq("product_id", params.productId)
    .eq("orders.user_id", user.id)
    .in("orders.status", ["delivered", "shipped", "out_for_delivery"])
    .maybeSingle();

  await admin.from("reviews").insert({
    product_id: params.productId,
    user_id: user.id,
    rating: params.rating,
    title: params.title,
    comment: params.comment,
    is_verified_purchase: Boolean(verifiedOrderItem),
    is_approved: false,
  });

  revalidatePath(`/product/${params.productSlug}`);
  return { error: null };
}
