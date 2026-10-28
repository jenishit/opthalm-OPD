import { z } from "zod";

// ── Staff ───────────────────────────────────────────────────────────────────
export const staffRole = ["doctor", "optometrist", "receptionist"] as const;

export const staffSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(staffRole),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export type Staff = z.infer<typeof staffSchema>;

// ── Investigation ───────────────────────────────────────────────────────────
export const investigationType = [
  "contact_lens_trial",
  "schirmer_test",
  "foreign_body_removal",
  "other",
] as const;

export const investigationSchema = z.object({
  id: z.string().optional(),
  visit_id: z.string().optional(),
  type: z.enum(investigationType),
  investigation_name: z.string().optional(),
  status: z.enum(["ordered", "completed", "reviewed"]).optional(),
  result: z.string().optional(),
  notes: z.string().optional(),
});

export type Investigation = z.infer<typeof investigationSchema>;

// ── Patient Access Token ────────────────────────────────────────────────────
export const patientAccessTokenSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  token: z.string(),
  revoked: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
});

export type PatientAccessToken = z.infer<typeof patientAccessTokenSchema>;

// ── Composite Intake/Exam Form ──────────────────────────────────────────────
// This is the big combined schema for the entire visit intake form.
// Each section maps to a form tab.
import { patientHistoryFormSchema } from "./history-schema";
import { visitSymptomsSchema, visitDiagnosisSchema } from "./visit-schema";
import { refractionReadingSchema } from "./refraction-schema";
import { examinationFindingsSchema } from "./examination-schema";
import { treatmentSchema, followUpSchema } from "./treatment-schema";

export const intakeExamFormSchema = z.object({
  // Section 1: Chief Complaint & History
  chief_complaint: z.string().min(1, "Chief complaint is required"),
  complaint_duration: z.string().optional(),
  examined_by: z.string().optional(),
  history: patientHistoryFormSchema,

  // Section 2: Symptoms
  symptoms: visitSymptomsSchema,

  // Section 3: Vision & Refraction
  readings: z.array(refractionReadingSchema).default([]),

  // Section 4: Examination Findings
  examination: examinationFindingsSchema,

  // Section 5: Investigations
  investigations: z.array(investigationSchema).default([]),

  // Section 6: Diagnosis
  diagnoses: z.array(visitDiagnosisSchema).default([]),

  // Section 7: Treatment & Follow-up
  treatments: z.array(treatmentSchema).default([]),
  follow_up: followUpSchema.optional(),
});

export type IntakeExamFormData = z.infer<typeof intakeExamFormSchema>;
