import type { VisitSymptoms, VisitDiagnosis } from "@/schemas/visit-schema";
import type { RefractionReading } from "@/schemas/refraction-schema";
import type { ExaminationFindings } from "@/schemas/examination-schema";
import type { Treatment, FollowUp } from "@/schemas/treatment-schema";

// Shapes for the /visit endpoints. Mirrors the Go backend contract served at
// ${BACKEND_URL}/swagger/doc.json — this is the raw wire record (`examine_by`
// as a joined {id, name} ref), not the UI-facing `Visit` in
// schemas/visit-schema.ts (`examined_by` as a flat display name).
// services/visits-services.ts converts between the two.

export type PatientVisitStatus = "scheduled" | "waiting" | "examining" | "completed" | "cancelled";

export interface EntityRef {
  id: string;
  name: string;
}

export type PatientRef = {
  id: string;
  name: string;
};

export interface VisitItem {
  id: string;
  examine_by: EntityRef;
  status: PatientVisitStatus;
  visit_date: string;
  chief_complaint: string;
  created_by: EntityRef;
  updated_by: EntityRef;
  created_at: string;
  updated_at: string;
}

export interface Visit extends VisitItem {
  patient: PatientRef;
}

export interface PatientVisits {
  patient: PatientRef;
  visits: VisitItem[];
}

// POST /visit → examine_by comes back as the plain string that was sent.
export interface VisitCreate {
  id: string;
  patient_id: string;
  examine_by: string;
  status: PatientVisitStatus;
  visit_date: string;
  chief_complaint: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

// POST /visit and PATCH /visit/:id both take this shape (PATCH reuses it).
export interface VisitUpsertRequest {
  patient_id: string;
  examine_by: string;
  status: PatientVisitStatus;
  visit_date: string;
  chief_complaint: string;
}

/**
 * Shape returned by GET /visit/:id/clinical — the whole chart in one call.
 * These sub-documents have no wire/UI shape mismatch, so they reuse the
 * UI-facing schema types directly instead of a separate raw record.
 */
export interface VisitClinical {
  symptoms: VisitSymptoms | null;
  readings: RefractionReading[];
  examination: ExaminationFindings | null;
  diagnoses: VisitDiagnosis[];
  treatments: Treatment[];
  follow_up: FollowUp | null;
}
