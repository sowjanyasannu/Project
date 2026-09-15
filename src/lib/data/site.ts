import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category, SiteSettings } from "@/types/database";

const DEFAULT_SETTINGS: SiteSettings = {
  id: true,
  company_name: "Jobert Apparels Pvt. Ltd.",
  logo_url: null,
  favicon_url: null,
  phone: null,
  whatsapp_number: null,
  email: null,
  address: "Bengaluru, Karnataka",
  gstin: null,
  hero_title: "Premium Uniforms. Made to Fit Your Team.",
  hero_subtitle:
    "School uniforms, corporate wear, sportswear and customized uniforms manufactured with quality and precision.",
  hero_image_url: null,
  default_gst_rate: 5,
  flat_shipping_fee: 0,
  free_shipping_threshold: null,
  social_links: {},
  updated_at: new Date().toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle();
  return (data as SiteSettings | null) ?? DEFAULT_SETTINGS;
}

export async function getTopCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return (data as Category[]) ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return (data as Category[]) ?? [];
}
