"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { OpsNotice, opsCard } from "@/components/ui/OpsStat";
import { useAsync } from "@/lib/hooks/use-async";
import { listShifts, onShiftChange } from "@/lib/pos/shift";
import { formatCurrency } from "@/lib/utils";

export function ShiftsList() {
  const { data, loading, error, reload } = useAsync(listShifts);
  useEffect(() => onShiftChange(reload), [reload]);

  return (
    <div className="space-y-4">
      <Button variant="ghost" asChild>
        <Link href="/pos"><ArrowLeft />Back to POS</Link>
      </Button>
      <div className={`overflow-hidden ${opsCard}`}>
        {loading ? (
          <OpsNotice kind="loading" text="Loading shifts…" />
        ) : error ? (
          <OpsNotice kind="error" text={error} onRetry={reload} />
        ) : !data?.length ? (
          <OpsNotice kind="empty" text="No shifts on this terminal yet. Open one from the POS header." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse whitespace-nowrap text-left text-sm">
              <thead className="bg-app">
                <tr>
                  {["Z #", "Opened", "Closed", "Cashier", "Net sales", "Variance", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((s) => (
                  <tr key={s.id} className="border-t border-line hover:bg-app">
                    <td className="px-4 py-3 font-mono">{s.z ? String(s.z.zNumber).padStart(4, "0") : "—"}</td>
                    <td className="px-4 py-3">{new Date(s.openedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{s.closedAt ? new Date(s.closedAt).toLocaleString() : <span className="rounded bg-ok-soft px-2 py-0.5 text-xs font-semibold text-ok-ink">Open</span>}</td>
                    <td className="px-4 py-3">{s.openedBy}</td>
                    <td className="px-4 py-3 font-semibold">{s.z ? formatCurrency(s.z.netSales) : "—"}</td>
                    <td className={"px-4 py-3 " + (s.z && s.z.variance !== 0 ? "text-bad-ink" : "")}>
                      {s.z ? (s.z.variance === 0 ? "Balanced" : `${s.z.variance < 0 ? "Short" : "Over"} ${formatCurrency(Math.abs(s.z.variance))}`) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/pos/shifts/${s.id}`}>{s.closedAt ? "View Z-report" : "X-report"}</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Shifts are stored on this device. Back them up by printing each Z-report when you close.
      </p>
    </div>
  );
}
