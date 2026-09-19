import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category, Product, ProductVariant, ProductWithRelations, SizeChart } from "@/types/database";

const PRODUCT_WITH_CATEGORY = "*, category:categories!products_category_id_fkey(*)";

export interface ProductCardData extends Product {
  image: string | null;
  category: Pick<Category, "name" | "slug"> | null;
  sizes: string[];
  colours: string[];
  in_stock: boolean;
  defaultVariantId: string | null;
}

async function attachCardFields(products: (Product & { category: Category | null })[]) {
  const supabase = await createServerSupabaseClient();
  if (products.length === 0) return [] as ProductCardData[];

  const ids = products.map((p) => p.id);
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, product_id, size, colour, stock, is_active")
    .in("product_id", ids);

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const v of (variants ?? []) as ProductVariant[]) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push(v);
    variantsByProduct.set(v.product_id, list);
  }

  return products.map((p): ProductCardData => {
    const variantList = variantsByProduct.get(p.id) ?? [];
    const activeVariants = variantList.filter((v) => v.is_active);
    const inStockVariant = activeVariants.find((v) => v.stock > 0) ?? null;
    return {
      ...p,
      image: p.images?.[0] ?? null,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      sizes: [...new Set(activeVariants.map((v) => v.size))],
      colours: [...new Set(activeVariants.map((v) => v.colour))],
      in_stock: activeVariants.some((v) => v.stock > 0),
      defaultVariantId: inStockVariant?.id ?? null,
    };
  });
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachCardFields((data as (Product & { category: Category | null })[]) ?? []);
}

export async function getBestSellers(limit = 8): Promise<ProductCardData[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY)
    .eq("is_active", true)
    .eq("is_best_seller", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachCardFields((data as (Product & { category: Category | null })[]) ?? []);
}

export async function getNewArrivals(limit = 8): Promise<ProductCardData[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY)
    .eq("is_active", true)
    .eq("is_new_arrival", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachCardFields((data as (Product & { category: Category | null })[]) ?? []);
}

export interface CatalogFilters {
  categorySlug?: string;
  gender?: string;
  size?: string;
  colour?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "relevance" | "newest" | "price_asc" | "price_desc" | "best_selling" | "top_rated";
  page?: number;
  pageSize?: number;
}

export async function getProducts(filters: CatalogFilters = {}): Promise<{
  products: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createServerSupabaseClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  let query = supabase.from("products").select(PRODUCT_WITH_CATEGORY, { count: "exact" }).eq("is_active", true);

  if (filters.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (category) {
      const { data: children } = await supabase.from("categories").select("id").eq("parent_id", category.id);
      const categoryIds = [category.id, ...(children ?? []).map((c) => c.id)];
      query = query.or(
        `category_id.in.(${categoryIds.join(",")}),subcategory_id.in.(${categoryIds.join(",")})`
      );
    }
  }
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, "");
    query = query.or(`name.ilike.%${term}%,short_description.ilike.%${term}%,tags.cs.{${term}}`);
  }

  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "best_selling":
      query = query.order("is_best_seller", { ascending: false });
      break;
    case "top_rated":
      query = query.order("rating", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const { data, count } = await query.range(from, from + pageSize - 1);

  let products = await attachCardFields((data as (Product & { category: Category | null })[]) ?? []);

  if (filters.size) products = products.filter((p) => p.sizes.includes(filters.size!));
  if (filters.colour) products = products.filter((p) => p.colours.includes(filters.colour!));

  return { products, total: count ?? 0, page, pageSize };
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = await createServerSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!product) return null;

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .eq("is_active", true);

  return {
    ...(product as Product & { category: Category | null }),
    variants: (variants as ProductVariant[]) ?? [],
  };
}

export async function getProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (ids.length === 0) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("products").select(PRODUCT_WITH_CATEGORY).eq("is_active", true).in("id", ids);
  const cards = await attachCardFields((data as (Product & { category: Category | null })[]) ?? []);
  const byId = new Map(cards.map((c) => [c.id, c]));
  return ids.map((id) => byId.get(id)).filter((c): c is ProductCardData => Boolean(c));
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 4
): Promise<ProductCardData[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("products").select(PRODUCT_WITH_CATEGORY).eq("is_active", true).neq("id", excludeProductId).limit(limit);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query;
  return attachCardFields((data as (Product & { category: Category | null })[]) ?? []);
}

export async function getSizeChart(sizeChartKey: string): Promise<SizeChart | null> {
  const supabase = await createServerSupabaseClient();
  const { data: chart } = await supabase.from("size_charts").select("*").eq("key", sizeChartKey).maybeSingle();
  return (chart as SizeChart) ?? null;
}
