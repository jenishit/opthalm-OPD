import type { Staff } from "@/schemas/shared-schema";

export type StaffRole = Staff["role"];

const ALL_ROUTES = [
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
];

const CLINICAL = ["/dashboard", "/patients", "/appointments", "/examinations", "/prescriptions", "/teams", "/settings"];

/**
 * Which routes each role can see. Roles mirror the backend's (ROLE_*), and
 * the sets follow what the backend actually authorises: /reports and
 * /admin are admin-only, /billing is admin|billing, /inventory is
 * admin|inventory, lab jobs are admin|lab|billing, clinical charts are
 * admin|doctor|optometrist. This is a UX gate — the backend stays the
 * authority.
 * "/teams" and "/settings" are on every role (profile and personal
 * preferences are not access-gated).
 */
const ROLE_ROUTES: Record<StaffRole, string[]> = {
  // The platform console (activating new clinics) belongs to the operator alone.
  superadmin: [...ALL_ROUTES, "/platform"],
  admin: [...ALL_ROUTES, "/setup"],
  doctor: CLINICAL,
  optometrist: CLINICAL,
  billing: ["/dashboard", "/patients", "/prescriptions", "/pos", "/customer-orders", "/teams", "/settings"],
  inventory: ["/dashboard", "/inventory", "/orders", "/teams", "/settings"],
  lab: ["/dashboard", "/customer-orders", "/prescriptions", "/teams", "/settings"],
};

/** Routes a role can see but not mutate — list/detail pages should hide create/edit affordances. */
const READ_ONLY_ROUTES: Partial<Record<StaffRole, string[]>> = {
  billing: ["/prescriptions"],
  lab: ["/prescriptions"],
};

/** Every top-level path that belongs to the staff console (any role). */
const STAFF_ROUTES = new Set(Object.values(ROLE_ROUTES).flat());

/**
 * First path segment of a href, so route checks work for nested pages too:
 * "/platform/clinics/abc" → "/platform". Role sets are keyed by segment.
 */
function topSegment(href: string): string {
  const path = href.split(/[?#]/)[0];
  const first = path.split("/")[1] ?? "";
  return first ? `/${first}` : "/";
}

export function isStaffRoute(href: string): boolean {
  return STAFF_ROUTES.has(topSegment(href));
}

export function canAccess(role: StaffRole | undefined, href: string): boolean {
  if (!role) return false;
  return ROLE_ROUTES[role]?.includes(topSegment(href)) ?? false;
}

export function isReadOnly(role: StaffRole | undefined, href: string): boolean {
  if (!role) return false;
  return READ_ONLY_ROUTES[role]?.includes(topSegment(href)) ?? false;
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  superadmin: "Super admin",
  admin: "Admin",
  doctor: "Doctor",
  optometrist: "Optometrist",
  billing: "Billing",
  inventory: "Inventory",
  lab: "Lab",
};

/** What each role can do — shown on the Team page. Mirrors ROLE_ROUTES / backend gating. */
export const ROLE_SCOPE: Record<StaffRole, string> = {
  superadmin: "Platform administration and everything an admin can do",
  admin: "Full clinic access: reports, billing, inventory, staff and settings",
  doctor: "Patient records, examinations, diagnoses, prescriptions",
  optometrist: "Patient records, examinations, refraction, prescriptions",
  billing: "POS, invoices and payments, customer orders, patient look-up",
  inventory: "Stock, vendors and supplier purchases",
  lab: "Customer orders and lab jobs",
};
