"use client";

import { usePagination } from "@/lib/hooks/use-pagination";
import { Pager } from "@/components/ui/Pager";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { OpsNotice, fmtDate, opsCard, shortId } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import type { Purchase } from "@/types/inventory-types";

type PayState = "paid" | "partial" | "unpaid";
const payState = (p: Purchase): PayState => (p.due_amount <= 0 ? "paid" : p.paid_amount > 0 ? "partial" : "unpaid");
const STYLE: Record<PayState, string> = {
  paid: "bg-ok-soft text-ok-ink",
  partial: "bg-warn-soft text-warn-ink",
  unpaid: "bg-bad-soft text-bad-ink",
};
const LABEL: Record<PayState, string> = { paid: "Paid", partial: "Partly paid", unpaid: "Unpaid" };
const TABS: { id: "all" | PayState; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "partial", label: "Partly paid" },
  { id: "paid", label: "Paid" },
];

export function PurchasesTable({
  purchases,
  loading,
  error,
  onRetry,
}: {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [tab, setTab] = useState<"all" | PayState>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return purchases.filter(
      (p) =>
        (tab === "all" || payState(p) === tab) &&
        (!q || `${p.vendor_name} ${p.invoice_ref_no ?? ""} ${shortId(p.id)}`.toLowerCase().includes(q)),
    );
  }, [purchases, tab, query]);

  const pg = usePagination(filtered, `${tab}|${query}`);

  return (
    <div className={`overflow-hidden ${opsCard}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-[18px] py-4">
        <div role="tablist" className="flex flex-wrap gap-[3px] rounded-lg bg-app p-[3px]">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={
                "whitespace-nowrap rounded-md px-3 py-2 text-[10px] " +
                (tab === t.id ? "bg-card font-bold text-sage shadow-sm" : "text-mute")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="flex h-9 min-w-[215px] items-center gap-2 rounded-lg border border-line bg-card px-2.5 text-mute">
          <Search size={14} aria-hidden />
          <input
            aria-label="Search purchases"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendor or bill no…"
            className="w-full bg-transparent text-[11px] text-ink outline-none placeholder:text-mute"
          />
        </label>
      </div>

      {loading ? (
        <OpsNotice kind="loading" text="Loading purchases…" />
      ) : error ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : filtered.length === 0 ? (
        <OpsNotice kind="empty" text={purchases.length ? "No purchases match." : "No purchases recorded yet."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap text-left">
            <thead className="bg-app">
              <tr>
                {["REF", "VENDOR", "BILL NO", "ITEMS", "PAYMENT", "DATE", "TOTAL", "DUE"].map((h) => (
                  <th key={h} className="px-[17px] py-3 text-[9px] font-bold tracking-[0.7px] text-mute">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pg.pageItems.map((p) => {
                const s = payState(p);
                return (
                  <tr key={p.id} className="hover:bg-app">
                    <td className="border-t border-line px-[17px] py-3 font-mono text-[10px] text-mute">{shortId(p.id)}</td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] font-bold text-ink">{p.vendor_name}</td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] text-mute">{p.invoice_ref_no ?? "—"}</td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] text-mute">{p.items.length}</td>
                    <td className="border-t border-line px-[17px] py-3">
                      <span className={"inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " + STYLE[s]}>
                        <i className="size-[5px] rounded-full bg-current opacity-80" />
                        {LABEL[s]}
                      </span>
                    </td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] text-mute">{fmtDate(p.purchase_date)}</td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] font-bold text-ink">{formatCurrency(p.total_amount)}</td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] font-bold text-ink">{formatCurrency(p.due_amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && <Pager page={pg.page} pageCount={pg.pageCount} pageSize={pg.pageSize} total={pg.total} onPage={pg.setPage} onPageSize={pg.setPageSize} noun="purchases" />}
    </div>
  );
}
