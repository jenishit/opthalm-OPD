import { apiFetch } from "./http";
import type {
  Condition as ConditionRecord,
  Diagnosis,
  Medicine as MedicineRecord,
  UpdateConditionRequest,
  UpdateDiagnosisRequest,
  UpdateMedicineRequest,
} from "@/types/catalog-types";
import type { Condition, DiagnosisCatalog, Medicine, MedicineFormData } from "@/schemas/catalog-schema";
import { medicineFormOptions } from "@/schemas/catalog-schema";

function list<T>(path: string, limit = 200, offset = 0): Promise<T[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<T[]>(`${path}?${params.toString()}`);
}

function search<T>(path: string, query: string, limit = 50): Promise<T[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<T[]>(`${path}/search?${params.toString()}`);
}

// ── Medicines ───────────────────────────────────────────────────────────────

export function listMedicines(limit = 200, offset = 0): Promise<MedicineRecord[]> {
  return list<MedicineRecord>("/admin/catalog/medicines", limit, offset);
}

export function searchMedicines(query: string, limit = 50): Promise<MedicineRecord[]> {
  return search<MedicineRecord>("/admin/catalog/medicines", query, limit);
}

export function getMedicine(id: string): Promise<MedicineRecord> {
  return apiFetch<MedicineRecord>(`/admin/catalog/medicines/${id}`);
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

export function listDiagnoses(limit = 200, offset = 0): Promise<Diagnosis[]> {
  return list<Diagnosis>("/admin/catalog/diagnoses", limit, offset);
}

export function searchDiagnoses(query: string, limit = 50): Promise<Diagnosis[]> {
  return search<Diagnosis>("/admin/catalog/diagnoses", query, limit);
}

export function getDiagnosis(id: string): Promise<Diagnosis> {
  return apiFetch<Diagnosis>(`/admin/catalog/diagnoses/${id}`);
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

export function listConditions(limit = 200, offset = 0): Promise<ConditionRecord[]> {
  return list<ConditionRecord>("/admin/catalog/conditions", limit, offset);
}

export function searchConditions(query: string, limit = 50): Promise<ConditionRecord[]> {
  return search<ConditionRecord>("/admin/catalog/conditions", query, limit);
}

export function getCondition(id: string): Promise<ConditionRecord> {
  return apiFetch<ConditionRecord>(`/admin/catalog/conditions/${id}`);
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


function toUiCondition(dto: ConditionRecord): Condition {
  return { id: dto.id, name: dto.name, category: "other", created_at: dto.created_at };
}

function toUiDiagnosis(dto: Diagnosis): DiagnosisCatalog {
  return {
    id: dto.id,
    name: dto.name,
    icd10_code: dto.icd10_code,
    created_at: dto.created_at,
  };
}

type MedicineForm = (typeof medicineFormOptions)["form"][number];

function toUiMedicine(dto: MedicineRecord): Medicine {
  const normalized = (dto.form ?? "").toLowerCase();
  const form = (medicineFormOptions.form as readonly string[]).includes(normalized)
    ? (normalized as MedicineForm)
    : "tablet";
  return {
    id: dto.id,
    generic_name: dto.medicine_name,
    brand: dto.brand_name,
    strength: dto.strength,
    form,
    created_at: dto.created_at,
  };
}

const localConditions: Condition[] = [];
const localDiagnoses: DiagnosisCatalog[] = [];
const localMedicines: Medicine[] = [];

export async function getConditions(search?: string): Promise<Condition[]> {
  const remote = search ? await searchConditions(search) : await listConditions();
  const q = search ? search.toLowerCase() : null;
  const local = q
    ? localConditions.filter((c) => c.name.toLowerCase().includes(q))
    : localConditions;
  return [...local, ...remote.map(toUiCondition)];
}

export async function createCondition(
  name: string,
  category: Condition["category"] = "other"
): Promise<Condition> {
  const newCondition: Condition = {
    id: `c${Date.now()}`,
    name,
    category,
    created_at: new Date().toISOString(),
  };
  localConditions.push(newCondition);
  return newCondition;
}

export async function getDiagnoses(search?: string): Promise<DiagnosisCatalog[]> {
  const remote = search ? await searchDiagnoses(search) : await listDiagnoses();
  const q = search ? search.toLowerCase() : null;
  const local = q
    ? localDiagnoses.filter(
      (d) => d.name.toLowerCase().includes(q) || d.icd10_code.toLowerCase().includes(q)
    )
    : localDiagnoses;
  return [...local, ...remote.map(toUiDiagnosis)];
}

export async function createDiagnosis(
  name: string,
  icd10_code: string,
  description?: string
): Promise<DiagnosisCatalog> {
  const newDiagnosis: DiagnosisCatalog = {
    id: `d${Date.now()}`,
    name,
    icd10_code,
    description,
    created_at: new Date().toISOString(),
  };
  localDiagnoses.push(newDiagnosis);
  return newDiagnosis;
}

export async function getMedicines(search?: string): Promise<Medicine[]> {
  const remote = search ? await searchMedicines(search) : await listMedicines();
  const q = search ? search.toLowerCase() : null;
  const local = q
    ? localMedicines.filter(
      (m) => m.generic_name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q)
    )
    : localMedicines;
  return [...local, ...remote.map(toUiMedicine)];
}

export async function createMedicine(data: MedicineFormData): Promise<Medicine> {
  const newMedicine: Medicine = {
    ...data,
    id: `m${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  localMedicines.push(newMedicine);
  return newMedicine;
}
