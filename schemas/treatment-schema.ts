import { z } from "zod";

export const treatmentType = ["medicine", "procedure", "advice"] as const;

export const frequencyOptions = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 2 hours",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "As needed",
  "At bedtime",
  "Before meals",
  "After meals",
] as const;

export const routeOptions = [
  "Topical",
  "Oral",
  "Subconjunctival",
  "Intravitreal",
  "Intravenous",
  "Intramuscular",
] as const;

export const treatmentSchema = z.object({
  id: z.string().optional(),
  visit_id: z.string().optional(),
  type: z.enum(treatmentType),
  medicine_id: z.string().optional(),
  medicine_name: z.string().optional(),
  procedure_name: z.string().optional(),
  advice_text: z.string().optional(),
  route: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
});

export type Treatment = z.infer<typeof treatmentSchema>;

export const followUpSchema = z.object({
  id: z.string().optional(),
  visit_id: z.string().optional(),
  follow_up_date: z.string().min(1, "Follow-up date is required"),
  reason: z.string().optional(),
  reminder_sent_at: z.string().datetime().nullable().optional(),
});

export type FollowUp = z.infer<typeof followUpSchema>;

export const treatmentFormSchema = z.object({
  treatments: z.array(treatmentSchema).default([]),
  follow_up: followUpSchema.optional(),
});

export type TreatmentFormData = z.infer<typeof treatmentFormSchema>;
