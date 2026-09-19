"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/database";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const shown = images.length > 0 ? images : null;

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
        {shown ? (
          <Image
            src={shown[active].url}
            alt={shown[active].alt_text ?? productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Product photography coming soon
          </div>
        )}
      </div>
      {shown && shown.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {shown.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border-2",
                i === active ? "border-brand-navy" : "border-transparent"
              )}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
