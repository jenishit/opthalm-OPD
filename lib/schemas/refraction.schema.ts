import { z } from "zod";

export const eye = ["OD", "OS"] as const;
export type Eye = (typeof eye)[number];

export const refractionStage = [
  "unaided",
  "old_rx",
  "pinhole",
  "retinoscopy",
  "subjective_acceptance",
  "final_rx",
] as const;
export type RefractionStage = (typeof refractionStage)[number];

export const lensType = [
  "single_vision",
  "bifocal",
  "progressive",
  "contact_lens",
  "none",
] as const;

export const refractionReadingSchema = z.object({
  id: z.string().optional(),
  visit_id: z.string().optional(),
  created_at: z.string().datetime().optional(),
  eye: z.enum(eye),
  stage: z.enum(refractionStage),
  sphere: z.coerce.number().optional(),
  cylinder: z.coerce.number().optional(),
  axis: z.coerce.number().min(0).max(180).optional(),
  add_power: z.coerce.number().optional(),
  va: z.string().optional(), // e.g. "6/6", "6/12"
  pd: z.coerce.number().optional(),
  lens_type: z.enum(lensType).optional(),
});

export type RefractionReading = z.infer<typeof refractionReadingSchema>;

export const refractionFormSchema = z.object({
  readings: z.array(refractionReadingSchema).default([]),
});

export type RefractionFormData = z.infer<typeof refractionFormSchema>;
