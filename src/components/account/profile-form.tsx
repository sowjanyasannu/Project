"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/lib/profile";
import type { Profile } from "@/types/database";

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp_number ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-md space-y-4 rounded-xl border p-6"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await updateProfileAction({ fullName, phone, whatsappNumber: whatsapp });
          if (result.error) toast.error(result.error);
          else toast.success("Profile updated");
        });
      }}
    >
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label>Full Name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>WhatsApp Number</Label>
        <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
