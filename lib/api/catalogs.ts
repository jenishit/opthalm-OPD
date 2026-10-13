import type {
  Condition,
  DiagnosisCatalog,
  Medicine,
  MedicineFormData,
} from "@/lib/schemas/catalog.schema";
import { medicineFormOptions } from "@/lib/schemas/catalog.schema";
import {
  listConditions,
  searchConditions,
  listDiagnoses,
  searchDiagnoses,
  listMedicines,
  searchMedicines,
} from "@/services/catalog";

// ── DTO → UI mappers ────────────────────────────────────────────────────────

function toUiCondition(dto: {
  id: string;
  name: string;
  created_at: string;
}): Condition {
  return { id: dto.id, name: dto.name, category: "other", created_at: dto.created_at };
}

function toUiDiagnosis(dto: {
  id: string;
  name: string;
  icd10_code: string;
  created_at: string;
}): DiagnosisCatalog {
  return {
    id: dto.id,
    name: dto.name,
    icd10_code: dto.icd10_code,
    created_at: dto.created_at,
  };
}

type MedicineForm = (typeof medicineFormOptions)["form"][number];

function toUiMedicine(dto: {
  id: string;
  medicine_name: string;
  brand_name: string;
  strength: string;
  form: string;
  created_at: string;
}): Medicine {
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

/**
 * The backend has no catalog-create endpoints yet — new entries are kept in
 * memory and merged into list results until POST endpoints exist.
 */
const localConditions: Condition[] = [];
const localDiagnoses: DiagnosisCatalog[] = [];
const localMedicines: Medicine[] = [];

// ── Conditions ──────────────────────────────────────────────────────────────

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

// ── Diagnoses ───────────────────────────────────────────────────────────────

export async function getDiagnoses(search?: string): Promise<DiagnosisCatalog[]> {
  const remote = search ? await searchDiagnoses(search) : await listDiagnoses();
  const q = search ? search.toLowerCase() : null;
  const local = q
    ? localDiagnoses.filter(
        (d) =>
          d.name.toLowerCase().includes(q) || d.icd10_code.toLowerCase().includes(q)
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

// ── Medicines ───────────────────────────────────────────────────────────────

export async function getMedicines(search?: string): Promise<Medicine[]> {
  const remote = search ? await searchMedicines(search) : await listMedicines();
  const q = search ? search.toLowerCase() : null;
  const local = q
    ? localMedicines.filter(
        (m) =>
          m.generic_name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q)
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
