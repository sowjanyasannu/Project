"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { addProductImageAction, deleteProductImageAction } from "@/lib/admin/products";

export function ImageManager({ productId, images }: { productId: string; images: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("productId", productId);
      const res = await fetch("/api/admin/upload-product-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? `Could not upload ${file.name}`);
        continue;
      }
      await addProductImageAction(productId, data.url);
    }
    setUploading(false);
  }

  return (
    <div className="rounded-xl border bg-background p-6">
      <p className="mb-4 text-sm font-semibold">Product Images</p>
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative size-24 overflow-hidden rounded-lg border">
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            <button
              onClick={() => startTransition(() => deleteProductImageAction(url, productId))}
              className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5"
              aria-label="Remove image"
              disabled={pending}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground hover:border-brand-navy"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />}
          <span className="text-[10px]">Upload</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
