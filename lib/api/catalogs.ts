import { delay } from "@/lib/mock/delay";
import {
  mockConditions,
  mockDiagnoses,
  mockMedicines,
} from "@/lib/mock/data";
import type { Condition, DiagnosisCatalog, Medicine } from "@/lib/schemas/catalog.schema";

let conditions = [...mockConditions];
let diagnoses = [...mockDiagnoses];
let medicines = [...mockMedicines];

// ── Conditions ──────────────────────────────────────────────────────────────

export async function getConditions(search?: string): Promise<Condition[]> {
  await delay(100);
  if (!search) return conditions;
  const q = search.toLowerCase();
  return conditions.filter((c) => c.name.toLowerCase().includes(q));
}

export async function createCondition(name: string, category: Condition["category"] = "other"): Promise<Condition> {
  await delay();
  const newCondition: Condition = {
    id: `c${Date.now()}`,
    name,
    category,
    created_at: new Date().toISOString(),
  };
  conditions = [...conditions, newCondition];
  return newCondition;
}

// ── Diagnoses ───────────────────────────────────────────────────────────────

export async function getDiagnoses(search?: string): Promise<DiagnosisCatalog[]> {
  await delay(100);
  if (!search) return diagnoses;
  const q = search.toLowerCase();
  return diagnoses.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.icd10_code.toLowerCase().includes(q)
  );
}

export async function createDiagnosis(
  name: string,
  icd10_code: string,
  description?: string
): Promise<DiagnosisCatalog> {
  await delay();
  const newDiagnosis: DiagnosisCatalog = {
    id: `d${Date.now()}`,
    name,
    icd10_code,
    description,
    created_at: new Date().toISOString(),
  };
  diagnoses = [...diagnoses, newDiagnosis];
  return newDiagnosis;
}

// ── Medicines ───────────────────────────────────────────────────────────────

export async function getMedicines(search?: string): Promise<Medicine[]> {
  await delay(100);
  if (!search) return medicines;
  const q = search.toLowerCase();
  return medicines.filter(
    (m) =>
      m.generic_name.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q)
  );
}

export async function createMedicine(data: Omit<Medicine, "id" | "created_at">): Promise<Medicine> {
  await delay();
  const newMedicine: Medicine = {
    ...data,
    id: `m${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  medicines = [...medicines, newMedicine];
  return newMedicine;
}
