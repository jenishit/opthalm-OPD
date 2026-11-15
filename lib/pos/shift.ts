import { idbGet, idbGetAll, idbPut, idbUpdate } from "@/lib/offline/idb";
import { refundsForShift, salesForShift } from "./ledger";
import { computeZReport, type ZReport } from "./zreport";

/**
 * A cash-drawer shift on THIS terminal. The backend has no shift concept yet,
 * so shifts live in IndexedDB: they work offline and feed the Z-report. A
 * closed shift stores an immutable Z-report snapshot.
 */
export interface Shift {
  id: string;
  openedAt: string;
  openedBy: string;
  openingFloat: number;
  closedAt?: string;
  closedBy?: string;
  z?: ZReport;
}

const SHIFT_EVENT = "opd-shift-change";
const emit = () => typeof window !== "undefined" && window.dispatchEvent(new Event(SHIFT_EVENT));
export const onShiftChange = (cb: () => void) => {
  window.addEventListener(SHIFT_EVENT, cb);
  return () => window.removeEventListener(SHIFT_EVENT, cb);
};

export async function listShifts(): Promise<Shift[]> {
  return (await idbGetAll<Shift>("shifts")).sort((a, b) => b.openedAt.localeCompare(a.openedAt));
}

export async function getShift(id: string): Promise<Shift | undefined> {
  return idbGet<Shift>("shifts", id);
}

export async function getOpenShift(): Promise<Shift | null> {
  return (await listShifts()).find((s) => !s.closedAt) ?? null;
}

export async function openShift(openedBy: string, openingFloat: number): Promise<Shift> {
  if (await getOpenShift()) throw new Error("A shift is already open on this terminal");
  if (!Number.isFinite(openingFloat) || openingFloat < 0) throw new Error("Opening float must be zero or more");
  const shift: Shift = { id: crypto.randomUUID(), openedAt: new Date().toISOString(), openedBy, openingFloat };
  await idbPut("shifts", shift);
  emit();
  return shift;
}

export async function closeShift(id: string, closedBy: string, countedCash: number, notes: string): Promise<Shift> {
  const shift = await getShift(id);
  if (!shift) throw new Error("Shift not found");
  if (shift.closedAt) throw new Error("This shift is already closed");
  if (!Number.isFinite(countedCash) || countedCash < 0) throw new Error("Counted cash must be zero or more");

  // Sequential Z number per terminal, allocated atomically.
  const counter = await idbUpdate<{ key: string; n: number }>("kv", "pos:zCounter", (c) => ({ key: "pos:zCounter", n: (c?.n ?? 0) + 1 }));
  const closedAt = new Date().toISOString();
  const z = computeZReport({
    zNumber: counter.n,
    shiftId: id,
    openedAt: shift.openedAt,
    closedAt,
    openedBy: shift.openedBy,
    closedBy,
    openingFloat: shift.openingFloat,
    countedCash,
    notes,
    sales: await salesForShift(id),
    refunds: await refundsForShift(id),
  });
  const closed: Shift = { ...shift, closedAt, closedBy, z };
  await idbPut("shifts", closed);
  emit();
  return closed;
}
