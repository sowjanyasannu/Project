import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types/database";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="container-app py-14">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-brand-navy sm:text-3xl">Shop by Category</h2>
          <p className="mt-1 text-sm text-muted-foreground">Built for schools, companies, hospitals and teams.</p>
        </div>
        <Link href="/shop" className="hidden text-sm font-medium text-brand-navy hover:underline sm:block">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop/${category.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
          >
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-brand-navy" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-heading text-base font-bold text-white sm:text-lg">{category.name}</p>
              {category.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-white/80">{category.description}</p>
              )}
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white">
                View Collection <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
