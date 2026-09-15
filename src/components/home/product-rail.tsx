import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/data/catalog";

export function ProductRail({
  title,
  subtitle,
  products,
  viewAllHref,
  wishlistedIds = [],
}: {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  viewAllHref?: string;
  wishlistedIds?: string[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="container-app py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-brand-navy sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="hidden text-sm font-medium text-brand-navy hover:underline sm:block">
            View all
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} wished={wishlistedIds.includes(product.id)} />
        ))}
      </div>
    </section>
  );
}
