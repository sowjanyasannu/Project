"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateCustomRequestStatusAction, updateAdminNotesAction, sendQuoteAction } from "@/lib/admin/custom-requests";
import type { CustomRequestStatus } from "@/types/database";

const STATUSES: CustomRequestStatus[] = [
  "submitted",
  "under_review",
  "need_more_info",
  "quote_sent",
  "customer_approved",
  "production",
  "quality_check",
  "ready_for_dispatch",
  "completed",
  "cancelled",
];

export function StatusPanel({ requestId, status }: { requestId: string; status: CustomRequestStatus }) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(v) =>
        startTransition(async () => {
          await updateCustomRequestStatusAction(requestId, v as CustomRequestStatus);
          toast.success("Status updated");
        })
      }
    >
      <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function QuotePanel({
  requestId,
  quoteAmount,
  quoteNotes,
  quoteValidUntil,
}: {
  requestId: string;
  quoteAmount: number | null;
  quoteNotes: string | null;
  quoteValidUntil: string | null;
}) {
  const [amount, setAmount] = useState(quoteAmount?.toString() ?? "");
  const [notes, setNotes] = useState(quoteNotes ?? "");
  const [validUntil, setValidUntil] = useState(quoteValidUntil ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3 rounded-xl border bg-background p-6">
      <p className="text-sm font-semibold">Quotation</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Quote Amount (₹)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Valid Until</Label>
          <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes for Customer</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button
        disabled={pending || !amount}
        onClick={() =>
          startTransition(async () => {
            await sendQuoteAction({
              requestId,
              quoteAmount: Number(amount),
              quoteNotes: notes,
              quoteValidUntil: validUntil,
            });
            toast.success("Quote sent to customer by email");
          })
        }
      >
        {pending ? "Sending…" : "Send Quote"}
      </Button>
    </div>
  );
}

export function AdminNotesPanel({
  requestId,
  adminNotes,
  assignedStaff,
}: {
  requestId: string;
  adminNotes: string | null;
  assignedStaff: string | null;
}) {
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [staff, setStaff] = useState(assignedStaff ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3 rounded-xl border bg-background p-6">
      <p className="text-sm font-semibold">Internal Notes</p>
      <div className="space-y-1.5">
        <Label>Assigned Staff</Label>
        <Input value={staff} onChange={(e) => setStaff(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
      </div>
      <Button
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await updateAdminNotesAction(requestId, notes, staff);
            toast.success("Saved");
          })
        }
      >
        {pending ? "Saving…" : "Save Notes"}
      </Button>
    </div>
  );
}
