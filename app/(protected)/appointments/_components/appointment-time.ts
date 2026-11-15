import { clinicParts } from "@/lib/clinic-time";
import type { Visit } from "@/schemas/visit-schema";

/** Minutes since midnight for "HH:MM". */
export const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
export const pad2 = (n: number) => String(n).padStart(2, "0");
export const hourLabel = (h: number) => `${pad2(h)}:00`;
export const isValidTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

/**
 * The appointment's clinic-local start time ("HH:MM"), from the backend's
 * `scheduled_at`. Falls back to when the visit was created for records that
 * predate scheduled times.
 */
export function visitTime(visit: Pick<Visit, "scheduled_at" | "created_at">): string | null {
  return clinicParts(visit.scheduled_at)?.time ?? clinicParts(visit.created_at)?.time ?? null;
}

export const visitHour = (visit: Pick<Visit, "scheduled_at" | "created_at">): number | null => {
  const t = visitTime(visit);
  return t ? Math.floor(toMinutes(t) / 60) : null;
};
