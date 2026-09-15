"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { ProductCardData } from "@/lib/data/catalog";

const POPULAR_SEARCHES = ["School Shirt", "Trousers", "Tracksuit", "Sweater", "PE Kit", "Blazer"];

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [rawResults, setRawResults] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;
  const results = trimmed.length >= 2 ? rawResults : [];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setRawResults(data.products ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmed]);

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div
        className="relative mx-auto mt-[10vh] w-full max-w-2xl px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
      >
        <div className="overflow-hidden rounded-xl bg-popover shadow-2xl">
          <div className="flex items-center border-b px-4">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search school shirts, jerseys, scrubs…"
              aria-label="Search products"
              className="flex-1 border-0 bg-transparent px-4 py-4 text-base outline-none placeholder:text-muted-foreground/60"
            />
            {hasQuery ? (
              <button
                onClick={() => setQuery("")}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
                ESC
              </kbd>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </div>
            )}

            {!loading && hasQuery && results.length > 0 && (
              <div className="p-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      {product.category && (
                        <p className="text-xs text-muted-foreground">{product.category.name}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-brand-navy">
                      {formatINR(product.price)}
                    </span>
                  </Link>
                ))}
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="mt-1 flex items-center justify-center gap-2 rounded-lg p-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  View all results
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}

            {!loading && hasQuery && results.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">No results for &quot;{query}&quot;</p>
              </div>
            )}

            {!hasQuery && (
              <div className="p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-brand-navy hover:bg-muted"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
