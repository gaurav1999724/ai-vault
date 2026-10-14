import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(180),
  subject: z.string().trim().min(2).max(140),
  message: z.string().trim().min(10).max(5000),
  company: z.string().max(200).optional().default(""),
  startedAt: z.coerce.number().int().positive(),
});

export type ContactInput = z.infer<typeof contactSchema>;
