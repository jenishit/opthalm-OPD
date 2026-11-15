"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  HeartPulse,
  MapPin,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { OpsNotice, OpsStat, opsCard } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import type { PlatformSubscriptionUsage } from "@/types/platform-types";
import { PERIOD_OPTIONS, formatDate, periodRange, roleLabel } from "../../_components/platform-utils";
import { usePlatformClinic } from "../../_components/use-platform";
import { StatusPill } from "../../_components/StatusPill";
import { UsageMeter } from "../../_components/UsageMeter";
import { RevenueTrendChart } from "../../_components/RevenueTrendChart";
import { ClinicActivationPanel } from "./_components/ClinicActivationPanel";

export default function PlatformClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState(30);
  const { from, to } = periodRange(days);
  const { data, loading, error, reload } = usePlatformClinic(id, from, to);

  const clinic = data?.clinic;
  const subscription = clinic?.subscription ?? null;

  return (
    <div className="font-sans text-[13px] text-ink">
      <Link
        href="/platform/clinics"
        className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-mute hover:text-ink"
      >
        <ArrowLeft size={14} /> All clinics
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-mute">PLATFORM / TENANT</div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="m-0 truncate font-display text-[29px] font-semibold tracking-[-0.5px] text-ink">
              {clinic?.clinic_name ?? (loading ? "Loading clinic…" : "Clinic")}
            </h1>
            {clinic ? <StatusPill status={subscription?.status} /> : null}
          </div>
          <p className="m-0 mt-[7px] text-[12px] text-mute">
            {[
              clinic?.workspace_slug,
              data?.registration_no ? `Reg. ${data.registration_no}` : null,
              clinic?.email,
              clinic?.phone,
            ]
              .filter(Boolean)
              .join(" · ") || "Tenant profile, people, usage and income."}
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
            aria-label="Refresh clinic analytics"
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
          label="Accounts"
          value={clinic ? clinic.users.toLocaleString() : "…"}
          foot={data ? `${data.staff.length.toLocaleString()} staff profiles` : "staff and portal logins"}
          icon={Users}
          bg="bg-t-new-soft"
          text="text-t-new"
        />
        <OpsStat
          label="Patients"
          value={clinic ? clinic.patients.toLocaleString() : "…"}
          foot={clinic ? `+${clinic.period_patients.toLocaleString()} this period` : "registered records"}
          icon={HeartPulse}
          bg="bg-warn-soft"
          text="text-warn-ink"
        />
        <OpsStat
          label="Revenue (period)"
          value={clinic ? formatCurrency(clinic.period_revenue) : "…"}
          foot={clinic ? `${formatCurrency(clinic.revenue)} lifetime` : "invoiced in this period"}
          icon={Wallet}
          bg="bg-t-surg-soft"
          text="text-t-surg"
        />
        <OpsStat
          label="Visits (period)"
          value={clinic ? clinic.period_visits.toLocaleString() : "…"}
          foot={clinic ? `${clinic.visits.toLocaleString()} lifetime` : "examinations recorded"}
          icon={Building2}
          bg="bg-sage-soft"
          text="text-sage"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 divide-line rounded-[11px] border border-line bg-card shadow-sm md:grid-cols-4 md:divide-x">
        {[
          { label: "Collected (lifetime)", value: clinic ? formatCurrency(clinic.collected) : "…" },
          { label: "Outstanding", value: clinic ? formatCurrency(clinic.outstanding) : "…" },
          { label: "Invoices (lifetime)", value: clinic ? clinic.invoices.toLocaleString() : "…" },
          { label: "Last activity", value: formatDate(clinic?.last_activity_at) },
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
          title="Revenue trend"
          description="Invoiced amount and money collected in this clinic"
        />

        <div className={`overflow-hidden ${opsCard}`}>
          <div className="px-5 pb-4 pt-[18px]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="m-0 font-display text-base font-semibold text-ink">Plan & usage</h3>
                <p className="m-0 mt-[5px] text-[10px] text-mute">
                  {subscription ? `${subscription.plan_name || "No plan name"} · ends ${formatDate(subscription.current_period_end)}` : "This clinic has no subscription row"}
                </p>
              </div>
              <StatusPill status={subscription?.status} />
            </div>
          </div>
          <div className="flex flex-col gap-4 px-5 pb-5">
            {subscription ? (
              <SubscriptionMeters subscription={subscription} />
            ) : (
              <p className="m-0 text-[10px] text-mute">
                Assign a plan below to start metering seats, patient records and locations.
              </p>
            )}
          </div>
          <ClinicActivationPanel
            key={`${subscription?.status ?? "none"}|${subscription?.plan_name ?? ""}|${subscription?.current_period_end ?? ""}`}
            clinicId={id}
            clinicName={clinic?.clinic_name ?? "This clinic"}
            subscription={subscription}
            onDone={reload}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className={`overflow-hidden ${opsCard}`}>
          <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-[18px]">
            <div>
              <h3 className="m-0 font-display text-base font-semibold text-ink">Team</h3>
              <p className="m-0 mt-[5px] text-[10px] text-mute">Every account in this tenant and what they have recorded</p>
            </div>
            <span className="text-[10px] text-mute">{data?.staff.length ?? 0} people</span>
          </div>

          {loading && !data ? (
            <OpsNotice kind="loading" text="Loading team…" />
          ) : !data?.staff.length ? (
            <OpsNotice kind="empty" text="No accounts in this clinic yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse whitespace-nowrap text-left">
                <thead className="bg-app">
                  <tr>
                    {["MEMBER", "ROLE", "JOINED", "PATIENTS", "VISITS", "INVOICES", "COLLECTED"].map((header) => (
                      <th key={header} className="px-[15px] py-3 text-[9px] font-bold tracking-[0.7px] text-mute">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.staff.map((member) => (
                    <tr key={member.id} className="hover:bg-app">
                      <td className="border-t border-line px-[15px] py-3">
                        <b className="block max-w-[220px] truncate text-[11px] font-semibold text-ink">
                          {member.full_name || member.email || "Unnamed account"}
                        </b>
                        <span className="block max-w-[220px] truncate text-[9px] text-mute">
                          {member.phone || member.email}
                        </span>
                      </td>
                      <td className="border-t border-line px-[15px] py-3 text-[10px] text-mute">{roleLabel(member.role_name)}</td>
                      <td className="border-t border-line px-[15px] py-3 text-[10px] text-mute">{formatDate(member.created_at)}</td>
                      <td className="border-t border-line px-[15px] py-3 text-[11px] text-ink">{member.patients_registered.toLocaleString()}</td>
                      <td className="border-t border-line px-[15px] py-3 text-[11px] text-ink">{member.visits_examined.toLocaleString()}</td>
                      <td className="border-t border-line px-[15px] py-3 text-[11px] text-ink">{member.invoices_created.toLocaleString()}</td>
                      <td className="border-t border-line px-[15px] py-3 text-[11px] font-semibold text-ink">
                        {formatCurrency(member.revenue_collected)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`overflow-hidden ${opsCard}`}>
          <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-[18px]">
            <div>
              <h3 className="m-0 font-display text-base font-semibold text-ink">Locations</h3>
              <p className="m-0 mt-[5px] text-[10px] text-mute">Rooms and sites this clinic operates</p>
            </div>
            <MapPin size={15} className="text-mute" aria-hidden />
          </div>

          {loading && !data ? (
            <OpsNotice kind="loading" text="Loading locations…" />
          ) : !data?.locations.length ? (
            <OpsNotice kind="empty" text="No locations configured yet." />
          ) : (
            <ul className="flex flex-col divide-y divide-line border-t border-line">
              {data.locations.map((location) => (
                <li key={location.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <b className="truncate text-[11px] font-semibold text-ink">{location.name}</b>
                    <span className="shrink-0 rounded-[5px] bg-app px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.4px] text-mute">
                      {location.status || "active"}
                    </span>
                  </div>
                  <p className="m-0 mt-0.5 truncate text-[9px] text-mute">{location.address || "No address recorded"}</p>
                  <p className="m-0 mt-1 text-[9px] text-mute">
                    {location.exam_rooms.toLocaleString()} exam room{location.exam_rooms === 1 ? "" : "s"} · added {formatDate(location.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {data?.address ? (
            <div className="border-t border-line px-5 py-3">
              <span className="block text-[9px] uppercase tracking-[0.6px] text-mute">Registered address</span>
              <p className="m-0 mt-0.5 text-[10px] text-ink">{data.address}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SubscriptionMeters({ subscription }: { subscription: PlatformSubscriptionUsage }) {
  return (
    <div className="flex flex-col gap-4">
      <UsageMeter
        label="Team seats"
        used={subscription.seats_used}
        limit={subscription.seats_limit}
        hint={subscription.seats_limit === null ? "Unlimited seats on this plan" : undefined}
      />
      <UsageMeter
        label="Patient records"
        used={subscription.patient_records_used}
        limit={subscription.patient_records_limit}
        hint={subscription.patient_records_limit === null ? "Unlimited records on this plan" : undefined}
      />
      <UsageMeter
        label="Locations"
        used={subscription.locations_used}
        limit={subscription.locations_limit}
        hint={subscription.locations_limit === null ? "Unlimited locations on this plan" : undefined}
      />
    </div>
  );
}
