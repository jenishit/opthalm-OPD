import type { QueueItem } from "@/services/queue-services";
import { visitDay } from "@/services/queue-services";
import { CLINIC_END_HOUR, CLINIC_START_HOUR } from "./schedule-config";
import { visitHour } from "./appointment-time";

export interface DayStats {
  scheduled: number;
  checkedIn: number;
  waiting: number;
  completed: number;
  /** Clinic hours (from now, for today) with no active appointment. */
  freeSlots: number;
}

/** Counts for one day. `nowHour` limits free slots to the hours still ahead (omit for a past/future day). */
export function dayStats(items: QueueItem[], dateIso: string, nowHour?: number): DayStats {
  const day = items.filter((i) => visitDay(i) === dateIso && i.visit.status !== "cancelled");
  const booked = new Set<number>();
  for (const i of day) {
    const h = visitHour(i.visit);
    if (h != null) booked.add(h);
  }
  let free = 0;
  for (let h = CLINIC_START_HOUR; h < CLINIC_END_HOUR; h++) {
    if (nowHour != null && h < nowHour) continue;
    if (!booked.has(h)) free++;
  }
  return {
    scheduled: day.length,
    checkedIn: day.filter((i) => ["waiting", "examining", "completed"].includes(i.visit.status)).length,
    waiting: day.filter((i) => i.visit.status === "waiting").length,
    completed: day.filter((i) => i.visit.status === "completed").length,
    freeSlots: free,
  };
}

/** First clinic hour on `dateIso` with no active appointment (as "HH:00"), or null when the day is full. */
export function firstFreeSlot(items: QueueItem[], dateIso: string): string | null {
  const booked = new Set<number>();
  for (const i of items) {
    if (visitDay(i) !== dateIso || i.visit.status === "cancelled") continue;
    const h = visitHour(i.visit);
    if (h != null) booked.add(h);
  }
  for (let h = CLINIC_START_HOUR; h < CLINIC_END_HOUR; h++) {
    if (!booked.has(h)) return `${String(h).padStart(2, "0")}:00`;
  }
  return null;
}
