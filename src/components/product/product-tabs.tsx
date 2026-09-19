import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/types/database";

export function ProductTabs({
  product,
}: {
  product: Pick<Product, "description" | "fabric" | "care_instructions" | "gst_percent" | "rating" | "review_count">;
}) {
  return (
    <Tabs defaultValue="description" className="mt-14">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
        {["description", "specifications", "delivery", "reviews"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="rounded-md border data-[state=active]:border-brand-navy data-[state=active]:bg-brand-navy data-[state=active]:text-white capitalize"
          >
            {tab === "reviews" ? `Reviews (${product.review_count})` : tab}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="description" className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-foreground/90">
        <p>{product.description || "Description coming soon."}</p>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6 max-w-3xl space-y-2 text-sm">
        <dl className="divide-y rounded-lg border">
          <div className="flex justify-between p-3"><dt className="text-muted-foreground">Fabric</dt><dd>{product.fabric ?? "—"}</dd></div>
          <div className="flex justify-between p-3"><dt className="text-muted-foreground">GST</dt><dd>{product.gst_percent}%</dd></div>
          <div className="flex justify-between p-3"><dt className="text-muted-foreground">Care Instructions</dt><dd>{product.care_instructions ?? "Machine wash cold, do not bleach."}</dd></div>
        </dl>
      </TabsContent>

      <TabsContent value="delivery" className="mt-6 max-w-3xl space-y-3 text-sm text-foreground/90">
        <p>Standard delivery in 5–8 business days across India; bulk and custom orders follow the timeline confirmed in your quotation.</p>
        <p>Need a return or exchange? See our <a href="/return-policy" className="underline">Return Policy</a>.</p>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6 max-w-3xl space-y-6">
        {product.review_count > 0 ? (
          <div className="flex items-center gap-4">
            <p className="font-heading text-4xl font-bold text-brand-navy">{product.rating}</p>
            <div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`size-4 ${s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{product.review_count} reviews</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
