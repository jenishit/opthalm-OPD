import { z } from "zod";

export const examinationFindingsSchema = z.object({
  id: z.string().optional(),
  visit_id: z.string().optional(),
  iop_od: z.coerce.number().optional(),
  iop_os: z.coerce.number().optional(),
  convergence: z.string().optional(),
  cover_test: z.string().optional(),
  eom: z.string().optional(),
  anterior_segment_od: z.string().optional(),
  anterior_segment_os: z.string().optional(),
  fundus_od: z.string().optional(),
  fundus_os: z.string().optional(),
});

export type ExaminationFindings = z.infer<typeof examinationFindingsSchema>;
export type ExaminationFindingsFormData = ExaminationFindings;
