import { staffRole } from "@/schemas/shared-schema";
import type { Staff } from "@/schemas/shared-schema";

/** Backend role_name ("ROLE_DOCTOR") → app role, or null when unknown. */
export function toStaffRoleName(roleName: string): Staff["role"] | null {
  const n = roleName.trim().toLowerCase().replace(/^role_/, "");
  return staffRole.find((r) => r === n) ?? null;
}

/** App role → backend role_name sent to /user/create. */
export const toBackendRoleName = (role: Staff["role"]) => `ROLE_${role.toUpperCase()}`;
