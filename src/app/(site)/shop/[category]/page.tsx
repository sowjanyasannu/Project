import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ShopPageContent, type ShopSearchParams } from "@/components/shop/shop-page-content";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<ShopSearchParams>;
}

async function getCategory(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} from Jobert Apparels.`,
  };
}

export default async function CategoryShopPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const [category, sp] = await Promise.all([getCategory(slug), searchParams]);
  if (!category) notFound();

  return (
    <ShopPageContent
      heading={category.name}
      description={category.description ?? undefined}
      categorySlug={category.slug}
      searchParams={sp}
      basePath={`/shop/${category.slug}`}
    />
  );
}
