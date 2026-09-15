import { randomUUID } from "node:crypto";
import { CustomRequestWizard } from "@/components/custom-wizard/wizard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CustomizationOption, GarmentOption } from "@/types/database";

export const metadata = {
  title: "Bulk Orders",
  description: "Uniforms for your entire organization — schools, companies, hospitals, hotels and sports teams.",
};

export default async function BulkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productSlug } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const [{ data: customizationOptions }, { data: garmentOptions }, productResult] = await Promise.all([
    supabase.from("customization_options").select("*").eq("is_active", true).order("display_order"),
    supabase.from("garment_options").select("*").eq("is_active", true).order("display_order"),
    productSlug
      ? supabase.from("products").select("id").eq("slug", productSlug).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="container-app py-12">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-brand-navy">Uniforms for Your Entire Organization</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Schools, companies, hospitals, hotels, factories and sports teams — tell us what you need and we&apos;ll
          send a bulk quotation.
        </p>
      </div>
      <CustomRequestWizard
        requestType="bulk_order"
        draftId={randomUUID()}
        customizationOptions={(customizationOptions as CustomizationOption[]) ?? []}
        garmentOptions={(garmentOptions as GarmentOption[]) ?? []}
        sourceProductId={productResult?.data?.id}
      />
    </div>
  );
}
