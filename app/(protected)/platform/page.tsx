"use client";

import { useState } from "react";
import {
  Building2,
  CalendarDays,
  HeartPulse,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { OpsNotice, OpsStat, opsCard } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import { PERIOD_OPTIONS, periodRange } from "./_components/platform-utils";
import { usePlatformOverview } from "./_components/use-platform";
import { RevenueTrendChart } from "./_components/RevenueTrendChart";
import { ResourceUtilizationPanel } from "./_components/ResourceUtilizationPanel";
import { TopClinicsPanel } from "./_components/TopClinicsPanel";
import { PlanHealthPanel, RoleMixPanel } from "./_components/MixPanels";

export default function PlatformOverviewPage() {
  const [days, setDays] = useState(30);
  const { from, to } = periodRange(days);
  const { data, loading, error, reload } = usePlatformOverview(from, to);
  const totals = data?.totals;
  const period = data?.period_stats;

  const value = (n: number | undefined) => (n === undefined ? "…" : n.toLocaleString());
  const money = (n: number | undefined) => (n === undefined ? "…" : formatCurrency(n));

  return (
    <div className="font-sans text-[13px] text-ink">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-mute">PLATFORM OPERATIONS</div>
          <h1 className="m-0 font-display text-[29px] font-semibold tracking-[-0.5px] text-ink">
            Platform overview
          </h1>
          <p className="m-0 mt-[7px] text-[12px] text-mute">
            Tenant health, resource utilization and money across every clinic on the platform.
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
            aria-label="Refresh platform analytics"
            className="grid size-9 place-items-center rounded-[7px] border border-line bg-card text-mute transition-colors hover:border-strong hover:text-ink disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && !data ? (
        <div className={`mb-4 ${opsCard}`}>
          <OpsNotice kind="error" text={error} onRetry={reload} />
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <OpsStat
          label="Clinics"
          value={value(totals?.clinics)}
          foot={
            totals
              ? `${totals.active_clinics} active · ${totals.trialing_clinics} trialing · ${totals.pending_clinics} pending · ${totals.past_due_clinics} past due`
              : "across the platform"
          }
          icon={Building2}
          bg="bg-sage-soft"
          text="text-sage"
        />
        <OpsStat
          label="Accounts"
          value={value(totals?.users)}
          foot={totals ? `${totals.staff_users.toLocaleString()} staff · ${totals.portal_users.toLocaleString()} patient portal` : "staff and portal logins"}
          icon={Users}
          bg="bg-t-new-soft"
          text="text-t-new"
        />
        <OpsStat
          label="Patients"
          value={value(totals?.patients)}
          foot={period ? `${period.new_patients.toLocaleString()} new in this period` : "registered records"}
          icon={HeartPulse}
          bg="bg-warn-soft"
          text="text-warn-ink"
        />
        <OpsStat
          label="Revenue (period)"
          value={money(period?.revenue)}
          foot={period ? `${formatCurrency(period.collected)} collected · ${period.invoices.toLocaleString()} invoices` : "invoiced in this period"}
          icon={Wallet}
          bg="bg-t-surg-soft"
          text="text-t-surg"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 divide-line rounded-[11px] border border-line bg-card shadow-sm md:grid-cols-4 md:divide-x">
        {[
          { label: "Collected (lifetime)", value: money(totals?.collected) },
          { label: "Outstanding", value: money(totals?.outstanding) },
          { label: "Visits (lifetime)", value: value(totals?.visits) },
          { label: "Invoices (lifetime)", value: value(totals?.invoices) },
        ].map((item, index) => (
          <div key={item.label} className={index > 1 ? "border-t border-line px-4 py-3 md:border-t-0" : "px-4 py-3"}>
            <span className="block text-[9px] uppercase tracking-[0.6px] text-mute">{item.label}</span>
            <b className="mt-1 block font-display text-[17px] font-semibold text-ink">{item.value}</b>
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <RevenueTrendChart
          points={data?.revenue_trend ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
        />
        <ResourceUtilizationPanel
          clinics={data?.clinics ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <TopClinicsPanel
          clinics={data?.clinics ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
        />
        <div className="flex flex-col gap-4">
          <PlanHealthPanel totals={totals ?? EMPTY_TOTALS} />
          <RoleMixPanel roles={data?.role_breakdown ?? []} />
        </div>
      </div>
    </div>
  );
}

const EMPTY_TOTALS = {
  clinics: 0,
  active_clinics: 0,
  trialing_clinics: 0,
  pending_clinics: 0,
  past_due_clinics: 0,
  cancelled_clinics: 0,
  no_plan_clinics: 0,
  users: 0,
  staff_users: 0,
  portal_users: 0,
  patients: 0,
  visits: 0,
  invoices: 0,
  revenue: 0,
  collected: 0,
  outstanding: 0,
};
