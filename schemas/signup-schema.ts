import * as z from "zod";
import { emailField } from "./field-helpers";

/**
 * Signup only creates the account. Everything about the clinic and the
 * admin's name is collected afterwards by the protected /setup wizard.
 */
export const signupSchema = z
  .object({
    email: emailField,
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Include at least one letter and one number"),
    confirm_password: z.string(),
  })
  .refine((v) => v.password === v.confirm_password, { path: ["confirm_password"], message: "Passwords do not match" });
export type SignupForm = z.infer<typeof signupSchema>;
