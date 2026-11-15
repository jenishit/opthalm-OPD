import type { ZReport } from "@/lib/pos/zreport";
import type { PaymentMethod } from "@/types/billing-types";

const money = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const LABEL: Record<PaymentMethod, string> = { cash: "Cash", card: "Card", online: "Online", bank_transfer: "Bank transfer" };
const METHODS = Object.keys(LABEL) as PaymentMethod[];
const when = (iso: string) => new Date(iso).toLocaleString("en-GB");

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={"flex justify-between gap-4 " + (bold ? "font-bold" : "")}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

/** Printable end-of-shift report. `interim` renders an X-report for a shift that is still open. */
export function ZReportPaper({ z, interim, clinicName }: { z: ZReport; interim: boolean; clinicName?: string }) {
  return (
    <article
      aria-label={interim ? "X-report" : `Z-report ${z.zNumber}`}
      className="mx-auto w-full max-w-[420px] bg-white p-6 font-mono text-[12px] leading-relaxed text-neutral-900 shadow-sm print:max-w-none print:p-0 print:shadow-none"
    >
      <header className="border-b border-dashed border-neutral-900 pb-3 text-center">
        {clinicName && <p className="font-bold uppercase">{clinicName}</p>}
        <p className="text-sm font-bold">{interim ? "X-REPORT (INTERIM — SHIFT OPEN)" : `Z-REPORT #${String(z.zNumber).padStart(4, "0")}`}</p>
      </header>

      <section className="space-y-0.5 border-b border-dashed border-neutral-900 py-3">
        <Line label="Opened" value={when(z.openedAt)} />
        <Line label={interim ? "As of" : "Closed"} value={when(z.closedAt)} />
        <Line label="Opened by" value={z.openedBy} />
        {!interim && <Line label="Closed by" value={z.closedBy} />}
        <Line label="Invoices" value={z.firstInvoice ? `${z.firstInvoice} → ${z.lastInvoice}` : "—"} />
      </section>

      <section className="space-y-0.5 border-b border-dashed border-neutral-900 py-3">
        <Line label={`Sales (${z.salesCount})`} value={money(z.grossSales)} />
        <Line label="Discounts" value={`− ${money(z.discounts)}`} />
        <Line label="Taxable sales" value={money(z.taxableSales)} />
        <Line label="VAT" value={money(z.vat)} />
        <Line label="Net sales" value={money(z.netSales)} bold />
      </section>

      <section className="space-y-0.5 border-b border-dashed border-neutral-900 py-3">
        <p className="font-bold">Takings by method</p>
        {METHODS.map((m) => (
          <Line key={m} label={LABEL[m]} value={money(z.salesByMethod[m])} />
        ))}
        <p className="pt-2 font-bold">Refunds ({z.refundCount})</p>
        {METHODS.filter((m) => z.refundsByMethod[m] > 0).map((m) => (
          <Line key={m} label={LABEL[m]} value={`− ${money(z.refundsByMethod[m])}`} />
        ))}
        <Line label="Total refunds" value={`− ${money(z.totalRefunds)}`} bold />
      </section>

      <section className="space-y-0.5 border-b border-dashed border-neutral-900 py-3">
        <p className="font-bold">Cash drawer</p>
        <Line label="Opening float" value={money(z.openingFloat)} />
        <Line label="+ Cash sales" value={money(z.salesByMethod.cash)} />
        <Line label="− Cash refunds" value={money(z.refundsByMethod.cash)} />
        <Line label="Expected" value={money(z.expectedCash)} bold />
        {!interim && (
          <>
            <Line label="Counted" value={money(z.countedCash)} />
            <Line label={z.variance < 0 ? "SHORT" : z.variance > 0 ? "OVER" : "Variance"} value={money(Math.abs(z.variance))} bold />
          </>
        )}
      </section>

      {z.unsyncedSales > 0 && (
        <p className="border-b border-dashed border-neutral-900 py-3 font-bold">
          ⚠ {z.unsyncedSales} sale(s) were not yet synced to the server when this report was produced.
        </p>
      )}
      {z.notes && <p className="border-b border-dashed border-neutral-900 py-3">Notes: {z.notes}</p>}

      <footer className="pt-6 text-center">
        <div className="mx-auto mb-1 h-px w-48 bg-neutral-900" />
        Cashier signature
        <div className="mx-auto mb-1 mt-6 h-px w-48 bg-neutral-900" />
        Manager signature
        <p className="mt-4 text-[10px] text-neutral-500">Terminal report — figures cover sales made on this device only.</p>
      </footer>
    </article>
  );
}
