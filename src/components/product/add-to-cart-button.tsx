"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addToCartAction } from "@/lib/cart";

export function AddToCartButton({
  variantId,
  inStock,
  className,
}: {
  variantId: string | null;
  inStock: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!inStock || !variantId) {
    return (
      <Button size="sm" variant="secondary" disabled className={cn("w-full", className)}>
        Out of Stock
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      className={cn(
        "w-full gap-1.5 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white",
        className
      )}
      onClick={() =>
        startTransition(async () => {
          const result = await addToCartAction(variantId, 1);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Added to cart");
          router.refresh();
        })
      }
    >
      <ShoppingBag className="size-3.5" /> Add to Cart
    </Button>
  );
}
