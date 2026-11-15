import type { Patient } from "@/schemas/patient-schema";
import type { Visit } from "@/schemas/visit-schema";

export interface QueueItem {
  visit: Visit;
  patient: Patient;
}

/** Schedule reads are cached briefly per date range and de-duplicated across concurrent callers. */
export const SCHEDULE_TTL_MS = 30_000;

const cache = new Map<string, { at: number; items: QueueItem[] }>();
const inflight = new Map<string, Promise<QueueItem[]>>();

export const getCached = (key: string) => {
  const hit = cache.get(key);
  return hit && Date.now() - hit.at < SCHEDULE_TTL_MS ? hit.items : null;
};
export const setCached = (key: string, items: QueueItem[]) => cache.set(key, { at: Date.now(), items });
export const getInflight = (key: string) => inflight.get(key);
export const setInflight = (key: string, p: Promise<QueueItem[]> | null) => (p ? inflight.set(key, p) : inflight.delete(key));

/** Call after any visit is created or changed so the next read refetches. */
export function invalidateScheduleCache() {
  cache.clear();
}
