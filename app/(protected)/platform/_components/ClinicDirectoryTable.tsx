"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { OpsNotice, opsCard } from "@/components/ui/OpsStat";
import { Pager } from "@/components/ui/Pager";
import { usePagination } from "@/lib/hooks/use-pagination";
import { formatCurrency } from "@/lib/utils";
import type { PlatformClinicUsage } from "@/types/platform-types";
import { StatusPill } from "./StatusPill";
import { MiniUsage } from "./UsageMeter";
import { formatDate, peakUsage } from "./platform-utils";

const STATUS_OPTIONS = [
  { value: "all", label: "All plans" },
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "pending", label: "Pending setup" },
  { value: "past_due", label: "Past due" },
  { value: "cancelled", label: "Cancelled" },
  { value: "none", label: "No plan" },
] as const;

const SORT_OPTIONS = [
  { value: "revenue", label: "Revenue this period" },
  { value: "patients", label: "Patients" },
  { value: "users", label: "Accounts" },
  { value: "utilization", label: "Utilization" },
  { value: "name", label: "Clinic name" },
] as const;

export function ClinicDirectoryTable({
  clinics,
  loading,
  error,
  onRetry,
}: {
  clinics: PlatformClinicUsage[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<string>("revenue");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = clinics.filter((clinic) => {
      const matchesQuery =
        !needle ||
        `${clinic.clinic_name} ${clinic.workspace_slug} ${clinic.email} ${clinic.phone}`
          .toLowerCase()
          .includes(needle);
      const clinicStatus = clinic.subscription?.status ?? "none";
      const matchesStatus = status === "all" || clinicStatus === status;
      return matchesQuery && matchesStatus;
    });

    return [...rows].sort((a, b) => {
      switch (sort) {
        case "patients":
          return b.patients - a.patients;
        case "users":
          return b.users - a.users;
        case "utilization": {
          const pa = peakUsage(a) ?? -1;
          const pb = peakUsage(b) ?? -1;
          return pb - pa;
        }
        case "name":
          return a.clinic_name.localeCompare(b.clinic_name);
        default:
          return b.period_revenue - a.period_revenue;
      }
    });
  }, [clinics, query, status, sort]);

  const pg = usePagination(filtered, `${query}|${status}|${sort}`, 25);

  return (
    <div className={`overflow-hidden ${opsCard}`}>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-[18px] py-4">
        <label className="flex h-9 min-w-[215px] flex-1 items-center gap-2 rounded-lg border border-line bg-card px-2.5 text-mute md:max-w-xs">
          <Search size={14} aria-hidden />
          <input
            aria-label="Search clinics"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clinic, slug, email or phone…"
            className="w-full bg-transparent text-[11px] text-ink outline-none placeholder:text-mute"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-[7px] text-[10px] text-mute">
            <SlidersHorizontal size={12} />
            <span className="sr-only">Filter by plan status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-[10px] text-ink outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-[7px] text-[10px] text-mute">
            <span>Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-[10px] text-ink outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
        <span className="ml-auto text-[10px] text-mute">{filtered.length} of {clinics.length}</span>
      </div>

      {loading && clinics.length === 0 ? (
        <OpsNotice kind="loading" text="Loading clinics…" />
      ) : error && clinics.length === 0 ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : filtered.length === 0 ? (
        <OpsNotice kind="empty" text={clinics.length ? "No clinic matches these filters." : "No clinics yet."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse whitespace-nowrap text-left">
            <thead className="bg-app">
              <tr>
                {["CLINIC", "PLAN", "ACCOUNTS", "PATIENTS", "REVENUE (PERIOD)", "RESOURCE USE", "LAST ACTIVITY", ""].map((header) => (
                  <th key={header} className="px-[15px] py-3 text-[9px] font-bold tracking-[0.7px] text-mute">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pg.pageItems.map((clinic) => (
                <tr key={clinic.id} className="group hover:bg-app">
                  <td className="border-t border-line px-[15px] py-3">
                    <Link href={`/platform/clinics/${clinic.id}`} className="flex min-w-0 max-w-[230px] flex-col gap-0.5">
                      <b className="truncate text-[11px] font-semibold text-ink group-hover:text-sage">{clinic.clinic_name}</b>
                      <span className="truncate text-[9px] text-mute">
                        {clinic.workspace_slug ? `${clinic.workspace_slug} · ` : ""}{clinic.email || "No email"}
                      </span>
                    </Link>
                  </td>
                  <td className="border-t border-line px-[15px] py-3">
                    <div className="flex flex-col items-start gap-1">
                      <StatusPill status={clinic.subscription?.status} />
                      <span className="text-[9px] text-mute">
                        {clinic.subscription?.plan_name || "No plan assigned"}
                        {clinic.subscription ? ` · ends ${formatDate(clinic.subscription.current_period_end)}` : ""}
                      </span>
                    </div>
                  </td>
                  <td className="border-t border-line px-[15px] py-3 text-[11px] text-ink">{clinic.users.toLocaleString()}</td>
                  <td className="border-t border-line px-[15px] py-3">
                    <b className="text-[11px] font-semibold text-ink">{clinic.patients.toLocaleString()}</b>
                    <span className="block text-[9px] text-mute">+{clinic.period_patients.toLocaleString()} this period</span>
                  </td>
                  <td className="border-t border-line px-[15px] py-3">
                    <b className="text-[11px] font-semibold text-ink">{formatCurrency(clinic.period_revenue)}</b>
                    <span className="block text-[9px] text-mute">{formatCurrency(clinic.revenue)} lifetime</span>
                  </td>
                  <td className="border-t border-line px-[15px] py-3">
                    <MiniUsage subscription={clinic.subscription} />
                  </td>
                  <td className="border-t border-line px-[15px] py-3 text-[10px] text-mute">
                    {formatDate(clinic.last_activity_at)}
                  </td>
                  <td className="border-t border-line px-[10px] py-3">
                    <Link
                      href={`/platform/clinics/${clinic.id}`}
                      aria-label={`Open ${clinic.clinic_name}`}
                      className="grid size-7 place-items-center rounded-md text-mute transition-colors hover:bg-card hover:text-ink"
                    >
                      <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <Pager
          page={pg.page}
          pageCount={pg.pageCount}
          pageSize={pg.pageSize}
          total={pg.total}
          onPage={pg.setPage}
          onPageSize={pg.setPageSize}
          noun="clinics"
        />
      )}
    </div>
  );
}
