import { apiFetch } from "./http";
import type {
  ConditionDTO,
  DiagnosisDTO,
  MedicineDTO,
  UpdateConditionRequest,
  UpdateDiagnosisRequest,
  UpdateMedicineRequest,
} from "@/types/api";

function list<T>(path: string, limit = 200, offset = 0): Promise<T[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<T[]>(`${path}?${params.toString()}`);
}

function search<T>(path: string, query: string, limit = 50): Promise<T[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<T[]>(`${path}/search?${params.toString()}`);
}

// ── Medicines ───────────────────────────────────────────────────────────────

export function listMedicines(limit = 200, offset = 0): Promise<MedicineDTO[]> {
  return list<MedicineDTO>("/admin/catalog/medicines", limit, offset);
}

export function searchMedicines(query: string, limit = 50): Promise<MedicineDTO[]> {
  return search<MedicineDTO>("/admin/catalog/medicines", query, limit);
}

export function getMedicine(id: string): Promise<MedicineDTO> {
  return apiFetch<MedicineDTO>(`/admin/catalog/medicines/${id}`);
}

export function updateMedicine(id: string, body: UpdateMedicineRequest): Promise<void> {
  return apiFetch<void>(`/admin/catalog/medicines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteMedicine(id: string): Promise<void> {
  return apiFetch<void>(`/admin/catalog/medicines/${id}/delete`, { method: "PATCH" });
}

// ── Diagnoses ───────────────────────────────────────────────────────────────

export function listDiagnoses(limit = 200, offset = 0): Promise<DiagnosisDTO[]> {
  return list<DiagnosisDTO>("/admin/catalog/diagnoses", limit, offset);
}

export function searchDiagnoses(query: string, limit = 50): Promise<DiagnosisDTO[]> {
  return search<DiagnosisDTO>("/admin/catalog/diagnoses", query, limit);
}

export function getDiagnosis(id: string): Promise<DiagnosisDTO> {
  return apiFetch<DiagnosisDTO>(`/admin/catalog/diagnoses/${id}`);
}

export function updateDiagnosis(id: string, body: UpdateDiagnosisRequest): Promise<void> {
  return apiFetch<void>(`/admin/catalog/diagnoses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteDiagnosis(id: string): Promise<void> {
  return apiFetch<void>(`/admin/catalog/diagnoses/${id}/delete`, { method: "PATCH" });
}

// ── Conditions (history catalog) ────────────────────────────────────────────

export function listConditions(limit = 200, offset = 0): Promise<ConditionDTO[]> {
  return list<ConditionDTO>("/admin/catalog/conditions", limit, offset);
}

export function searchConditions(query: string, limit = 50): Promise<ConditionDTO[]> {
  return search<ConditionDTO>("/admin/catalog/conditions", query, limit);
}

export function getCondition(id: string): Promise<ConditionDTO> {
  return apiFetch<ConditionDTO>(`/admin/catalog/conditions/${id}`);
}

export function updateCondition(id: string, body: UpdateConditionRequest): Promise<void> {
  return apiFetch<void>(`/admin/catalog/conditions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteCondition(id: string): Promise<void> {
  return apiFetch<void>(`/admin/catalog/conditions/${id}/delete`, { method: "PATCH" });
}
