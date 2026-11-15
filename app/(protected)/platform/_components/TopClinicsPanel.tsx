"use client";

import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { OpsNotice } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import type { PlatformClinicUsage } from "@/types/platform-types";
import { StatusPill } from "./StatusPill";
import { ClinicUsageSummary } from "./ResourceUtilizationPanel";
import { peakUsage, usageTone } from "./platform-utils";

/** Busiest tenants by invoiced revenue in the selected period. */
export function TopClinicsPanel({
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
  const rows = [...clinics]
    .sort((a, b) => b.period_revenue - a.period_revenue || b.patients - a.patients)
    .slice(0, 5);

  return (
    <div className="flex flex-col rounded-[11px] border border-line bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-[18px]">
        <div>
          <h3 className="m-0 font-display text-base font-semibold text-ink">Top clinics</h3>
          <p className="m-0 mt-[5px] text-[10px] text-mute">Ranked by invoiced revenue in this period</p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-sage-soft text-sage">
          <Building2 size={17} />
        </span>
      </div>

      {loading && clinics.length === 0 ? (
        <OpsNotice kind="loading" text="Loading clinics…" />
      ) : error && clinics.length === 0 ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : rows.length === 0 ? (
        <OpsNotice kind="empty" text="No clinics are reporting activity yet." />
      ) : (
        <ul className="flex flex-col">
          {rows.map((clinic, index) => {
            const peak = peakUsage(clinic);
            return (
              <li key={clinic.id} className="border-t border-line first:border-t-0">
                <Link
                  href={`/platform/clinics/${clinic.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-app"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-app text-[9px] font-bold text-mute">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <b className="truncate text-[11px] font-semibold text-ink">{clinic.clinic_name}</b>
                      <StatusPill status={clinic.subscription?.status} />
                    </span>
                    <small className="mt-0.5 block truncate text-[9px] text-mute">
                      {clinic.patients.toLocaleString()} patients · {clinic.period_visits.toLocaleString()} visits this period
                    </small>
                  </span>
                  <span className="shrink-0 text-right">
                    <b className="block text-[11px] font-semibold text-ink">{formatCurrency(clinic.period_revenue)}</b>
                    <span className={`block text-[9px] ${usageTone(peak)}`}>
                      {peak === null ? "Unlimited" : `${peak.toFixed(0)}% of plan`}
                    </span>
                  </span>
                  <ArrowUpRight size={12} className="shrink-0 text-mute" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-line px-5 py-3 text-[9px] text-mute">
        {rows[0] ? <ClinicUsageSummary clinic={rows[0]} /> : <span>{clinics.length} clinics</span>}
        <Link href="/platform/clinics" className="inline-flex items-center gap-1 font-semibold text-sage hover:underline">
          All clinics <ArrowUpRight size={11} />
        </Link>
      </div>
    </div>
  );
}
