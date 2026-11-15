"use client";

import { usePagination } from "@/lib/hooks/use-pagination";
import { Pager } from "@/components/ui/Pager";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { OpsNotice, fmtDate, opsCard, shortId } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import { ApiError } from "@/services/http";
import { updateLabJobStatus } from "@/services/lab-services";
import type { LabJob, LabJobStatus } from "@/types/lab-types";
import { NEXT_STATUSES, STATUS_LABEL, STATUS_STYLE, isActive, type StatusTab } from "./status";

const TABS: { id: StatusTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "in_fitting", label: "In fitting" },
  { id: "ready_to_deliver", label: "Ready" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export function OrdersTable({
  jobs,
  loading,
  error,
  onRetry,
  onChanged,
  tab,
  onTabChange,
}: {
  jobs: LabJob[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onChanged: () => void;
  tab: StatusTab;
  onTabChange: (t: StatusTab) => void;
}) {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (tab === "active" ? !isActive(j) : j.status !== tab) return false;
      return !q || `${j.patient_name} ${j.job_type} ${j.vendor_name ?? ""} ${shortId(j.id)}`.toLowerCase().includes(q);
    });
  }, [jobs, tab, query]);

  const pg = usePagination(filtered, `${tab}|${query}`);

  async function move(job: LabJob, status: LabJobStatus) {
    if (busyId) return;
    setBusyId(job.id);
    try {
      await updateLabJobStatus(job.id, { status });
      toast.success(`Order marked ${STATUS_LABEL[status].toLowerCase()}`);
      onChanged();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update the order");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={`overflow-hidden ${opsCard}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-[18px] py-4">
        <div role="tablist" className="flex flex-wrap gap-[3px] rounded-lg bg-app p-[3px]">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onTabChange(t.id)}
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
            aria-label="Search orders"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, patient or type…"
            className="w-full bg-transparent text-[11px] text-ink outline-none placeholder:text-mute"
          />
        </label>
      </div>

      {loading ? (
        <OpsNotice kind="loading" text="Loading orders…" />
      ) : error ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : filtered.length === 0 ? (
        <OpsNotice kind="empty" text="No orders in this view." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap text-left">
            <thead className="bg-app">
              <tr>
                {["ORDER", "PATIENT", "ORDER TYPE", "LAB / VENDOR", "STATUS", "EXPECTED", "ADVANCE", ""].map((h) => (
                  <th key={h} className="px-[17px] py-3 text-[9px] font-bold tracking-[0.7px] text-mute">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pg.pageItems.map((j) => {
                const status = j.status as LabJobStatus;
                const next = NEXT_STATUSES[status] ?? [];
                return (
                  <tr key={j.id} className="hover:bg-app">
                    <td className="border-t border-line px-[17px] py-3 font-mono text-[10px] text-mute">{shortId(j.id)}</td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] font-bold text-ink">{j.patient_name}</td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] text-mute">{j.job_type}</td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] text-mute">{j.vendor_name ?? "—"}</td>
                    <td className="border-t border-line px-[17px] py-3">
                      <span className={"inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " + (STATUS_STYLE[status] ?? "bg-warn-soft text-warn-ink")}>
                        <i className="size-[5px] rounded-full bg-current opacity-80" />
                        {STATUS_LABEL[status] ?? j.status}
                      </span>
                    </td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] text-mute">{fmtDate(j.expected_delivery_date)}</td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] font-bold text-ink">{formatCurrency(j.advance_payment)}</td>
                    <td className="border-t border-line px-[17px] py-3">
                      {next.length > 0 && (
                        <select
                          aria-label={`Update status for ${j.patient_name}`}
                          disabled={busyId === j.id}
                          value=""
                          onChange={(e) => e.target.value && move(j, e.target.value as LabJobStatus)}
                          className="h-8 rounded-md border border-line bg-card px-2 text-[10px] text-ink"
                        >
                          <option value="">Move to…</option>
                          {next.map((s) => (
                            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && <Pager page={pg.page} pageCount={pg.pageCount} pageSize={pg.pageSize} total={pg.total} onPage={pg.setPage} onPageSize={pg.setPageSize} noun="orders" />}
    </div>
  );
}
