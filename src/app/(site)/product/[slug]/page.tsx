import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ProductGallery } from "@/components/product/product-gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { SizeChartDialog } from "@/components/product/size-chart-dialog";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductRail } from "@/components/home/product-rail";
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { getProductBySlug, getRelatedProducts, getSizeChart } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site";
import { getWishlistProductIds } from "@/lib/wishlist";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Review } from "@/types/database";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seo_title || product.name,
    description: product.meta_description || product.short_description || undefined,
    openGraph: product.images[0] ? { images: [product.images[0].url] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createServerSupabaseClient();
  const [settings, related, wishlistedIds, sizeChart, { data: reviews }] = await Promise.all([
    getSiteSettings(),
    getRelatedProducts(product.category_id, product.id),
    getWishlistProductIds(),
    product.size_chart_id ? getSizeChart(product.size_chart_id) : Promise.resolve(null),
    supabase.from("reviews").select("*").eq("product_id", product.id).order("created_at", { ascending: false }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.short_description ?? product.description,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.variants.some((v) => v.stock_available > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-app py-8">
      <RecentlyViewedTracker productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink render={<Link href="/shop" />}>Shop</BreadcrumbLink></BreadcrumbItem>
          {product.category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/shop/${product.category.slug}`} />}>
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.category.name}</p>
          )}
          <h1 className="mt-1 font-heading text-2xl font-bold text-brand-navy sm:text-3xl">{product.name}</h1>
          {product.short_description && (
            <p className="mt-2 text-sm text-muted-foreground">{product.short_description}</p>
          )}
          {sizeChart && (
            <div className="mt-2">
              <SizeChartDialog chart={sizeChart.chart} entries={sizeChart.entries} />
            </div>
          )}

          <div className="mt-4">
            <VariantSelector product={product} variants={product.variants} whatsappNumber={settings.whatsapp_number} />
          </div>
        </div>
      </div>

      <ProductTabs product={product} reviews={(reviews as Review[]) ?? []} />

      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <ProductRail title="You may also like" products={related} wishlistedIds={wishlistedIds} />
        <RecentlyViewed excludeProductId={product.id} />
      </div>
    </div>
  );
}
