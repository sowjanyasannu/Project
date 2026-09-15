"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { mergeGuestCartIntoUser } from "@/lib/cart";
import type { AdminRole } from "@/types/database";

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInAction(params: { email: string; password: string }) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(params);
  if (error) return { error: error.message };
  if (data.user) await mergeGuestCartIntoUser(data.user.id);
  return { error: null };
}

export async function signUpAction(params: { fullName: string; phone: string; email: string; password: string }) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: { full_name: params.fullName, phone: params.phone } },
  });
  if (error) return { error: error.message };
  if (data.user) await mergeGuestCartIntoUser(data.user.id);
  return { error: null };
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentAdmin(): Promise<{ id: string; role: AdminRole; full_name: string } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("admin_users")
    .select("id, role, full_name, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !data.is_active) return null;
  return { id: data.id, role: data.role, full_name: data.full_name };
}
