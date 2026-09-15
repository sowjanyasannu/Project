import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductRail } from "@/components/home/product-rail";
import { CustomUniformCTA } from "@/components/home/custom-cta";
import { TrustElements } from "@/components/home/trust-elements";
import { getSiteSettings, getTopCategories } from "@/lib/data/site";
import { getBestSellers, getFeaturedProducts, getNewArrivals, getProducts } from "@/lib/data/catalog";
import { getWishlistProductIds } from "@/lib/wishlist";

export default async function HomePage() {
  const [settings, categories, schoolUniforms, bestSellers, newArrivals, featured, wishlistedIds] =
    await Promise.all([
      getSiteSettings(),
      getTopCategories(),
      getProducts({ categorySlug: "school-uniforms", pageSize: 8 }),
      getBestSellers(),
      getNewArrivals(),
      getFeaturedProducts(),
      getWishlistProductIds(),
    ]);

  return (
    <>
      <Hero settings={settings} />
      <CategoryGrid categories={categories} />
      <ProductRail
        title="Shop School Uniforms"
        subtitle="Shirts, trousers, skirts, tracksuits and complete uniform sets."
        products={schoolUniforms.products}
        viewAllHref="/shop/school-uniforms"
        wishlistedIds={wishlistedIds}
      />
      <ProductRail
        title="Best Sellers"
        subtitle="Most-loved styles across schools, teams and companies."
        products={bestSellers}
        viewAllHref="/shop?sort=best_selling"
        wishlistedIds={wishlistedIds}
      />
      <CustomUniformCTA />
      <ProductRail
        title="New Arrivals"
        products={newArrivals}
        viewAllHref="/shop?sort=newest"
        wishlistedIds={wishlistedIds}
      />
      <ProductRail
        title="Featured Products"
        subtitle="Hand-picked from our uniform and sportswear range."
        products={featured}
        viewAllHref="/shop"
        wishlistedIds={wishlistedIds}
      />
      <TrustElements />
    </>
  );
}
