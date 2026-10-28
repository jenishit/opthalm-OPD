import { z } from "zod";

export const prescriptionType = ["spectacle", "medication", "combined"] as const;

export const prescriptionSchema = z.object({
  id: z.string(),
  visit_id: z.string(),
  patient_id: z.string(),
  prescription_number: z.string(),
  type: z.enum(prescriptionType),
  signed_by: z.string(),
  issued_at: z.string().datetime(),
  printed_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

export type Prescription = z.infer<typeof prescriptionSchema>;
