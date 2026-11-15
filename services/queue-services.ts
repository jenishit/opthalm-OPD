import { apiFetch } from "./http";
import { clinicParts } from "@/lib/clinic-time";
import { todayIsoKathmandu } from "@/lib/nepali-calendar";
import type { Patient } from "@/schemas/patient-schema";
import type { Visit, VisitStatus } from "@/schemas/visit-schema";
import { getPatient } from "./patients-services";
import { getCached, getInflight, setCached, setInflight, type QueueItem } from "./schedule-cache";

export type { QueueItem } from "./schedule-cache";
export { invalidateScheduleCache } from "./schedule-cache";

/** One row of GET /visit — the schedule, with patient name/phone and examiner name inline. */
interface ScheduleItemWire {
  id: string;
  patient: { id: string; name: string; phone?: string };
  examine_by: { id: string; name: string };
  status: VisitStatus;
  scheduled_at: string;
  ends_at: string;
  duration_minutes: number;
  chief_complaint: string;
}
interface ScheduleWire {
  items: ScheduleItemWire[];
  total: number;
  limit: number;
  offset: number;
}

const PAGE = 500; // the endpoint's maximum page size
const MAX_RANGE_DAYS = 62; // the endpoint rejects wider ranges

function splitName(full: string) {
  const [first = "", ...rest] = full.trim().split(/\s+/);
  return { first_name: first, last_name: rest.join(" ") };
}

function toQueueItem(w: ScheduleItemWire): QueueItem {
  const parts = clinicParts(w.scheduled_at);
  const visit: Visit = {
    id: w.id,
    patient_id: w.patient.id,
    examined_by: w.examine_by.name,
    status: w.status,
    visit_date: parts?.date ?? "",
    scheduled_at: w.scheduled_at,
    ends_at: w.ends_at,
    duration_minutes: w.duration_minutes,
    chief_complaint: w.chief_complaint,
  };
  // The schedule carries only what the board needs; fuller demographics come from getPatient().
  const patient: Patient = { id: w.patient.id, ...splitName(w.patient.name), phone: w.patient.phone ?? "", sex: "Other" };
  return { visit, patient };
}

/** Clinic-local calendar day of a visit ("YYYY-MM-DD"). */
export const visitDay = (item: QueueItem): string =>
  clinicParts(item.visit.scheduled_at)?.date ?? String(item.visit.visit_date ?? "").slice(0, 10);

const byStart = (a: QueueItem, b: QueueItem) => String(a.visit.scheduled_at ?? "").localeCompare(String(b.visit.scheduled_at ?? ""));

async function fetchRange(from: string, to: string, status?: VisitStatus): Promise<QueueItem[]> {
  const out: QueueItem[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const q = new URLSearchParams({ from, to, limit: String(PAGE), offset: String(offset) });
    if (status) q.set("status", status);
    const page = await apiFetch<ScheduleWire>(`/visit?${q.toString()}`);
    out.push(...(page.items ?? []).map(toQueueItem));
    if (!page.items?.length || out.length >= page.total) break;
  }
  return out.sort(byStart);
}

/**
 * Visits between two clinic-local dates (inclusive, ≤ 62 days), straight from the
 * server — one request, no per-patient calls. Cached briefly per range.
 */
export async function loadSchedule(from: string, to: string, status?: VisitStatus): Promise<QueueItem[]> {
  const key = `${from}|${to}|${status ?? ""}`;
  const hit = getCached(key);
  if (hit) return hit;
  const pending = getInflight(key);
  if (pending) return pending;
  const run = fetchRange(from, to, status).then((items) => {
    setCached(key, items);
    return items;
  });
  setInflight(key, run);
  try {
    return await run;
  } finally {
    setInflight(key, null);
  }
}

/** Same as loadSchedule for a range longer than 62 days (fetched in 60-day chunks). */
export async function loadScheduleLong(from: string, to: string, status?: VisitStatus): Promise<QueueItem[]> {
  const out: QueueItem[] = [];
  let cursor = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (cursor <= end) {
    const chunkEnd = new Date(Math.min(cursor.getTime() + (MAX_RANGE_DAYS - 2) * 86_400_000, end.getTime()));
    out.push(...(await loadSchedule(cursor.toISOString().slice(0, 10), chunkEnd.toISOString().slice(0, 10), status)));
    cursor = new Date(chunkEnd.getTime() + 86_400_000);
  }
  return out.sort(byStart);
}

/**
 * Today's queue with each patient's full record (age, sex) — the examination
 * workspace needs more than the schedule row carries. Only today's patients are
 * fetched, so this stays small.
 */
export async function getTodayQueue(status?: VisitStatus): Promise<QueueItem[]> {
  const today = todayIsoKathmandu();
  const items = await loadSchedule(today, today, status);
  const ids = [...new Set(items.map((i) => i.patient.id))];
  const full = new Map<string, Patient>();
  for (let i = 0; i < ids.length; i += 6) {
    await Promise.all(
      ids.slice(i, i + 6).map(async (id) => {
        try {
          const p = await getPatient(id);
          if (p) full.set(id, p);
        } catch {
          /* keep the schedule's lighter patient */
        }
      }),
    );
  }
  return items.map((it) => ({ ...it, patient: full.get(it.patient.id) ?? it.patient }));
}

/** Visits whose clinic-local date falls within [startDate, endDate] (≤ 62 days). */
export const getQueueForRange = (startDate: string, endDate: string) => loadSchedule(startDate, endDate);
