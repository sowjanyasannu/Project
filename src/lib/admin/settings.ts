"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface SiteSettingsInput {
  company_name: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  gstin: string;
  hero_title: string;
  hero_subtitle: string;
  default_gst_rate: number;
  flat_shipping_fee: number;
  free_shipping_threshold: number | null;
}

export async function updateSiteSettingsAction(input: SiteSettingsInput) {
  await requireAdmin(["super_admin", "content_manager"]);
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("site_settings").update(input).eq("id", true);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { error: null };
}
