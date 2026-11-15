"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Gauge } from "lucide-react";
import { OpsNotice } from "@/components/ui/OpsStat";
import type { PlatformClinicUsage } from "@/types/platform-types";
import { UsageMeter } from "./UsageMeter";
import { peakUsage, usageBarColor, usageMetrics, usageTone } from "./platform-utils";

interface Aggregate {
  used: number;
  limit: number;
  limitedClinics: number;
  unlimitedClinics: number;
}

function aggregate(clinics: PlatformClinicUsage[], key: "seats" | "patients" | "locations"): Aggregate {
  let used = 0;
  let limit = 0;
  let limitedClinics = 0;
  let unlimitedClinics = 0;

  for (const clinic of clinics) {
    const metric = usageMetrics(clinic.subscription).find((m) => m.key === key);
    if (!metric) continue;
    if (metric.limit === null) {
      unlimitedClinics++;
      continue;
    }
    limitedClinics++;
    used += metric.used;
    limit += metric.limit;
  }

  return { used, limit, limitedClinics, unlimitedClinics };
}

/** Platform-wide plan usage plus the tenants closest to (or over) their caps. */
export function ResourceUtilizationPanel({
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
  const seats = aggregate(clinics, "seats");
  const patients = aggregate(clinics, "patients");
  const locations = aggregate(clinics, "locations");

  const atRisk = clinics
    .map((clinic) => {
      const peak = peakUsage(clinic);
      const top = usageMetrics(clinic.subscription)
        .filter((m) => m.percent !== null)
        .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0))[0];
      return { clinic, peak, top };
    })
    .filter((row): row is { clinic: PlatformClinicUsage; peak: number; top: NonNullable<ReturnType<typeof usageMetrics>[number]> } =>
      row.peak !== null && row.peak >= 80 && row.top !== undefined,
    )
    .sort((a, b) => b.peak - a.peak)
    .slice(0, 4);

  return (
    <div className="flex flex-col rounded-[11px] border border-line bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-[18px]">
        <div>
          <h3 className="m-0 font-display text-base font-semibold text-ink">Resource utilization</h3>
          <p className="m-0 mt-[5px] text-[10px] text-mute">Live usage against the limits on capped plans</p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-t-surg-soft text-t-surg">
          <Gauge size={17} />
        </span>
      </div>

      {loading && clinics.length === 0 ? (
        <OpsNotice kind="loading" text="Loading utilization…" />
      ) : error && clinics.length === 0 ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : (
        <div className="flex flex-col gap-4 px-5">
          <UsageMeter
            label="Team seats"
            used={seats.used}
            limit={seats.limitedClinics ? seats.limit : null}
            hint={
              seats.limitedClinics
                ? `${seats.limitedClinics} capped clinic${seats.limitedClinics === 1 ? "" : "s"}${seats.unlimitedClinics ? ` · ${seats.unlimitedClinics} unlimited` : ""}`
                : `${seats.unlimitedClinics} clinic${seats.unlimitedClinics === 1 ? "" : "s"} on unlimited seats`
            }
          />
          <UsageMeter
            label="Patient records"
            used={patients.used}
            limit={patients.limitedClinics ? patients.limit : null}
            hint={
              patients.limitedClinics
                ? `${patients.limitedClinics} capped clinic${patients.limitedClinics === 1 ? "" : "s"}${patients.unlimitedClinics ? ` · ${patients.unlimitedClinics} unlimited` : ""}`
                : `${patients.unlimitedClinics} clinic${patients.unlimitedClinics === 1 ? "" : "s"} on unlimited records`
            }
          />
          <UsageMeter
            label="Locations"
            used={locations.used}
            limit={locations.limitedClinics ? locations.limit : null}
            hint={
              locations.limitedClinics
                ? `${locations.limitedClinics} capped clinic${locations.limitedClinics === 1 ? "" : "s"}${locations.unlimitedClinics ? ` · ${locations.unlimitedClinics} unlimited` : ""}`
                : `${locations.unlimitedClinics} clinic${locations.unlimitedClinics === 1 ? "" : "s"} on unlimited locations`
            }
          />

          <div className="border-t border-line pt-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-warn-ink">
                <AlertTriangle size={12} /> Needs attention
              </span>
              <span className="text-[9px] text-mute">≥ 80% of any limit</span>
            </div>
            {atRisk.length === 0 ? (
              <p className="py-3 text-[10px] text-mute">No clinic is near a plan limit right now.</p>
            ) : (
              <ul className="flex flex-col">
                {atRisk.map(({ clinic, peak, top }) => (
                  <li key={clinic.id}>
                    <Link
                      href={`/platform/clinics/${clinic.id}`}
                      className="flex items-center gap-2.5 rounded-md px-1 py-2 transition-colors hover:bg-app"
                    >
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[10px] font-semibold text-ink">{clinic.clinic_name}</b>
                        <small className="block truncate text-[9px] text-mute">
                          {top.label}: {top.used.toLocaleString()} / {top.limit?.toLocaleString()}
                        </small>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-1 w-12 overflow-hidden rounded-full bg-line">
                          <span
                            className="block h-full rounded-full"
                            style={{ width: `${Math.max(peak, 3)}%`, backgroundColor: usageBarColor(peak) }}
                          />
                        </span>
                        <span className={`w-8 text-right text-[9px] font-semibold ${usageTone(peak)}`}>
                          {peak.toFixed(0)}%
                        </span>
                        <ArrowUpRight size={11} className="text-mute" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line px-5 py-3 text-[9px] text-mute">
        <span>{clinics.length} clinics monitored</span>
        <Link href="/platform/clinics" className="inline-flex items-center gap-1 font-semibold text-sage hover:underline">
          Inspect clinics <ArrowUpRight size={11} />
        </Link>
      </div>
    </div>
  );
}

export function ClinicUsageSummary({ clinic }: { clinic: PlatformClinicUsage }) {
  const metrics = usageMetrics(clinic.subscription);
  if (!metrics.length) return <span className="text-[10px] text-mute">No plan</span>;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {metrics.map((m) => (
        <span key={m.key} className="inline-flex items-center gap-1 text-[9px] text-mute">
          {m.label.replace("Team ", "").replace(" records", "")}
          <b className={usageTone(m.percent)}>{m.percent === null ? "∞" : `${m.percent.toFixed(0)}%`}</b>
        </span>
      ))}
    </div>
  );
}

