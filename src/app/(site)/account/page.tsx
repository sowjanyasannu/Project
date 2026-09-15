import { ProfileForm } from "@/components/account/profile-form";
import { getCurrentUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const metadata = { title: "My Profile" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-navy">My Profile</h1>
      <ProfileForm profile={profile as Profile | null} email={user!.email ?? ""} />
    </div>
  );
}
