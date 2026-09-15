import { randomUUID } from "node:crypto";
import { CustomRequestWizard } from "@/components/custom-wizard/wizard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CustomizationOption, GarmentOption } from "@/types/database";

export const metadata = {
  title: "Customize Your Uniform",
  description: "Share your logo, design or reference image and let Jobert Apparels create a custom uniform for you.",
};

export default async function CustomUniformsPage({
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
        <h1 className="font-heading text-3xl font-bold text-brand-navy">Customize Your Uniform</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Share your logo, reference image or design and our team will get back to you with a quotation.
        </p>
      </div>
      <CustomRequestWizard
        requestType="custom_uniform"
        draftId={randomUUID()}
        customizationOptions={(customizationOptions as CustomizationOption[]) ?? []}
        garmentOptions={(garmentOptions as GarmentOption[]) ?? []}
        sourceProductId={productResult?.data?.id}
      />
    </div>
  );
}
