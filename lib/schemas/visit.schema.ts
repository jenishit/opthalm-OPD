import { z } from "zod";

export const laterality = ["OD", "OS", "OU", "none"] as const;
export type Laterality = (typeof laterality)[number];

export const visitStatus = [
  "scheduled",
  "waiting",
  "examining",
  "completed",
  "cancelled",
] as const;
export type VisitStatus = (typeof visitStatus)[number];

// ── Visit ───────────────────────────────────────────────────────────────────
export const visitSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  examined_by: z.string().optional(),
  status: z.enum(visitStatus).default("scheduled"),
  visit_date: z.string(),
  chief_complaint: z.string().min(1, "Chief complaint is required"),
  complaint_duration: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Visit = z.infer<typeof visitSchema>;

// ── Symptoms ────────────────────────────────────────────────────────────────
export const symptomLateralitySchema = z.enum(laterality).default("none");

export const visitSymptomsSchema = z.object({
  id: z.string().optional(),
  visit_id: z.string().optional(),
  foreign_body_sensation: symptomLateralitySchema,
  redness: symptomLateralitySchema,
  swelling: symptomLateralitySchema,
  diminished_distance_vision: symptomLateralitySchema,
  diminished_near_vision: symptomLateralitySchema,
  blurring: symptomLateralitySchema,
  headache: symptomLateralitySchema,
  eye_pain: symptomLateralitySchema,
  watery_eyes: symptomLateralitySchema,
  discharge: symptomLateralitySchema,
  itching: symptomLateralitySchema,
  photophobia: symptomLateralitySchema,
  floaters: symptomLateralitySchema,
  flashes: symptomLateralitySchema,
  double_vision: symptomLateralitySchema,
  recent_fever: z.boolean().default(false),
});

export type VisitSymptoms = z.infer<typeof visitSymptomsSchema>;

// ── Visit Diagnosis (joined from catalog) ───────────────────────────────────
export const visitDiagnosisSchema = z.object({
  id: z.string().optional(),
  visit_id: z.string().optional(),
  diagnosis_id: z.string().min(1, "Diagnosis is required"),
  diagnosis_name: z.string().optional(),
  icd10_code: z.string().optional(),
  laterality: z.enum(laterality).default("OU"),
  status: z.enum(["provisional", "confirmed", "resolved"]).optional(),
});

export type VisitDiagnosis = z.infer<typeof visitDiagnosisSchema>;

// ── Visit form schema (partial — chief complaint + symptoms) ────────────────
export const visitFormSchema = z.object({
  chief_complaint: z.string().min(1, "Chief complaint is required"),
  complaint_duration: z.string().optional(),
  examined_by: z.string().optional(),
  symptoms: visitSymptomsSchema,
  diagnoses: z.array(visitDiagnosisSchema).default([]),
});

export type VisitFormData = z.infer<typeof visitFormSchema>;
