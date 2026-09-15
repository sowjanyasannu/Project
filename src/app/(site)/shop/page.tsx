import type { Metadata } from "next";
import { ShopPageContent, type ShopSearchParams } from "@/components/shop/shop-page-content";

export const metadata: Metadata = {
  title: "Shop All Uniforms",
  description: "Browse school, corporate, industrial, hospitality, healthcare and sports uniforms.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const sp = await searchParams;
  return (
    <ShopPageContent
      heading="Shop All Uniforms"
      description="School, corporate, industrial, hospitality, healthcare and sports uniforms — all in one place."
      searchParams={sp}
      basePath="/shop"
    />
  );
}
