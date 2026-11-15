import * as z from "zod";
import type { Patient } from "./patient-schema";
import { optionalDate, optionalMoney } from "./field-helpers";

export const labOrderSchema = z.object({
  patient: z.custom<Patient | null>((v) => v != null, "Select a patient"),
  jobType: z.string().min(1, "Choose an order type"),
  expected: optionalDate,
  advance: optionalMoney("Advance"),
  notes: z.string().trim(),
});
export type LabOrderForm = z.infer<typeof labOrderSchema>;
