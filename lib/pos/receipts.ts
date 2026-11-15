import { idbGet, idbUpdate } from "@/lib/offline/idb";

/**
 * How many times an invoice has been printed from THIS terminal. The first
 * print is the "Original"; every later one must be marked "Copy of Original"
 * (Nepal VAT invoicing). Prints from other terminals aren't visible here.
 */
export async function getPrintCount(invoiceId: string): Promise<number> {
  const row = await idbGet<{ key: string; n: number }>("kv", `receipt:${invoiceId}`).catch(() => undefined);
  return row?.n ?? 0;
}

export async function bumpPrintCount(invoiceId: string): Promise<number> {
  const row = await idbUpdate<{ key: string; n: number }>("kv", `receipt:${invoiceId}`, (c) => ({
    key: `receipt:${invoiceId}`,
    n: (c?.n ?? 0) + 1,
  }));
  return row.n;
}
