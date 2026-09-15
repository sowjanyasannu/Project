"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  path: string;
  name: string;
  purpose: "reference" | "logo";
}

export function FileUploadField({
  draftId,
  purpose,
  label,
  description,
  files,
  onChange,
  multiple = true,
}: {
  draftId: string;
  purpose: "reference" | "logo";
  label: string;
  description: string;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    const uploaded: UploadedFile[] = [];
    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("purpose", purpose);
      formData.set("draftId", draftId);
      try {
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? `Could not upload ${file.name}`);
          continue;
        }
        uploaded.push({ path: data.path, name: data.name, purpose });
      } catch {
        toast.error(`Could not upload ${file.name}`);
      }
    }
    onChange(multiple ? [...files, ...uploaded] : uploaded);
    setUploading(false);
  }

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "mt-3 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm text-muted-foreground hover:border-brand-navy",
          uploading && "opacity-60"
        )}
      >
        {uploading ? <Loader2 className="size-6 animate-spin" /> : <UploadCloud className="size-6" />}
        {uploading ? "Uploading…" : "Tap to upload files (camera or gallery)"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {files.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {files.map((f) => (
            <li key={f.path} className="flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-xs">
              {f.name}
              <button type="button" onClick={() => onChange(files.filter((x) => x.path !== f.path))} aria-label={`Remove ${f.name}`}>
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
