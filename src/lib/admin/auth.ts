"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function adminSignInAction(params: { email: string; password: string }) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(params);
  if (error) return { error: "Invalid email or password." };

  const admin = createAdminSupabaseClient();
  const { data: adminRow } = await admin
    .from("admin_users")
    .select("id, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!adminRow || !adminRow.is_active) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }

  return { error: null };
}
