"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { addToCartAction } from "@/lib/cart";
import { buildWhatsAppLink, productEnquiryMessage } from "@/lib/whatsapp";
import type { Product, ProductVariant } from "@/types/database";

export function VariantSelector({
  product,
  variants,
  whatsappNumber,
}: {
  product: Pick<Product, "id" | "name" | "sku" | "price" | "mrp" | "slug">;
  variants: ProductVariant[];
  whatsappNumber?: string | null;
}) {
  const router = useRouter();
  const colours = useMemo(() => [...new Set(variants.map((v) => v.colour))], [variants]);
  const [colour, setColour] = useState(colours[0] ?? "");
  const sizesForColour = useMemo(
    () => variants.filter((v) => v.colour === colour),
    [variants, colour]
  );
  const [size, setSize] = useState(sizesForColour[0]?.size ?? "");
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();

  const selectedVariant = sizesForColour.find((v) => v.size === size) ?? null;
  const inStock = (selectedVariant?.stock_available ?? 0) > 0;
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  function handleAdd(redirectToCheckout: boolean) {
    if (!selectedVariant) {
      toast.error("Please select a size.");
      return;
    }
    startTransition(async () => {
      const result = await addToCartAction(selectedVariant.id, qty);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Added to cart");
      router.push(redirectToCheckout ? "/checkout" : "/cart");
    });
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-3xl font-bold text-brand-navy">{formatINR(product.price)}</span>
        {product.mrp && product.mrp > product.price && (
          <>
            <span className="text-base text-muted-foreground line-through">{formatINR(product.mrp)}</span>
            <span className="text-sm font-medium text-brand-red">Save {discount}%</span>
          </>
        )}
      </div>

      {colours.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Colour: <span className="font-normal text-muted-foreground">{colour}</span></p>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColour(c);
                  const firstSize = variants.find((v) => v.colour === c)?.size ?? "";
                  setSize(firstSize);
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm",
                  colour === c ? "border-brand-navy bg-brand-navy text-white" : "hover:border-brand-navy"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium">Available Sizes</p>
        <div className="flex flex-wrap gap-2">
          {sizesForColour.map((v) => (
            <button
              key={v.id}
              disabled={v.stock_available === 0}
              onClick={() => setSize(v.size)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40",
                size === v.size ? "border-brand-navy bg-brand-navy text-white" : "hover:border-brand-navy"
              )}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <p className="text-sm font-medium">Quantity</p>
        <div className="flex items-center rounded-md border">
          <button className="p-2" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button
            className="p-2"
            onClick={() => setQty((q) => Math.min(selectedVariant?.stock_available ?? 99, q + 1))}
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <p className={cn("mt-4 text-sm font-medium", inStock ? "text-emerald-600" : "text-destructive")}>
        {inStock ? "✓ In Stock" : "Out of Stock"}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1" disabled={!inStock || pending} onClick={() => handleAdd(false)}>
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"
          disabled={!inStock || pending}
          onClick={() => handleAdd(true)}
        >
          Buy Now
        </Button>
      </div>

      <div className="mt-6 space-y-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Need this in bulk for your school or company?</p>
          <Button variant="secondary" size="sm" render={<Link href={`/bulk-orders?product=${product.slug}`} />}>
            Request Bulk Quote
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Need custom stitching or branding?</p>
          <Button variant="secondary" size="sm" render={<Link href={`/custom-uniforms?product=${product.slug}`} />}>
            Customize This Product
          </Button>
        </div>
        <a
          href={buildWhatsAppLink(
            productEnquiryMessage({ productName: product.name, sku: product.sku, size }),
            whatsappNumber
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline"
        >
          <MessageCircle className="size-4" /> Ask on WhatsApp
        </a>
      </div>
    </div>
  );
}
