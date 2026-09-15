"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleWishlistAction } from "@/lib/wishlist";

export function WishlistButton({
  productId,
  initialWished = false,
  className,
}: {
  productId: string;
  initialWished?: boolean;
  className?: string;
}) {
  const [wished, setWished] = useState(initialWished);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      disabled={pending}
      aria-pressed={wished}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      className={cn("shrink-0", className)}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleWishlistAction(productId);
          if (result.error === "login_required") {
            toast.error("Please log in to save items to your wishlist.");
            return;
          }
          setWished(result.wished);
        })
      }
    >
      <Heart className={cn("size-4", wished && "fill-brand-red text-brand-red")} />
    </Button>
  );
}
