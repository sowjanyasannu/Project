"use client";

import { useEffect } from "react";

const STORAGE_KEY = "jobert_recently_viewed_v1";
const MAX_ITEMS = 8;

export function RecentlyViewedTracker({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private mode, etc.) — recently viewed is a nicety, skip silently.
    }
  }, [productId]);

  return null;
}
