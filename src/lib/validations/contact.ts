import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Tell us a little more"),
});

export type ContactInput = z.infer<typeof contactSchema>;
