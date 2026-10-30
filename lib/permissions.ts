import type { Staff } from "@/schemas/shared-schema";

export type StaffRole = Staff["role"];

/**
 * Which routes each role can see in navigation.
 * "/teams" and "/settings" are intentionally on every role — team visibility
 * and personal/workspace customization are not access-gated.
 */
const ROLE_ROUTES: Record<StaffRole, string[]> = {
  manager: [
    "/dashboard",
    "/patients",
    "/appointments",
    "/examinations",
    "/prescriptions",
    "/inventory",
    "/pos",
    "/customer-orders",
    "/orders",
    "/reports",
    "/teams",
    "/settings",
  ],
  doctor: ["/dashboard", "/patients", "/appointments", "/examinations", "/prescriptions", "/teams", "/settings"],
  optometrist: ["/dashboard", "/patients", "/appointments", "/examinations", "/prescriptions", "/teams", "/settings"],
  optician: ["/dashboard", "/prescriptions", "/customer-orders", "/orders", "/teams", "/settings"],
  receptionist: ["/dashboard", "/patients", "/appointments", "/prescriptions", "/inventory", "/pos", "/teams", "/settings"],
};

/** Routes a role can see but not mutate — list/detail pages should hide create/edit affordances. */
const READ_ONLY_ROUTES: Partial<Record<StaffRole, string[]>> = {
  receptionist: ["/appointments", "/prescriptions"],
  optician: ["/prescriptions"],
};

export function canAccess(role: StaffRole | undefined, href: string): boolean {
  if (!role) return false;
  return ROLE_ROUTES[role]?.includes(href) ?? false;
}

export function isReadOnly(role: StaffRole | undefined, href: string): boolean {
  if (!role) return false;
  return READ_ONLY_ROUTES[role]?.includes(href) ?? false;
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  doctor: "Doctor",
  optometrist: "Optometrist",
  optician: "Optician",
  receptionist: "Receptionist",
  manager: "Manager",
};
