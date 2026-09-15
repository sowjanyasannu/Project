import Link from "next/link";
import { Heart, ShoppingBag, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/layout/search-bar";
import { AccountMenu } from "@/components/layout/account-menu";
import type { Category } from "@/types/database";

const shopLinks: { label: string; href: string }[] = [
  { label: "School Uniforms", href: "/shop/school-uniforms" },
  { label: "Corporate Uniforms", href: "/shop/corporate-uniforms" },
  { label: "Industrial Uniforms", href: "/shop/industrial-uniforms" },
  { label: "Hospitality", href: "/shop/hospitality" },
  { label: "Healthcare", href: "/shop/healthcare" },
  { label: "Sportswear", href: "/shop/sportswear" },
  { label: "Accessories", href: "/shop/accessories" },
];

const primaryNav: { label: string; href: string }[] = [
  { label: "Custom Uniforms", href: "/custom-uniforms" },
  { label: "Bulk Orders", href: "/bulk-orders" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header({
  categories,
  cartCount,
  isSignedIn,
}: {
  categories: Category[];
  cartCount: number;
  isSignedIn: boolean;
}) {
  const links = categories.length
    ? categories.map((c) => ({ label: c.name, href: `/shop/${c.slug}` }))
    : shopLinks;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
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
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                  {l.label}
                </Link>
              ))}
              <p className="mt-4 mb-1 text-xs font-semibold uppercase text-muted-foreground">Jobert</p>
              {primaryNav.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                  {l.label}
                </Link>
              ))}
              <Link href="/track-order" className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                Track Order
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

        <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
          <Link href="/shop" className="text-foreground/80 hover:text-foreground">
            Shop
          </Link>
          {primaryNav.map((l) => (
            <Link key={l.href} href={l.href} className="text-foreground/80 hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-1 sm:gap-2">
          <SearchBar className="hidden w-full max-w-xs md:block" />
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            render={<Link href="/account/wishlist" aria-label="Wishlist" />}
          >
            <Heart className="size-5" />
          </Button>
          <AccountMenu isSignedIn={isSignedIn} />
          <Button variant="ghost" size="icon" className="relative" render={<Link href="/cart" aria-label="Cart" />}>
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full bg-brand-red p-0 text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
      <div className="border-t md:hidden">
        <div className="container-app py-2">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
