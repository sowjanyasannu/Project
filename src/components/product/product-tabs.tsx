import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/product/review-form";
import { formatDate } from "@/lib/format";
import type { Product, Review } from "@/types/database";

export function ProductTabs({
  product,
  reviews,
}: {
  product: Pick<Product, "id" | "slug" | "description" | "fabric" | "care_instructions" | "gst_rate">;
  reviews: Review[];
}) {
  const approved = reviews.filter((r) => r.is_approved);
  const avgRating = approved.length
    ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / approved.length) * 10) / 10
    : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: approved.filter((r) => r.rating === star).length,
  }));

  return (
    <Tabs defaultValue="description" className="mt-14">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
        {["description", "specifications", "delivery", "reviews"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="rounded-md border data-[state=active]:border-brand-navy data-[state=active]:bg-brand-navy data-[state=active]:text-white capitalize"
          >
            {tab === "reviews" ? `Reviews (${approved.length})` : tab}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="description" className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-foreground/90">
        <p>{product.description || "Description coming soon."}</p>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6 max-w-3xl space-y-2 text-sm">
        <dl className="divide-y rounded-lg border">
          <div className="flex justify-between p-3"><dt className="text-muted-foreground">Fabric</dt><dd>{product.fabric ?? "—"}</dd></div>
          <div className="flex justify-between p-3"><dt className="text-muted-foreground">GST</dt><dd>{product.gst_rate}%</dd></div>
          <div className="flex justify-between p-3"><dt className="text-muted-foreground">Care Instructions</dt><dd>{product.care_instructions ?? "Machine wash cold, do not bleach."}</dd></div>
        </dl>
      </TabsContent>

      <TabsContent value="delivery" className="mt-6 max-w-3xl space-y-3 text-sm text-foreground/90">
        <p>Standard delivery in 5–8 business days across India; bulk and custom orders follow the timeline confirmed in your quotation.</p>
        <p>Need a return or exchange? See our <a href="/return-policy" className="underline">Return Policy</a>.</p>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6 max-w-3xl space-y-6">
        {approved.length > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="text-center">
              <p className="font-heading text-4xl font-bold text-brand-navy">{avgRating}</p>
              <div className="flex justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`size-4 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{approved.length} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{d.star}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${approved.length ? (d.count / approved.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {approved.length === 0 && (
            <p className="text-sm text-muted-foreground">No reviews yet — be the first to share your experience.</p>
          )}
          {approved.map((review) => (
            <div key={review.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`size-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                ))}
                {review.is_verified_purchase && (
                  <Badge variant="secondary" className="text-[10px]">Verified Purchase</Badge>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
              </div>
              {review.title && <p className="mt-2 text-sm font-medium">{review.title}</p>}
              {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </div>

        <ReviewForm productId={product.id} productSlug={product.slug} />
      </TabsContent>
    </Tabs>
  );
}
