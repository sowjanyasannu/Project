import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Category,
  Product,
  ProductImage,
  ProductVariant,
  ProductWithRelations,
  SizeChart,
  SizeChartEntry,
} from "@/types/database";

export interface ProductCardData extends Product {
  image: string | null;
  category: Pick<Category, "name" | "slug"> | null;
  sizes: string[];
  colours: string[];
  in_stock: boolean;
  rating: number;
  review_count: number;
  defaultVariantId: string | null;
}

async function attachCardFields(products: (Product & { category: Category | null })[]) {
  const supabase = await createServerSupabaseClient();
  if (products.length === 0) return [] as ProductCardData[];

  const ids = products.map((p) => p.id);
  const [{ data: images }, { data: variants }, { data: reviews }] = await Promise.all([
    supabase
      .from("product_images")
      .select("product_id, url, display_order")
      .in("product_id", ids)
      .order("display_order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("id, product_id, size, colour, stock_available, is_active")
      .in("product_id", ids),
    supabase.from("reviews").select("product_id, rating").in("product_id", ids).eq("is_approved", true),
  ]);

  const imageByProduct = new Map<string, string>();
  for (const img of images ?? []) {
    if (!imageByProduct.has(img.product_id)) imageByProduct.set(img.product_id, img.url);
  }

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const v of (variants ?? []) as ProductVariant[]) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push(v);
    variantsByProduct.set(v.product_id, list);
  }

  const ratingByProduct = new Map<string, { sum: number; count: number }>();
  for (const r of reviews ?? []) {
    const entry = ratingByProduct.get(r.product_id) ?? { sum: 0, count: 0 };
    entry.sum += r.rating;
    entry.count += 1;
    ratingByProduct.set(r.product_id, entry);
  }

  return products.map((p): ProductCardData => {
    const variantList = variantsByProduct.get(p.id) ?? [];
    const activeVariants = variantList.filter((v) => v.is_active);
    const rating = ratingByProduct.get(p.id);
    const inStockVariant = activeVariants.find((v) => v.stock_available > 0) ?? null;
    return {
      ...p,
      image: imageByProduct.get(p.id) ?? null,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      sizes: [...new Set(activeVariants.map((v) => v.size))],
      colours: [...new Set(activeVariants.map((v) => v.colour))],
      in_stock: activeVariants.some((v) => v.stock_available > 0),
      rating: rating ? Math.round((rating.sum / rating.count) * 10) / 10 : 0,
      review_count: rating?.count ?? 0,
      defaultVariantId: inStockVariant?.id ?? null,
    };
  });
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
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
    .select("*, category:categories(*)")
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
    .select("*, category:categories(*)")
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

  let query = supabase
    .from("products")
    .select("*, category:categories(*)", { count: "exact" })
    .eq("is_active", true);

  if (filters.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (category) query = query.eq("category_id", category.id);
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
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!product) return null;

  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true),
  ]);

  return {
    ...(product as Product & { category: Category | null }),
    images: (images as ProductImage[]) ?? [],
    variants: (variants as ProductVariant[]) ?? [],
  };
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 4
): Promise<ProductCardData[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .neq("id", excludeProductId)
    .limit(limit);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query;
  return attachCardFields((data as (Product & { category: Category | null })[]) ?? []);
}

export async function getSizeChart(
  sizeChartId: string
): Promise<{ chart: SizeChart; entries: SizeChartEntry[] } | null> {
  const supabase = await createServerSupabaseClient();
  const { data: chart } = await supabase
    .from("size_charts")
    .select("*")
    .eq("id", sizeChartId)
    .maybeSingle();
  if (!chart) return null;
  const { data: entries } = await supabase
    .from("size_chart_entries")
    .select("*")
    .eq("size_chart_id", sizeChartId)
    .order("display_order", { ascending: true });
  return { chart: chart as SizeChart, entries: (entries as SizeChartEntry[]) ?? [] };
}
