"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { OpsNotice, fmtDate, opsCard } from "@/components/ui/OpsStat";
import { useAsync } from "@/lib/hooks/use-async";
import { formatCurrency } from "@/lib/utils";
import { listInvoices, searchInvoices } from "@/services/billing-services";
import type { Invoice } from "@/types/billing-types";

export function InvoiceSearch({ selectedId, onSelect }: { selectedId: string | null; onSelect: (invoice: Invoice) => void }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, loading, error, reload } = useAsync(() => (debounced ? searchInvoices(debounced, 25) : listInvoices(25, 0)));
  // Re-run when the debounced query changes.
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={`flex flex-col overflow-hidden ${opsCard}`}>
      <label className="flex items-center gap-2 border-b border-line px-4 py-3 text-muted-foreground">
        <Search size={15} aria-hidden />
        <input
          aria-label="Search invoices"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Invoice no, patient name or phone…"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
      {loading ? (
        <OpsNotice kind="loading" text="Loading invoices…" />
      ) : error ? (
        <OpsNotice kind="error" text={error} onRetry={reload} />
      ) : !data?.length ? (
        <OpsNotice kind="empty" text="No invoices found." />
      ) : (
        <ul className="max-h-[60vh] divide-y divide-line overflow-y-auto">
          {data.map((inv) => (
            <li key={inv.id}>
              <button
                type="button"
                onClick={() => onSelect(inv)}
                aria-current={selectedId === inv.id}
                className={"flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-app " + (selectedId === inv.id ? "bg-sage-soft" : "")}
              >
                <div className="min-w-0 flex-1">
                  <b className="block text-sm text-foreground">{inv.invoice_no}</b>
                  <span className="block truncate text-xs text-muted-foreground">
                    {inv.patient_name || "Walk-in customer"} · {fmtDate(inv.created_at)}
                  </span>
                </div>
                <div className="text-right">
                  <b className="block text-sm text-foreground">{formatCurrency(inv.total_amount)}</b>
                  <span className="text-xs capitalize text-muted-foreground">{inv.payment_status}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
