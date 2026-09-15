"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "@/components/search/search-modal";
import { cn } from "@/lib/utils";

export function HeaderSearch({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search products"
        className={cn(
          "flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-brand-navy hover:text-foreground",
          className
        )}
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden truncate sm:inline">Search school shirts, jerseys, scrubs…</span>
        <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">
          ⌘K
        </kbd>
      </button>
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  );
}
