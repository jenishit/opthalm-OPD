import * as z from "zod";
import { staffRole } from "./shared-schema";
import { emailField } from "./field-helpers";

/** Roles an admin can assign from a clinic console (superadmin is platform-only). */
export const assignableRole = staffRole.filter((r) => r !== "superadmin");

export const inviteMemberSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: emailField,
  phone: z.string().trim().refine((v) => v === "" || /^[0-9+\-\s()]{7,20}$/.test(v), "Enter a valid phone number"),
  role: z.enum(staffRole),
  password: z.string().min(8, "Use at least 8 characters"),
});
export type InviteMemberForm = z.infer<typeof inviteMemberSchema>;
