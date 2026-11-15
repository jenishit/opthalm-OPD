import type { VisitStatus } from "@/schemas/visit-schema";

/** Clinic opening hours shown as rows (first hour inclusive, last hour exclusive). */
export const CLINIC_START_HOUR = 9;
export const CLINIC_END_HOUR = 18;

export const STATUS_LABEL: Record<VisitStatus, string> = {
  scheduled: "Scheduled",
  waiting: "Waiting",
  examining: "Examining",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Hours to render: the clinic day, widened to include any appointment outside it. */
export function rowHours(extraHours: number[] = []): number[] {
  const all = [CLINIC_START_HOUR, CLINIC_END_HOUR - 1, ...extraHours];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}
