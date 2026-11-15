import type { PaymentMethod } from "@/types/billing-types";
import type { RefundRecord, SaleRecord } from "./ledger";

export interface ZReport {
  zNumber: number;
  shiftId: string;
  openedAt: string;
  closedAt: string;
  openedBy: string;
  closedBy: string;
  openingFloat: number;
  salesCount: number;
  refundCount: number;
  grossSales: number; // sum of subtotals before discount
  discounts: number;
  taxableSales: number; // gross - discounts
  vat: number;
  netSales: number; // taxable + VAT = invoiced total
  salesByMethod: Record<PaymentMethod, number>;
  refundsByMethod: Record<PaymentMethod, number>;
  totalRefunds: number;
  firstInvoice: string | null;
  lastInvoice: string | null;
  expectedCash: number; // float + cash sales - cash refunds
  countedCash: number;
  variance: number; // counted - expected (negative = short)
  unsyncedSales: number; // sales not yet on the server when the shift was closed
  notes: string;
}

const METHODS: PaymentMethod[] = ["cash", "card", "online", "bank_transfer"];
const zero = (): Record<PaymentMethod, number> => ({ cash: 0, card: 0, online: 0, bank_transfer: 0 });
const r2 = (n: number) => Math.round(n * 100) / 100;

export function computeZReport(input: {
  zNumber: number;
  shiftId: string;
  openedAt: string;
  closedAt: string;
  openedBy: string;
  closedBy: string;
  openingFloat: number;
  countedCash: number;
  notes: string;
  sales: SaleRecord[];
  refunds: RefundRecord[];
}): ZReport {
  const salesByMethod = zero();
  const refundsByMethod = zero();
  let gross = 0;
  let discounts = 0;
  let vat = 0;
  let net = 0;
  // A failed sale never completed on the server, so it is not revenue — it is
  // excluded from the totals and surfaced via `unsyncedSales` instead.
  const counted = input.sales.filter((s) => s.state !== "failed");
  for (const s of counted) {
    gross += s.subtotal;
    discounts += s.discount;
    vat += s.vat;
    net += s.total;
    salesByMethod[s.method] += s.total;
  }
  let totalRefunds = 0;
  for (const r of input.refunds) {
    refundsByMethod[r.method] += r.amount;
    totalRefunds += r.amount;
  }
  const numbered = counted.filter((s) => s.invoiceNo).map((s) => s.invoiceNo as string);
  const expectedCash = input.openingFloat + salesByMethod.cash - refundsByMethod.cash;
  for (const m of METHODS) {
    salesByMethod[m] = r2(salesByMethod[m]);
    refundsByMethod[m] = r2(refundsByMethod[m]);
  }
  return {
    zNumber: input.zNumber,
    shiftId: input.shiftId,
    openedAt: input.openedAt,
    closedAt: input.closedAt,
    openedBy: input.openedBy,
    closedBy: input.closedBy,
    openingFloat: input.openingFloat,
    salesCount: counted.length,
    refundCount: input.refunds.length,
    grossSales: r2(gross),
    discounts: r2(discounts),
    taxableSales: r2(gross - discounts),
    vat: r2(vat),
    netSales: r2(net),
    salesByMethod,
    refundsByMethod,
    totalRefunds: r2(totalRefunds),
    firstInvoice: numbered[0] ?? null,
    lastInvoice: numbered[numbered.length - 1] ?? null,
    expectedCash: r2(expectedCash),
    countedCash: input.countedCash,
    variance: r2(input.countedCash - expectedCash),
    unsyncedSales: input.sales.filter((s) => s.state !== "synced").length,
    notes: input.notes,
  };
}
