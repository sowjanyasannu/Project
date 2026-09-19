"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateOrderDelayNoteAction } from "@/lib/admin/orders";
import { formatDate } from "@/lib/format";

export function DelayNoteForm({
  orderId,
  initialNote,
  updatedAt,
}: {
  orderId: string;
  initialNote: string | null;
  updatedAt: string | null;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updateOrderDelayNoteAction(orderId, note);
      toast.success(note.trim() ? "Delay note saved — visible to the customer" : "Delay note cleared");
    });
  }

  return (
    <div className="rounded-xl border bg-background p-6">
      <p className="mb-1 text-sm font-semibold">Delay Note</p>
      <p className="mb-3 text-xs text-muted-foreground">
        Shown to the customer on their order page and order tracking. Leave blank to hide.
      </p>
      <Textarea
        rows={3}
        placeholder="e.g. Your order has been delayed and will be delivered within the next 24 hours."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-3 flex items-center gap-3">
        <Button size="sm" disabled={pending} onClick={save}>
          {pending ? "Saving…" : "Save Note"}
        </Button>
        {updatedAt && <p className="text-xs text-muted-foreground">Last updated {formatDate(updatedAt)}</p>}
      </div>
    </div>
  );
}
