import { z } from "zod";

export const examinationFindingsSchema = z.object({
  id: z.string().optional(),
  visit_id: z.string().optional(),
  iop_od: z.coerce.number().optional(),
  iop_os: z.coerce.number().optional(),
  iop_time: z.string().optional(),
  bp: z.string().optional(),
  convergence: z.string().optional(),
  cover_test: z.string().optional(),
  eom: z.string().optional(),
  anterior_segment_od: z.string().optional(),
  anterior_segment_os: z.string().optional(),
  fundus_od: z.string().optional(),
  fundus_os: z.string().optional(),
  notes: z.string().max(5000).optional(),
  /** {od:[{type,x,y}], os:[…]} — exact marks drawn on the fundus chart. */
  fundus_marks: z.record(z.string(), z.array(z.object({ type: z.string(), x: z.number(), y: z.number() }))).optional(),
  /** Free JSON: slit-lamp picks, eye-map structures, C:D and fundus status per eye. */
  slit_findings: z.record(z.string(), z.unknown()).optional(),
});

export type ExaminationFindings = z.infer<typeof examinationFindingsSchema>;
export type ExaminationFindingsFormData = ExaminationFindings;
