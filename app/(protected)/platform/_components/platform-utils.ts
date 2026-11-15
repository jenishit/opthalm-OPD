import type { PlatformClinicUsage, PlatformSubscriptionUsage } from "@/types/platform-types";

export const PERIOD_OPTIONS = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
  { days: 365, label: "Last 12 months" },
] as const;

/** Inclusive [from, to] date range ending today, as YYYY-MM-DD strings. */
export function periodRange(days: number, today = new Date()) {
  const to = new Date(today);
  const from = new Date(today);
  from.setDate(from.getDate() - (days - 1));
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function usagePercent(used: number, limit: number | null): number | null {
  if (limit === null) return null;
  if (limit <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, (used / limit) * 100);
}

export interface UsageMetric {
  key: "seats" | "patients" | "locations";
  label: string;
  used: number;
  limit: number | null;
  percent: number | null;
}

export function usageMetrics(subscription: PlatformSubscriptionUsage | null): UsageMetric[] {
  if (!subscription) return [];
  return [
    {
      key: "seats",
      label: "Team seats",
      used: subscription.seats_used,
      limit: subscription.seats_limit,
      percent: usagePercent(subscription.seats_used, subscription.seats_limit),
    },
    {
      key: "patients",
      label: "Patient records",
      used: subscription.patient_records_used,
      limit: subscription.patient_records_limit,
      percent: usagePercent(subscription.patient_records_used, subscription.patient_records_limit),
    },
    {
      key: "locations",
      label: "Locations",
      used: subscription.locations_used,
      limit: subscription.locations_limit,
      percent: usagePercent(subscription.locations_used, subscription.locations_limit),
    },
  ];
}

/** Highest metered-resource percentage for a clinic (null when unlimited everywhere). */
export function peakUsage(clinic: PlatformClinicUsage): number | null {
  const values = usageMetrics(clinic.subscription)
    .map((m) => m.percent)
    .filter((p): p is number => p !== null);
  return values.length ? Math.max(...values) : null;
}

export function usageTone(percent: number | null): string {
  if (percent === null) return "text-mute";
  if (percent >= 100) return "text-bad-ink";
  if (percent >= 80) return "text-warn-ink";
  return "text-ok-ink";
}

export function usageBarColor(percent: number | null): string {
  if (percent === null) return "var(--c-line)";
  if (percent >= 100) return "var(--c-bad)";
  if (percent >= 80) return "var(--c-warn)";
  return "var(--c-ok)";
}

export const SUBSCRIPTION_STATUS: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-sage-soft text-sage" },
  trialing: { label: "Trialing", className: "bg-t-new-soft text-t-new" },
  pending: { label: "Pending setup", className: "bg-warn-soft text-warn-ink" },
  past_due: { label: "Past due", className: "bg-warn-soft text-warn-ink" },
  cancelled: { label: "Cancelled", className: "bg-bad-soft text-bad-ink" },
};

export function subscriptionStatus(status: string | null | undefined) {
  if (!status) return { label: "No plan", className: "bg-app text-mute" };
  return SUBSCRIPTION_STATUS[status] ?? { label: status, className: "bg-app text-mute" };
}

const ROLE_LABELS: Record<string, string> = {
  ROLE_SUPERADMIN: "Super admin",
  ROLE_ADMIN: "Admin",
  ROLE_DOCTOR: "Doctor",
  ROLE_OPTOMETRIST: "Optometrist",
  ROLE_BILLING: "Billing",
  ROLE_INVENTORY: "Inventory",
  ROLE_LAB: "Lab",
  ROLE_PATIENT: "Patient portal",
  UNKNOWN: "Unknown",
};

export function roleLabel(roleName: string): string {
  return ROLE_LABELS[roleName] ?? roleName;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
