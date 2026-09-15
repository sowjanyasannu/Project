"use client";

import { useEffect, useState } from "react";
import { ProductRail } from "@/components/home/product-rail";
import type { ProductCardData } from "@/lib/data/catalog";

const STORAGE_KEY = "jobert_recently_viewed_v1";

export function RecentlyViewed({ excludeProductId }: { excludeProductId?: string }) {
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    let ids: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      ids = raw ? JSON.parse(raw) : [];
    } catch {
      return;
    }
    ids = ids.filter((id) => id !== excludeProductId);
    if (ids.length === 0) return;

    fetch("/api/products/by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {});
  }, [excludeProductId]);

  if (products.length === 0) return null;

  return <ProductRail title="Recently Viewed" products={products} />;
}
