// Shapes for the /patient endpoints. Mirrors the Go backend contract served
// at ${BACKEND_URL}/swagger/doc.json — this is the raw wire record (e.g.
// `full_name`, `dob`, `gender`), not the UI-facing `Patient` in
// schemas/patient-schema.ts (`first_name`/`last_name`, `date_of_birth`,
// `sex`). services/patients-services.ts converts between the two.

export interface Patient {
  patient_id: string;
  full_name: string;
  dob: string;
  gender: string;
  phone: string;
  occupation: string | null;
  registered_on: string;
  email: string | null;
  address: string | null;
  createdBy?: string;
  created_at: string;
}

export interface CreatePatientRequest {
  full_name: string;
  dob: string;
  gender?: string;
  phone: string;
  occupation?: string;
  email?: string;
  address?: string;
}

// PATCH /patient/:id reuses the create body (dob/full_name/phone are required).
export type UpdatePatientRequest = CreatePatientRequest & {
  email?: string;
};

// GET /patient/:id/history — every entry for the patient, newest first, each
// with its resolved condition_ids. Not the UI-facing `PatientHistory` in
// schemas/history-schema.ts, though the shapes line up field-for-field — see
// services/history-services.ts for the (trivial) conversion.
export interface PatientHistory {
  id: string;
  patient_id: string;
  uses_spectacles: boolean;
  systemic_medications?: string;
  topical_medications?: string;
  notes?: string;
  condition_ids: string[];
  created_at: string;
  created_by: string;
}

// POST /patient/:id/history — appends a new entry; entries are never updated
// or deleted, so there's no update request shape.
export interface CreatePatientHistoryRequest {
  uses_spectacles: boolean;
  systemic_medications?: string;
  topical_medications?: string;
  notes?: string;
  condition_ids: string[];
}
