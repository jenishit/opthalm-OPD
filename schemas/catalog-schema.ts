import { z } from "zod";

// ── History Conditions Catalog ──────────────────────────────────────────────
export const conditionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Condition name is required"),
  category: z.enum(["systemic", "ocular", "other"]).default("other"),
  created_at: z.string().datetime().optional(),
});

export type Condition = z.infer<typeof conditionSchema>;
export const conditionFormDataSchema = conditionSchema.omit({ id: true, created_at: true });
export type ConditionFormData = z.infer<typeof conditionFormDataSchema>;

// ── Diagnosis Catalog ───────────────────────────────────────────────────────
export const diagnosisCatalogSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Diagnosis name is required"),
  icd10_code: z.string().min(1, "ICD-10 code is required"),
  description: z.string().optional(),
  created_at: z.string().datetime().optional(),
});

export type DiagnosisCatalog = z.infer<typeof diagnosisCatalogSchema>;
export const diagnosisCatalogFormDataSchema = diagnosisCatalogSchema.omit({ id: true, created_at: true });
export type DiagnosisCatalogFormData = z.infer<typeof diagnosisCatalogFormDataSchema>;

// ── Medicine Catalog ────────────────────────────────────────────────────────
export const medicineFormOptions = {
  form: ["eye drop", "eye ointment", "tablet", "capsule", "injection", "syrup", "gel", "suspension"] as const,
};

export const medicineSchema = z.object({
  id: z.string(),
  generic_name: z.string().min(1, "Generic name is required"),
  brand: z.string().min(1, "Brand name is required"),
  strength: z.string().min(1, "Strength is required"),
  form: z.enum(medicineFormOptions.form),
  created_at: z.string().datetime().optional(),
});

export type Medicine = z.infer<typeof medicineSchema>;
export const medicineFormDataSchema = medicineSchema.omit({ id: true, created_at: true });
export type MedicineFormData = z.infer<typeof medicineFormDataSchema>;
