import Link from "next/link";
import { Heart, Menu, Phone, PackageSearch, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HeaderSearch } from "@/components/layout/header-search";
import { AccountMenu } from "@/components/layout/account-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";
import type { CategoryWithChildren } from "@/lib/data/site";
import type { CartLine } from "@/lib/cart";

const primaryNav: { label: string; href: string }[] = [
  { label: "Custom Uniforms", href: "/custom-uniforms" },
  { label: "Bulk Orders", href: "/bulk-orders" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header({
  categories,
  cart,
  isSignedIn,
  phone,
}: {
  categories: CategoryWithChildren[];
  cart: { lines: CartLine[]; subtotal: number; count: number };
  isSignedIn: boolean;
  phone?: string | null;
}) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="hidden border-b bg-brand-navy text-white lg:block">
        <div className="container-app flex h-9 items-center justify-between text-xs">
          <div>{phone && <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-white/80"><Phone className="size-3" /> {phone}</a>}</div>
          <div className="flex items-center gap-5">
            <Link href="/account" className="hover:text-white/80">My Account</Link>
            <Link href="/account/wishlist" className="hover:text-white/80">Wish List</Link>
            <Link href="/shop" className="hover:text-white/80">Shopping</Link>
            <Link href="/cart" className="hover:text-white/80">Cart</Link>
            <Link href="/checkout" className="hover:text-white/80">Checkout</Link>
          </div>
        </div>
      </div>

      <div className="border-b">
        <div className="container-app flex h-16 items-center gap-4">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-heading text-brand-navy">Jobert Apparels</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <p className="mt-2 mb-1 text-xs font-semibold uppercase text-muted-foreground">Shop</p>
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <Link href={`/shop/${cat.slug}`} className="block rounded-md px-2 py-2 text-sm font-medium hover:bg-muted">
                      {cat.name}
                    </Link>
                    {cat.children.length > 0 && (
                      <div className="ml-3 flex flex-col gap-1 border-l pl-3">
                        {cat.children.map((child) => (
                          <Link key={child.id} href={`/shop/${child.slug}`} className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <p className="mt-4 mb-1 text-xs font-semibold uppercase text-muted-foreground">Jobert</p>
                {primaryNav.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                    {l.label}
                  </Link>
                ))}
                <Link href="/track-order" className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm hover:bg-muted">
                  <PackageSearch className="size-3.5" /> Track Order
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold text-brand-navy shrink-0">
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-navy text-sm font-extrabold text-white">
              JA
            </span>
            <span className="hidden sm:inline">Jobert Apparels</span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
            <Link href="/" className="rounded-md px-3 py-2 text-foreground/80 hover:bg-muted hover:text-foreground">
              Home
            </Link>
            {categories.map((cat) =>
              cat.children.length > 0 ? (
                <div key={cat.id} className="group relative">
                  <Link
                    href={`/shop/${cat.slug}`}
                    className="flex items-center gap-1 rounded-md px-3 py-2 text-foreground/80 hover:bg-muted hover:text-foreground"
                  >
                    {cat.name} <ChevronDown className="size-3.5" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-48 rounded-lg border bg-popover p-2 opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                    {cat.children.map((child) => (
                      <Link key={child.id} href={`/shop/${child.slug}`} className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground">
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={cat.id} href={`/shop/${cat.slug}`} className="rounded-md px-3 py-2 text-foreground/80 hover:bg-muted hover:text-foreground">
                  {cat.name}
                </Link>
              )
            )}
            {primaryNav.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-foreground/80 hover:bg-muted hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <HeaderSearch className="hidden w-full max-w-xs md:flex" />
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              render={<Link href="/account/wishlist" aria-label="Wishlist" />}
            >
              <Heart className="size-5" />
            </Button>
            <AccountMenu isSignedIn={isSignedIn} />
            <CartDrawer lines={cart.lines} subtotal={cart.subtotal} cartCount={cart.count} />
          </div>
        </div>
        <div className="border-t md:hidden">
          <div className="container-app py-2">
            <HeaderSearch className="w-full" />
          </div>
        </div>
      </div>
    </header>
  );
}
