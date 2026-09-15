import { z } from "zod";

export const addressSchema = z.object({
  full_name: z.string().min(2, "Enter the recipient's name"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().min(5, "Enter the address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a city"),
  state: z.string().min(2, "Enter a state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export const checkoutSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.email(),
  customer_phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  shipping_address: addressSchema,
  billing_same_as_shipping: z.boolean(),
  billing_address: addressSchema.optional(),
  coupon_code: z.string().optional(),
  customer_notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
