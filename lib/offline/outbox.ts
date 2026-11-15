import { CATEGORY_TO_INVOICE_ITEM_TYPE } from "@/lib/inventory-category";
import { saveSale, getSale } from "@/lib/pos/ledger";
import { createInvoice, recordPayment } from "@/services/billing-services";
import { ApiError, SessionExpiredError } from "@/services/http";
import type { PaymentMethod } from "@/types/billing-types";
import type { InventoryCategory } from "@/types/inventory-types";
import { idbDelete, idbGet, idbGetAll, idbPut } from "./idb";
import { isNetworkError } from "./use-online";

export interface SalePayload {
  /** null for a walk-in sale — no patient is needed to sell a product. */
  patientId: string | null;
  patientName: string;
  discount: number;
  vat: number;
  subtotal: number;
  total: number;
  method: PaymentMethod;
  lines: { itemId: string; category: string; description: string; qty: number; unitPrice: number }[];
}

export interface QueuedSale {
  /** The checkout attempt key; also the Idempotency-Key prefix and ledger id. */
  id: string;
  createdAt: string;
  shiftId: string | null;
  status: "pending" | "failed";
  attempts: number;
  lastError?: string;
  sale: SalePayload;
  /** Steps already completed on the server, so a retry never re-creates the invoice. */
  progress: { invoiceId?: string; invoiceNo?: string; invoiceTotal?: number };
}

export type ProcessResult =
  | { kind: "done"; invoiceNo: string; invoiceId: string }
  | { kind: "offline" }
  | { kind: "retry"; message: string }
  | { kind: "rejected"; message: string; invoiceCreated: boolean };

const EVENT = "opd-outbox-change";
const emit = () => typeof window !== "undefined" && window.dispatchEvent(new Event(EVENT));
export const onOutboxChange = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export async function listOutbox(): Promise<QueuedSale[]> {
  return (await idbGetAll<QueuedSale>("outbox")).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Write-ahead: persist the sale (and its ledger row) before any network call. */
export async function enqueueSale(q: QueuedSale): Promise<void> {
  const existing = await idbGet<QueuedSale>("outbox", q.id);
  // Re-submitting the same attempt keeps the server-side progress already made.
  await idbPut("outbox", existing ? { ...q, progress: existing.progress, attempts: existing.attempts } : q);
  await saveSale({
    id: q.id,
    shiftId: q.shiftId,
    at: q.createdAt,
    customerName: q.sale.patientName,
    lines: q.sale.lines.length,
    subtotal: q.sale.subtotal,
    discount: q.sale.discount,
    vat: q.sale.vat,
    total: q.sale.total,
    method: q.sale.method,
    state: "pending",
  });
  emit();
}

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  // One sync worker across all tabs; falls back to no lock where unsupported.
  if (typeof navigator !== "undefined" && navigator.locks) return navigator.locks.request("opd-outbox", fn);
  return fn();
}

async function patch(id: string, p: Partial<QueuedSale>) {
  const cur = await idbGet<QueuedSale>("outbox", id);
  if (cur) await idbPut("outbox", { ...cur, ...p });
}

async function runSale(id: string): Promise<ProcessResult | null> {
  const q = await idbGet<QueuedSale>("outbox", id);
  if (!q || q.status === "failed") return null;
  const { sale } = q;

  try {
    let { invoiceId, invoiceNo, invoiceTotal } = q.progress;
    if (!invoiceId) {
      const invoice = await createInvoice(
        {
          patient_id: sale.patientId ?? undefined,
          discount_amount: sale.discount || undefined,
          tax_amount: sale.vat,
          items: sale.lines.map((l) => ({
            item_type: CATEGORY_TO_INVOICE_ITEM_TYPE[l.category as InventoryCategory],
            description: l.description,
            inventory_item_id: l.itemId,
            quantity: l.qty,
            unit_price: l.unitPrice,
          })),
        },
        `${id}:invoice`,
      );
      invoiceId = invoice.id;
      invoiceNo = invoice.invoice_no;
      invoiceTotal = invoice.total_amount;
      await patch(id, { progress: { invoiceId, invoiceNo, invoiceTotal } });
      // The server's figures are authoritative for the ledger / Z-report.
      const row = await getSale(id);
      if (row) {
        await saveSale({
          ...row,
          invoiceId,
          invoiceNo,
          subtotal: invoice.subtotal,
          discount: invoice.discount_amount,
          vat: invoice.tax_amount,
          total: invoice.total_amount,
        });
      }
    }
    await recordPayment(invoiceId, { amount: invoiceTotal ?? sale.total, method: sale.method }, `${id}:payment`);

    const row = await getSale(id);
    if (row) await saveSale({ ...row, invoiceId, invoiceNo, state: "synced" });
    await idbDelete("outbox", id);
    return { kind: "done", invoiceNo: invoiceNo ?? "", invoiceId };
  } catch (e) {
    if (isNetworkError(e)) return { kind: "offline" };
    const fresh = await idbGet<QueuedSale>("outbox", id);
    const attempts = (fresh?.attempts ?? 0) + 1;
    const invoiceCreated = Boolean(fresh?.progress.invoiceId);
    if (e instanceof SessionExpiredError) {
      return { kind: "retry", message: "Session expired — sign in again to finish syncing" };
    }
    const message = e instanceof ApiError ? e.message : "Unexpected error while syncing";
    if (e instanceof ApiError && e.status >= 500) {
      await patch(id, { attempts, lastError: message });
      return { kind: "retry", message };
    }
    await patch(id, { status: "failed", attempts, lastError: message });
    const row = await getSale(id);
    if (row) await saveSale({ ...row, state: "failed" });
    return { kind: "rejected", message, invoiceCreated };
  }
}

/** Run a single queued sale to completion (used by interactive checkout). */
export async function processSale(id: string): Promise<ProcessResult> {
  const r = await withLock(() => runSale(id));
  emit();
  return r ?? { kind: "rejected", message: "Sale is no longer queued", invoiceCreated: false };
}

/** Sync every pending sale oldest-first; stops at the first connectivity/session problem. */
export async function processOutbox(): Promise<{ done: number; remaining: number }> {
  let done = 0;
  await withLock(async () => {
    for (const q of await listOutbox()) {
      if (q.status !== "pending") continue;
      const r = await runSale(q.id);
      if (r?.kind === "done") done++;
      else if (r?.kind === "offline" || r?.kind === "retry") break;
    }
  });
  emit();
  const remaining = (await listOutbox()).filter((q) => q.status === "pending").length;
  return { done, remaining };
}

export async function retryFailedSale(id: string): Promise<void> {
  await patch(id, { status: "pending", lastError: undefined, attempts: 0 });
  const row = await getSale(id);
  if (row) await saveSale({ ...row, state: "pending" });
  emit();
}

/**
 * Drop a queued sale that never reached the server. Refuses when an invoice
 * was already created — that would orphan a draft and its stock deduction.
 */
export async function discardQueuedSale(id: string): Promise<boolean> {
  const q = await idbGet<QueuedSale>("outbox", id);
  if (q?.progress.invoiceId) return false;
  await idbDelete("outbox", id);
  await idbDelete("sales", id);
  emit();
  return true;
}
