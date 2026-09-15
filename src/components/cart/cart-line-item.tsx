"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { formatINR } from "@/lib/format";
import { removeCartItemAction, updateCartItemAction, type CartLine } from "@/lib/cart";

export function CartLineItem({ line }: { line: CartLine }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-4 border-b py-5 last:border-b-0">
      <Link href={`/product/${line.product.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {line.image && <Image src={line.image} alt={line.product.name} fill sizes="96px" className="object-cover" />}
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/product/${line.product.slug}`} className="text-sm font-medium hover:underline">
              {line.product.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {line.variant.colour} · Size {line.variant.size}
            </p>
          </div>
          <button
            aria-label="Remove item"
            disabled={pending}
            onClick={() => startTransition(() => removeCartItemAction(line.id))}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-md border">
            <button
              className="p-1.5 disabled:opacity-40"
              disabled={pending}
              onClick={() => startTransition(async () => { await updateCartItemAction(line.id, line.quantity - 1); })}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm">{line.quantity}</span>
            <button
              className="p-1.5 disabled:opacity-40"
              disabled={pending || line.quantity >= line.variant.stock_available}
              onClick={() => startTransition(async () => { await updateCartItemAction(line.id, line.quantity + 1); })}
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <p className="font-heading text-sm font-semibold text-brand-navy">
            {formatINR(line.product.price * line.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
