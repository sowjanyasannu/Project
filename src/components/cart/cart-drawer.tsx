"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { formatINR } from "@/lib/format";
import type { CartLine } from "@/lib/cart";

export function CartDrawer({
  lines,
  subtotal,
  cartCount,
}: {
  lines: CartLine[];
  subtotal: number;
  cartCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="relative" aria-label="Cart" />}
      >
        <ShoppingBag className="size-5" />
        {cartCount > 0 && (
          <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full bg-brand-red p-0 text-[10px]">
            {cartCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Your Cart ({cartCount})</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-sm font-medium">Your cart is empty</p>
            <p className="text-xs text-muted-foreground">Browse uniforms and sportswear to get started.</p>
            <Button className="mt-2" onClick={() => setOpen(false)} render={<Link href="/shop" />}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              {lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </div>
            <SheetFooter className="border-t">
              <div className="flex justify-between text-sm font-medium">
                <span>Subtotal</span>
                <span className="font-heading text-brand-navy">{formatINR(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">GST and shipping calculated at checkout.</p>
              <Button size="lg" className="w-full" onClick={() => setOpen(false)} render={<Link href="/checkout" />}>
                Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOpen(false)}
                render={<Link href="/cart" />}
              >
                View Cart
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
