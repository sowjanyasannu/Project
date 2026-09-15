import { ProductCard } from "@/components/product/product-card";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";
import { SortSelect } from "@/components/shop/sort-select";
import { PaginationControls } from "@/components/shop/pagination-controls";
import { getProducts, type CatalogFilters } from "@/lib/data/catalog";
import { getWishlistProductIds } from "@/lib/wishlist";

export type ShopSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function ShopPageContent({
  heading,
  description,
  categorySlug,
  searchParams,
  basePath,
}: {
  heading: string;
  description?: string;
  categorySlug?: string;
  searchParams: ShopSearchParams;
  basePath: string;
}) {
  const filters: CatalogFilters = {
    categorySlug,
    gender: first(searchParams.gender),
    size: first(searchParams.size),
    colour: first(searchParams.colour),
    search: first(searchParams.search),
    minPrice: first(searchParams.minPrice) ? Number(first(searchParams.minPrice)) : undefined,
    maxPrice: first(searchParams.maxPrice) ? Number(first(searchParams.maxPrice)) : undefined,
    sort: (first(searchParams.sort) as CatalogFilters["sort"]) ?? "relevance",
    page: first(searchParams.page) ? Number(first(searchParams.page)) : 1,
  };

  const [{ products, total, page, pageSize }, wishlistedIds] = await Promise.all([
    getProducts(filters),
    getWishlistProductIds(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const flatParams: Record<string, string | undefined> = {
    gender: filters.gender,
    size: filters.size,
    colour: filters.colour,
    search: filters.search,
    minPrice: filters.minPrice?.toString(),
    maxPrice: filters.maxPrice?.toString(),
    sort: filters.sort,
  };

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-brand-navy">{heading}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <FiltersSidebar />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{total} products</p>
            <SortSelect />
          </div>

          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
              No products match these filters yet. Try clearing a filter or check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} wished={wishlistedIds.includes(product.id)} />
              ))}
            </div>
          )}

          <PaginationControls page={page} totalPages={totalPages} basePath={basePath} searchParams={flatParams} />
        </div>
      </div>
    </div>
  );
}
