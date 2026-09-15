"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteAddressAction } from "@/lib/profile";
import type { Address } from "@/types/database";

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [pending, startTransition] = useTransition();

  if (addresses.length === 0) {
    return <p className="text-sm text-muted-foreground">No saved addresses yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {addresses.map((address) => (
        <div key={address.id} className="rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{address.full_name}</p>
            {address.is_default && <Badge variant="secondary">Default</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
            {address.city}, {address.state} {address.pincode}<br />
            {address.phone}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={pending}
            onClick={() => startTransition(() => deleteAddressAction(address.id))}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
