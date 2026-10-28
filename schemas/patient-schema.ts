import { z } from "zod";

export const sexOptions = ["Male", "Female", "Other"] as const;

export const patientSchema = z.object({
  id: z.string(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .regex(/^\d+$/, "Phone must contain only digits"),
  date_of_birth: z.string().optional(),
  age: z.coerce.number().min(0).max(150).optional(),
  sex: z.enum(sexOptions),
  occupation: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_pin: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const patientFormSchema = patientSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .refine(
    (data) => data.date_of_birth || (data.age !== undefined && data.age !== null),
    { message: "Either date of birth or age is required", path: ["date_of_birth"] }
  );

export type Patient = z.infer<typeof patientSchema>;
export type PatientFormData = z.infer<typeof patientFormSchema>;
