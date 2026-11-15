import { adToBs, formatBs } from "@/lib/nepali-calendar";
import { amountInWords } from "@/lib/money-words";
import type { SellerInfo } from "@/lib/pos/seller";
import { LetterheadLogo } from "@/components/ui/LetterheadLogo";
import type { Invoice } from "@/types/billing-types";

const money = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Calendar date in Nepal time (YYYY-MM-DD) for an instant. */
function nepalDate(iso: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

const METHOD_LABEL: Record<string, string> = { cash: "Cash", card: "Card", online: "Online", bank_transfer: "Bank transfer" };

/**
 * Tax invoice laid out to the Nepal VAT invoice requirements: seller PAN/VAT,
 * sequential invoice number, date in BS and AD, buyer details, per-line
 * quantity/rate/amount, taxable value, VAT, total and amount in words, with an
 * "Original" / "Copy of Original" marker.
 */
export function InvoicePaper({
  invoice,
  seller,
  copyNumber,
  buyerPan,
  printedBy,
}: {
  invoice: Invoice;
  seller: SellerInfo | null;
  /** 0 = first print (Original); n > 0 = n-th reprint (Copy of Original). */
  copyNumber: number;
  buyerPan: string;
  printedBy: string;
}) {
  const isVat = Boolean(seller?.vatNo) || invoice.tax_amount > 0;
  const taxable = Math.max(0, invoice.subtotal - invoice.discount_amount);
  const ratePct = taxable > 0 ? Math.round((invoice.tax_amount / taxable) * 100) : 0;
  const adDate = nepalDate(invoice.created_at);
  const bs = adToBs(adDate);
  const taxLabel = seller?.taxLabel || "VAT";
  const cancelled = invoice.status === "cancelled";

  return (
    <article
      aria-label={`Invoice ${invoice.invoice_no}`}
      className="relative mx-auto w-full max-w-[210mm] bg-white p-8 text-[12px] leading-relaxed text-neutral-900 shadow-sm print:max-w-none print:p-0 print:shadow-none"
    >
      {cancelled && (
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-7xl font-black uppercase tracking-widest text-red-600/15 -rotate-12">
          Cancelled
        </div>
      )}

      <header className="flex items-start justify-between gap-6 border-b-2 border-neutral-900 pb-3">
        <div className="flex items-start gap-3">
          <LetterheadLogo logo={seller?.logo} />
          <div>
          <h1 className="text-lg font-bold uppercase">{seller?.name ?? "Clinic name not available"}</h1>
          {seller?.address && <p>{seller.address}</p>}
          <p>{[seller?.phone && `Tel: ${seller.phone}`, seller?.email].filter(Boolean).join(" · ")}</p>
          <p className="mt-1 font-semibold">
            {seller?.pan ? `PAN: ${seller.pan}` : "PAN: not on file"}
            {seller?.vatNo ? ` · VAT Reg. No: ${seller.vatNo}` : ""}
          </p>
          {seller?.registrationNo && <p>Reg. No: {seller.registrationNo}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-bold uppercase tracking-wide">{isVat ? "Tax Invoice" : "Invoice"}</p>
          <p className="mt-1 inline-block rounded border border-neutral-900 px-2 py-0.5 text-[11px] font-bold uppercase">
            {copyNumber === 0 ? "Original" : `Copy of Original (${copyNumber})`}
          </p>
        </div>
      </header>

      <section className="mt-3 grid grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase text-neutral-500">Billed to</p>
          <p className="font-semibold">{invoice.patient_name || "Walk-in customer"}</p>
          {invoice.patient_phone && <p>Phone: {invoice.patient_phone}</p>}
          {buyerPan && <p>Buyer PAN: {buyerPan}</p>}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-right">
          <dt className="text-neutral-500">Invoice No.</dt>
          <dd className="font-semibold">{invoice.invoice_no}</dd>
          <dt className="text-neutral-500">Date (AD)</dt>
          <dd>{adDate}</dd>
          <dt className="text-neutral-500">Miti (BS)</dt>
          <dd>{bs ? formatBs(bs, "en") : "—"}</dd>
          <dt className="text-neutral-500">Payment status</dt>
          <dd className="capitalize">{invoice.payment_status}</dd>
        </dl>
      </section>

      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="border-y border-neutral-900 text-left text-[10px] uppercase">
            <th className="py-1.5 pr-2">S.N.</th>
            <th className="py-1.5 pr-2">Description</th>
            <th className="py-1.5 pr-2 text-right">Qty</th>
            <th className="py-1.5 pr-2 text-right">Rate</th>
            <th className="py-1.5 pr-2 text-right">Discount</th>
            <th className="py-1.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={it.id} className="border-b border-neutral-200">
              <td className="py-1.5 pr-2">{i + 1}</td>
              <td className="py-1.5 pr-2">{it.description}</td>
              <td className="py-1.5 pr-2 text-right">{it.quantity}</td>
              <td className="py-1.5 pr-2 text-right">{money(it.unit_price)}</td>
              <td className="py-1.5 pr-2 text-right">{it.discount_amount ? money(it.discount_amount) : "—"}</td>
              <td className="py-1.5 text-right">{money(it.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-3 flex justify-between gap-6">
        <p className="max-w-[55%] text-[11px]">
          <span className="font-bold">In words: </span>
          {amountInWords(invoice.total_amount)}
        </p>
        <dl className="grid min-w-[250px] grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 text-right">
          <dt>Sub total</dt>
          <dd>{money(invoice.subtotal)}</dd>
          <dt>Discount</dt>
          <dd>− {money(invoice.discount_amount)}</dd>
          <dt>Taxable amount</dt>
          <dd>{money(taxable)}</dd>
          <dt>{taxLabel}{ratePct ? ` (${ratePct}%)` : ""}</dt>
          <dd>{money(invoice.tax_amount)}</dd>
          <dt className="border-t border-neutral-900 pt-1 font-bold">Grand total (NPR)</dt>
          <dd className="border-t border-neutral-900 pt-1 font-bold">{money(invoice.total_amount)}</dd>
          <dt>Paid</dt>
          <dd>{money(invoice.paid_amount)}</dd>
          <dt className="font-semibold">Balance due</dt>
          <dd className="font-semibold">{money(invoice.due_amount)}</dd>
        </dl>
      </section>

      {invoice.payments.length > 0 && (
        <p className="mt-3 text-[11px] text-neutral-600">
          Payment: {invoice.payments.map((p) => `${METHOD_LABEL[p.method] ?? p.method} ${money(p.amount)}`).join(", ")}
        </p>
      )}

      <footer className="mt-10 grid grid-cols-2 gap-6 text-[11px]">
        <div>
          <div className="mb-1 h-px w-40 bg-neutral-900" />
          Customer signature
        </div>
        <div className="text-right">
          <div className="mb-1 ml-auto h-px w-40 bg-neutral-900" />
          Authorised signatory
        </div>
        {seller?.footer && <p className="col-span-2 mt-2 text-center text-neutral-600">{seller.footer}</p>}
        <p className="col-span-2 text-center text-[10px] text-neutral-500">
          Printed by {printedBy} on {new Date().toLocaleString("en-GB")}
          {copyNumber > 0 ? " · This is a reprint" : ""}
        </p>
      </footer>
    </article>
  );
}
