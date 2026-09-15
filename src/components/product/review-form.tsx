"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { submitReviewAction } from "@/lib/reviews";

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return (
      <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Thanks for your review — it will appear once our team approves it.
      </p>
    );
  }

  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (rating === 0) {
          toast.error("Please select a star rating.");
          return;
        }
        startTransition(async () => {
          const result = await submitReviewAction({ productId, productSlug, rating, title, comment });
          if (result.error) {
            toast.error(result.error);
            return;
          }
          setSubmitted(true);
        });
      }}
    >
      <p className="text-sm font-medium">Write a review</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} stars`}>
            <Star className={cn("size-5", star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </button>
        ))}
      </div>
      <Input placeholder="Review title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        placeholder="Share your experience with this product"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}
