import { idbGetAll, idbGet, idbPut } from "@/lib/offline/idb";
import type { PaymentMethod } from "@/types/billing-types";

/** One completed (or queued) sale on this terminal. */
export interface SaleRecord {
  id: string; // the checkout attempt key — also the outbox id when queued
  shiftId: string | null;
  at: string;
  customerName: string;
  lines: number;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  method: PaymentMethod;
  invoiceId?: string;
  invoiceNo?: string;
  /** synced = on the server; pending = waiting offline; failed = needs attention. */
  state: "synced" | "pending" | "failed";
}

export interface RefundRecord {
  id: string;
  shiftId: string | null;
  at: string;
  invoiceId: string;
  invoiceNo: string;
  amount: number;
  method: PaymentMethod;
  notes: string;
}

export const saveSale = (s: SaleRecord) => idbPut("sales", s);
export const getSale = (id: string) => idbGet<SaleRecord>("sales", id);
export const saveRefund = (r: RefundRecord) => idbPut("refunds", r);

export async function salesForShift(shiftId: string): Promise<SaleRecord[]> {
  return (await idbGetAll<SaleRecord>("sales")).filter((s) => s.shiftId === shiftId).sort((a, b) => a.at.localeCompare(b.at));
}

export async function refundsForShift(shiftId: string): Promise<RefundRecord[]> {
  return (await idbGetAll<RefundRecord>("refunds")).filter((r) => r.shiftId === shiftId).sort((a, b) => a.at.localeCompare(b.at));
}
