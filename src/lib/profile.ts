"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateProfileAction(params: { fullName: string; phone: string; whatsappNumber?: string }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: params.fullName, phone: params.phone, whatsapp_number: params.whatsappNumber })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/account");
  return { error: null };
}

export async function addAddressAction(params: {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  if (params.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert({ ...params, user_id: user.id });
  if (error) return { error: error.message };
  revalidatePath("/account/addresses");
  return { error: null };
}

export async function deleteAddressAction(addressId: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("addresses").delete().eq("id", addressId);
  revalidatePath("/account/addresses");
}
