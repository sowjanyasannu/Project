import { AddressForm } from "@/components/account/address-form";
import { AddressList } from "@/components/account/address-list";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Address } from "@/types/database";

export const metadata = { title: "Saved Addresses" };

export default async function AddressesPage() {
  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user!.id)
    .order("is_default", { ascending: false });

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-bold text-brand-navy">Saved Addresses</h1>
      <AddressList addresses={(addresses as Address[]) ?? []} />
      <div>
        <p className="mb-3 text-sm font-semibold">Add a new address</p>
        <AddressForm />
      </div>
    </div>
  );
}
