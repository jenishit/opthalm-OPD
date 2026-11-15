"use client";

import { useState } from "react";
import { AlertTriangle, Building2, CalendarDays, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { OpsStat } from "@/components/ui/OpsStat";
import { PERIOD_OPTIONS, periodRange } from "../_components/platform-utils";
import { usePlatformOverview } from "../_components/use-platform";
import { ClinicDirectoryTable } from "../_components/ClinicDirectoryTable";

export default function PlatformClinicsPage() {
  const [days, setDays] = useState(30);
  const { from, to } = periodRange(days);
  const { data, loading, error, reload } = usePlatformOverview(from, to);
  const totals = data?.totals;
  const missingPlan = (totals?.no_plan_clinics ?? 0) + (totals?.cancelled_clinics ?? 0);
  const pending = totals?.pending_clinics ?? 0;
  const needsAttention = pending + (totals?.past_due_clinics ?? 0) + missingPlan;

  return (
    <div className="font-sans text-[13px] text-ink">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-mute">PLATFORM / TENANTS</div>
          <h1 className="m-0 font-display text-[29px] font-semibold tracking-[-0.5px] text-ink">
            Clinics
          </h1>
          <p className="m-0 mt-[7px] text-[12px] text-mute">
            Every tenant&apos;s people, patients, income and plan utilization in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-[7px] border border-line bg-card px-2.5 py-[7px] text-[10px] text-mute">
            <CalendarDays size={14} />
            <span className="sr-only">Reporting period</span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent text-[10px] text-ink outline-none"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.days} value={option.days}>{option.label}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            aria-label="Refresh clinics"
            className="grid size-9 place-items-center rounded-[7px] border border-line bg-card text-mute transition-colors hover:border-strong hover:text-ink disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <OpsStat
          label="Total clinics"
          value={totals ? totals.clinics.toLocaleString() : "…"}
          foot="tenants on the platform"
          icon={Building2}
          bg="bg-sage-soft"
          text="text-sage"
        />
        <OpsStat
          label="Active"
          value={totals ? totals.active_clinics.toLocaleString() : "…"}
          foot="fully subscribed clinics"
          icon={CheckCircle2}
          bg="bg-t-new-soft"
          text="text-t-new"
        />
        <OpsStat
          label="Trialing"
          value={totals ? totals.trialing_clinics.toLocaleString() : "…"}
          foot="inside their trial window"
          icon={Sparkles}
          bg="bg-warn-soft"
          text="text-warn-ink"
        />
        <OpsStat
          label="Need attention"
          value={totals ? needsAttention.toLocaleString() : "…"}
          foot={totals ? `${pending} awaiting activation · ${totals.past_due_clinics} past due · ${missingPlan} cancelled/no plan` : "pending, past due, cancelled or unprovisioned"}
          icon={AlertTriangle}
          bg="bg-bad-soft"
          text="text-bad-ink"
        />
      </div>

      <ClinicDirectoryTable
        clinics={data?.clinics ?? []}
        loading={loading}
        error={error}
        onRetry={reload}
      />
    </div>
  );
}
