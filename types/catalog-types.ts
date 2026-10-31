// Shapes for the /admin/catalog endpoints (medicines, diagnoses, history
// conditions). Mirrors the Go backend contract served at
// ${BACKEND_URL}/swagger/doc.json — these are the raw wire records
// (`medicine_name`/`brand_name`, no `category` on a condition), not the
// UI-facing types in schemas/catalog-schema.ts (`generic_name`/`brand`, with
// `category`). services/catalog-services.ts converts between the two.

export interface Medicine {
  id: string;
  medicine_name: string;
  brand_name: string;
  strength: string;
  form: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateMedicineRequest {
  medicine_name?: string;
  brand_name?: string;
  strength?: string;
  form?: string;
}

export interface Diagnosis {
  id: string;
  name: string;
  icd10_code: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateDiagnosisRequest {
  name?: string;
  icd10_code?: string;
}

export interface HistoryCondition {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type Condition = HistoryCondition;

export interface UpdateConditionRequest {
  name?: string;
}
