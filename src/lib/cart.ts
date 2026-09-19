"use server";

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Product, ProductImage, ProductVariant } from "@/types/database";

const CART_COOKIE = "jobert_cart_token";

export interface CartLine {
  id: string;
  quantity: number;
  saved_for_later: boolean;
  product: Pick<Product, "id" | "name" | "slug" | "price" | "mrp">;
  variant: Pick<ProductVariant, "id" | "colour" | "size" | "stock_available">;
  image: string | null;
}

async function getSessionUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Cookies can only be written inside a Server Action or Route Handler, never
// while a Server Component is rendering (e.g. the (site) layout reading the
// cart count). So read paths (getCartSummary/getCartCount) must never touch
// this — only the mutating actions below (add/update/remove) may create the
// cart-token cookie, since those always execute in a real action context.
async function getOrSetCartToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const token = randomUUID();
  cookieStore.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return token;
}

async function getExistingCartToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}

/** Write path: creates the cart (and its cookie, for guests) if it doesn't exist yet. */
async function getOrCreateCartId(): Promise<string> {
  const admin = createAdminSupabaseClient();
  const userId = await getSessionUserId();

  if (userId) {
    const { data: existing } = await admin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) return existing.id;

    const { data: created, error } = await admin
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (error) throw error;
    return created.id;
  }

  const token = await getOrSetCartToken();
  const { data: existing } = await admin
    .from("carts")
    .select("id")
    .eq("session_token", token)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await admin
    .from("carts")
    .insert({ session_token: token })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

/** Read path: looks up the cart without ever creating one or writing a cookie. */
async function findExistingCartId(): Promise<string | null> {
  const admin = createAdminSupabaseClient();
  const userId = await getSessionUserId();

  if (userId) {
    const { data } = await admin.from("carts").select("id").eq("user_id", userId).maybeSingle();
    return data?.id ?? null;
  }

  const token = await getExistingCartToken();
  if (!token) return null;

  const { data } = await admin.from("carts").select("id").eq("session_token", token).maybeSingle();
  return data?.id ?? null;
}

export async function addToCartAction(variantId: string, quantity: number) {
  const admin = createAdminSupabaseClient();
  const cartId = await getOrCreateCartId();

  const { data: variant, error: variantError } = await admin
    .from("product_variants")
    .select("id, product_id, stock_available, is_active")
    .eq("id", variantId)
    .single();
  if (variantError || !variant || !variant.is_active) {
    return { error: "This size/colour is no longer available." };
  }

  const { data: existingItem } = await admin
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("variant_id", variantId)
    .maybeSingle();

  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;
  if (nextQuantity > variant.stock_available) {
    return { error: `Only ${variant.stock_available} left in stock.` };
  }

  if (existingItem) {
    await admin.from("cart_items").update({ quantity: nextQuantity }).eq("id", existingItem.id);
  } else {
    await admin.from("cart_items").insert({
      cart_id: cartId,
      product_id: variant.product_id,
      variant_id: variantId,
      quantity,
    });
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { error: null };
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  const admin = createAdminSupabaseClient();
  if (quantity <= 0) {
    await admin.from("cart_items").delete().eq("id", itemId);
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { error: null };
  }

  const { data: item } = await admin
    .from("cart_items")
    .select("variant_id")
    .eq("id", itemId)
    .single();
  if (!item) return { error: "Item not found." };

  const { data: variant } = await admin
    .from("product_variants")
    .select("stock_available")
    .eq("id", item.variant_id)
    .single();

  if (variant && quantity > variant.stock_available) {
    return { error: `Only ${variant.stock_available} left in stock.` };
  }

  await admin.from("cart_items").update({ quantity }).eq("id", itemId);
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { error: null };
}

export async function removeCartItemAction(itemId: string) {
  const admin = createAdminSupabaseClient();
  await admin.from("cart_items").delete().eq("id", itemId);
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function getCartSummary(): Promise<{
  cartId: string | null;
  lines: CartLine[];
  subtotal: number;
}> {
  const admin = createAdminSupabaseClient();
  const cartId = await findExistingCartId();
  if (!cartId) return { cartId: null, lines: [], subtotal: 0 };

  const { data: items } = await admin
    .from("cart_items")
    .select(
      "id, quantity, saved_for_later, product:products(id, name, slug, price, mrp), variant:product_variants(id, colour, size, stock_available)"
    )
    .eq("cart_id", cartId)
    .eq("saved_for_later", false)
    .order("created_at", { ascending: true });

  const productIds = (items ?? []).map((i) => (i.product as unknown as Product).id);
  const { data: images } = productIds.length
    ? await admin
        .from("product_images")
        .select("product_id, url, display_order")
        .in("product_id", productIds)
        .order("display_order", { ascending: true })
    : { data: [] as Pick<ProductImage, "product_id" | "url" | "display_order">[] };

  const imageByProduct = new Map<string, string>();
  for (const img of images ?? []) {
    if (!imageByProduct.has(img.product_id)) imageByProduct.set(img.product_id, img.url);
  }

  const lines: CartLine[] = (items ?? []).map((item) => {
    const product = item.product as unknown as CartLine["product"];
    const variant = item.variant as unknown as CartLine["variant"];
    return {
      id: item.id,
      quantity: item.quantity,
      saved_for_later: item.saved_for_later,
      product,
      variant,
      image: imageByProduct.get(product.id) ?? null,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  return { cartId, lines, subtotal };
}

export async function getCartCount(): Promise<number> {
  const admin = createAdminSupabaseClient();
  const cartId = await findExistingCartId();
  if (!cartId) return 0;
  const { data } = await admin
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cartId)
    .eq("saved_for_later", false);
  return (data ?? []).reduce((sum, i) => sum + i.quantity, 0);
}

/** Call right after a user signs in to fold their guest cart into their account cart. */
export async function mergeGuestCartIntoUser(userId: string) {
  const admin = createAdminSupabaseClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) return;

  const { data: guestCart } = await admin
    .from("carts")
    .select("id")
    .eq("session_token", token)
    .maybeSingle();
  if (!guestCart) return;

  let { data: userCart } = await admin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!userCart) {
    const { data: created } = await admin
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    userCart = created;
  }
  if (!userCart) return;

  const { data: guestItems } = await admin
    .from("cart_items")
    .select("variant_id, product_id, quantity")
    .eq("cart_id", guestCart.id);

  for (const item of guestItems ?? []) {
    const { data: existing } = await admin
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", userCart.id)
      .eq("variant_id", item.variant_id)
      .maybeSingle();

    if (existing) {
      await admin
        .from("cart_items")
        .update({ quantity: existing.quantity + item.quantity })
        .eq("id", existing.id);
    } else {
      await admin.from("cart_items").insert({
        cart_id: userCart.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
    }
  }

  await admin.from("carts").delete().eq("id", guestCart.id);
  cookieStore.delete(CART_COOKIE);
}
