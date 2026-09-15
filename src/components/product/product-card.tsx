import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/product/wishlist-button";
import { formatINR } from "@/lib/format";
import type { ProductCardData } from "@/lib/data/catalog";

export function ProductCard({
  product,
  wished = false,
}: {
  product: ProductCardData;
  wished?: boolean;
}) {
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image yet
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_new_arrival && <Badge className="bg-brand-navy">New</Badge>}
          {product.is_best_seller && <Badge className="bg-brand-red">Bestseller</Badge>}
          {!product.in_stock && (
            <Badge variant="secondary" className="bg-white/90">
              Out of stock
            </Badge>
          )}
        </div>
        <WishlistButton
          productId={product.id}
          initialWished={wished}
          className="absolute right-2 top-2 bg-white/90 hover:bg-white"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.category && (
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {product.category.name}
          </p>
        )}
        <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
          {product.name}
        </Link>

        {product.review_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {product.rating} ({product.review_count})
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="font-heading text-base font-bold text-brand-navy">
            {formatINR(product.price)}
          </span>
          {product.mrp && product.mrp > product.price && (
            <>
              <span className="text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</span>
              <span className="text-xs font-medium text-brand-red">{discount}% off</span>
            </>
          )}
        </div>
        {product.sizes.length > 0 && (
          <p className="text-[11px] text-muted-foreground">Sizes: {product.sizes.join(", ")}</p>
        )}
      </div>
    </div>
  );
}
