"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const GENDERS = ["men", "women", "boys", "girls", "unisex"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "24", "26", "28", "30", "32", "34"];
const PRICE_BANDS = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1000", min: 500, max: 1000 },
  { label: "₹1000 – ₹2000", min: 1000, max: 2000 },
  { label: "Above ₹2000", min: 2000, max: undefined },
];

export function FiltersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeGender = searchParams.get("gender") ?? "";
  const activeSize = searchParams.get("size") ?? "";
  const activeMin = searchParams.get("minPrice") ?? "";

  return (
    <aside className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Gender</p>
        <div className="space-y-2">
          {GENDERS.map((g) => (
            <label key={g} className="flex items-center gap-2 text-sm capitalize">
              <Checkbox checked={activeGender === g} onCheckedChange={() => setParam("gender", activeGender === g ? undefined : g)} />
              {g}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setParam("size", activeSize === s ? undefined : s)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                activeSize === s ? "border-brand-navy bg-brand-navy text-white" : "hover:border-brand-navy"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Price</p>
        <div className="space-y-2">
          {PRICE_BANDS.map((band) => (
            <label key={band.label} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={activeMin === String(band.min)}
                onCheckedChange={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (activeMin === String(band.min)) {
                    params.delete("minPrice");
                    params.delete("maxPrice");
                  } else {
                    params.set("minPrice", String(band.min));
                    if (band.max) params.set("maxPrice", String(band.max));
                    else params.delete("maxPrice");
                  }
                  params.delete("page");
                  router.push(`${pathname}?${params.toString()}`);
                }}
              />
              {band.label}
            </label>
          ))}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => router.push(pathname)}>
        Clear filters
      </Button>
    </aside>
  );
}
