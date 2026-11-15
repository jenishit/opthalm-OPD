"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { OpsNotice, fmtDate, opsCard } from "@/components/ui/OpsStat";
import { useAsync } from "@/lib/hooks/use-async";
import { formatCurrency } from "@/lib/utils";
import { getInvoice } from "@/services/billing-services";
import { useAuthStore } from "@/stores/authStore";
import { RefundForm } from "./RefundForm";

export function RefundPanel({ invoiceId, onRefunded }: { invoiceId: string; onRefunded: () => void }) {
  const role = useAuthStore((s) => s.staffUser?.role);
  const canRefund = role === "admin" || role === "superadmin";
  const { data: invoice, loading, error, reload } = useAsync(() => getInvoice(invoiceId));

  if (loading) return <OpsNotice kind="loading" text="Loading invoice…" />;
  if (error || !invoice) return <OpsNotice kind="error" text={error ?? "Invoice not found"} onRetry={reload} />;

  // paid_amount is already net of earlier refunds (the backend lowers it).
  const refundable = invoice.paid_amount;

  const row = (l: string, v: string, bold = false) => (
    <div className={"flex justify-between text-sm " + (bold ? "font-semibold text-foreground" : "text-muted-foreground")}>
      <span>{l}</span>
      <span className={bold ? "" : "text-foreground"}>{v}</span>
    </div>
  );

  return (
    <div className={`space-y-4 p-5 ${opsCard}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">{invoice.invoice_no}</h2>
          <p className="text-xs text-muted-foreground">
            {invoice.patient_name || "Walk-in customer"} · {fmtDate(invoice.created_at)} · <span className="capitalize">{invoice.status}</span>
          </p>
        </div>
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/pos/invoice/${invoice.id}`}><Printer />Reprint</Link>
        </Button>
      </div>

      <div className="space-y-1.5 rounded-md border border-line bg-app p-3.5">
        {row("Invoice total", formatCurrency(invoice.total_amount))}
        {row("Currently paid (net of refunds)", formatCurrency(invoice.paid_amount), true)}
        {row("Balance due", formatCurrency(invoice.due_amount))}
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Items</p>
        <ul className="space-y-1 text-sm">
          {invoice.items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3">
              <span className="text-foreground">{it.description} × {it.quantity}</span>
              <span className="text-muted-foreground">{formatCurrency(it.line_total)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Payment records ({invoice.payments.length}) include any refunds already issued — the paid amount above is the
          net figure.
        </p>
      </div>

      {!canRefund ? (
        <p role="note" className="rounded-md bg-warn-soft px-3 py-2 text-xs text-warn-ink">
          Only an admin can issue refunds. Ask an admin to process this one.
        </p>
      ) : refundable <= 0 ? (
        <p role="note" className="rounded-md bg-app px-3 py-2 text-xs text-muted-foreground">Nothing left to refund on this invoice.</p>
      ) : (
        <RefundForm invoice={invoice} onRefunded={() => { reload(); onRefunded(); }} />
      )}
    </div>
  );
}
