import { ProductCard } from "@/components/product/product-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Category, Product } from "@/types/database";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();

  const { data: wishlist } = await supabase
    .from("wishlist_items")
    .select("product_id, products(*, category:categories!products_category_id_fkey(*))")
    .eq("user_id", user!.id);

  const products = (wishlist ?? [])
    .map((w) => w.products as unknown as Product & { category: Category | null })
    .filter(Boolean);

  const productIds = products.map((p) => p.id);
  const [{ data: images }, { data: variants }] = await Promise.all([
    productIds.length
      ? supabase.from("product_images").select("product_id, url").in("product_id", productIds).order("display_order")
      : Promise.resolve({ data: [] }),
    productIds.length
      ? supabase.from("product_variants").select("id, product_id, size, colour, stock_available, is_active").in("product_id", productIds)
      : Promise.resolve({ data: [] }),
  ]);

  const imageByProduct = new Map<string, string>();
  for (const img of images ?? []) if (!imageByProduct.has(img.product_id)) imageByProduct.set(img.product_id, img.url);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-navy">Wishlist</h1>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">Save products you love to find them here later.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product) => {
            const productVariants = (variants ?? []).filter((v) => v.product_id === product.id && v.is_active);
            const inStockVariant = productVariants.find((v) => v.stock_available > 0) ?? null;
            return (
              <ProductCard
                key={product.id}
                wished
                product={{
                  ...product,
                  image: imageByProduct.get(product.id) ?? null,
                  category: product.category ? { name: product.category.name, slug: product.category.slug } : null,
                  sizes: [...new Set(productVariants.map((v) => v.size))],
                  colours: [...new Set(productVariants.map((v) => v.colour))],
                  in_stock: productVariants.some((v) => v.stock_available > 0),
                  rating: 0,
                  review_count: 0,
                  defaultVariantId: inStockVariant?.id ?? null,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
