import { z } from "zod";

// { size: "24", Boys: 10, Girls: 8 } — group keys are dynamic (Boys/Girls,
// Male/Female, or a single "Quantity" column) depending on the wearer type
// selected in the wizard.
export const sizeQuantityRowSchema = z.object({ size: z.string() }).catchall(z.coerce.number().int().min(0));

export const customRequestMeasurementSchema = z.object({
  garment_type: z.string(),
  unit: z.enum(["cm", "inch"]),
  measurements: z.record(z.string(), z.coerce.number()),
});

export const customRequestSchema = z.object({
  request_type: z.enum(["custom_uniform", "bulk_order"]),
  customer_name: z.string().min(2, "Enter your name"),
  organization_name: z.string().optional(),
  email: z.email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  whatsapp_number: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  uniform_type: z.string().min(2, "Select a uniform type"),
  wearer_type: z.string().optional(),
  garments: z.array(z.string()).min(1, "Select at least one garment"),
  customization_options: z.array(z.string()).default([]),
  fabric_preference: z.string().optional(),
  colour_preference: z.string().optional(),
  branding_placement: z.string().optional(),
  branding_method: z.string().optional(),
  measurement_mode: z.enum(["standard", "custom"]).optional(),
  size_quantity_matrix: z.array(sizeQuantityRowSchema).default([]),
  measurements: z.array(customRequestMeasurementSchema).default([]),
  delivery_date: z.string().optional(),
  delivery_location: z.string().optional(),
  additional_notes: z.string().max(1000).optional(),
  source_product_id: z.uuid().optional(),
  uploaded_file_urls: z
    .array(z.object({ url: z.string(), name: z.string().optional(), purpose: z.enum(["reference", "logo"]) }))
    .default([]),
});

export type CustomRequestInput = z.infer<typeof customRequestSchema>;
