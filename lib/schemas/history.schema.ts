import { z } from "zod";

export const patientHistorySchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  uses_spectacles: z.boolean().default(false),
  systemic_medications: z.string().optional(),
  topical_medications: z.string().optional(),
  notes: z.string().optional(),
  condition_ids: z.array(z.string()).default([]),
  created_at: z.string().datetime().optional(),
  created_by: z.string().optional(),
});

export const patientHistoryFormSchema = patientHistorySchema.omit({
  id: true,
  patient_id: true,
  created_at: true,
  created_by: true,
});

export type PatientHistory = z.infer<typeof patientHistorySchema>;
export type PatientHistoryFormData = z.infer<typeof patientHistoryFormSchema>;
