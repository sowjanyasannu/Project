import type { MetadataRoute } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const admin = createAdminSupabaseClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    admin.from("products").select("slug, updated_at").eq("is_active", true),
    admin.from("categories").select("slug").eq("is_active", true),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/custom-uniforms",
    "/bulk-orders",
    "/size-guide",
    "/about",
    "/contact",
    "/track-order",
  ].map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 }));

  const categoryRoutes = (categories ?? []).map((c) => ({
    url: `${siteUrl}/shop/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const productRoutes = (products ?? []).map((p) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
