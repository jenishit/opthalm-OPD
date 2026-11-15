import * as z from "zod";

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[0-9+\-\s()]{7,20}$/.test(v), "Enter a valid phone number");

/** The post-signup wizard: clinic identity, practice details, then the admin's own name. */
export const setupSchema = z.object({
  clinic_name: z.string().trim().min(2, "Enter your clinic's name"),
  registration_no: z.string().trim().min(1, "Registration number is required"),
  phone: optionalPhone,
  email: z.string().trim().refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address"),
  address: z.string().trim(),
  tagline: z.string().trim(),
  workspace_slug: z.string().trim().regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and dashes only"),
  default_currency: z.string(),
  timezone: z.string(),
  first_name: z.string().trim().min(1, "Your first name is required"),
  last_name: z.string().trim().min(1, "Your last name is required"),
  profile_phone: optionalPhone,
});

export type SetupForm = z.infer<typeof setupSchema>;

export const SETUP_STEP_FIELDS: (keyof SetupForm)[][] = [
  ["clinic_name", "registration_no", "phone", "email"],
  ["address", "tagline", "workspace_slug", "default_currency", "timezone"],
  ["first_name", "last_name", "profile_phone"],
];

export const CURRENCY_OPTIONS = [
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "NPR", label: "NPR — Nepalese Rupee" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "Australia/Melbourne", label: "Australia / Melbourne" },
  { value: "Asia/Kathmandu", label: "Asia / Kathmandu" },
] as const;
