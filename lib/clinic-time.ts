/**
 * The backend stores an appointment's start as a timestamp (`scheduled_at`) and
 * interprets dates in the clinic's timezone. This app targets Nepal, so the
 * clinic zone is fixed here; if clinics ever choose their own zone, read it from
 * the clinic settings and thread it through these helpers.
 */
export const CLINIC_TZ = "Asia/Kathmandu";
/** Fixed UTC offset of CLINIC_TZ (Nepal has no daylight saving). */
const CLINIC_OFFSET = "+05:45";

/** "2026-11-20" + "14:30" → "2026-11-20T14:30:00+05:45" (what POST/PATCH /visit expect). */
export function toScheduledAt(dateIso: string, hhmm: string): string {
  return `${dateIso}T${hhmm}:00${CLINIC_OFFSET}`;
}

const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** An instant as clinic-local {date: "YYYY-MM-DD", time: "HH:MM"}, or null if unparseable. */
export function clinicParts(iso: string | null | undefined): { date: string; time: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
