"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { OpsNotice } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import type { DayPoint } from "./use-dashboard";

/**
 * This week at a glance. Admins see sales and money collected per day (from the
 * daily sales reports); every other role sees visits per day — those figures
 * are real for their role rather than hidden or invented.
 */
export default function PerformanceChart({
  points,
  isAdmin,
  loading,
  error,
  onRetry,
}: {
  points: DayPoint[];
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const total = points.reduce((s, p) => s + p.primary, 0);
  const collected = points.reduce((s, p) => s + (p.secondary ?? 0), 0);
  const fmt = (v: number) => (isAdmin ? formatCurrency(v) : `${v} ${v === 1 ? "visit" : "visits"}`);

  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-card pb-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pb-3.5 pt-4.5">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">{isAdmin ? "Sales this week" : "Visits this week"}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{isAdmin ? "Invoiced and collected, Monday to Sunday" : "Appointments per day, Monday to Sunday"}</p>
        </div>
      </div>

      {loading ? (
        <OpsNotice kind="loading" text="Loading this week…" />
      ) : error ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : (
        <>
          <div className="flex justify-end gap-3.5 px-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <i className="size-1.5 rounded-full bg-sage" /> {isAdmin ? "Sales" : "Visits"}
            </span>
            {isAdmin && (
              <span className="flex items-center gap-1.5">
                <i className="size-1.5 rounded-full bg-c3" /> Collected
              </span>
            )}
          </div>

          <div className="h-52 px-2.5 pt-1.5" role="img" aria-label={isAdmin ? "Sales by day this week" : "Visits by day this week"}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 12, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--c-chart-1)" stopOpacity={0.17} />
                    <stop offset="100%" stopColor="var(--c-chart-1)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--c-line)" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--c-mute)", fontSize: 11 }} dy={10} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--c-line)", background: "var(--c-card)", color: "var(--c-ink)", fontSize: 12 }}
                  formatter={(value, name) => [fmt(Number(value)), name === "secondary" ? "Collected" : isAdmin ? "Sales" : "Visits"]}
                />
                <Area type="monotone" dataKey="primary" stroke="var(--c-chart-1)" strokeWidth={2.4} fill="url(#perfFill)" />
                {isAdmin && <Area type="monotone" dataKey="secondary" stroke="var(--c-chart-3)" strokeWidth={2} fill="transparent" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mx-5 flex gap-7 border-t border-line/70 pt-3.5">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">{isAdmin ? "Invoiced" : "Total visits"}</span>
              <b className="font-display text-base font-semibold text-foreground">{fmt(total)}</b>
            </div>
            {isAdmin && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Collected</span>
                <b className="font-display text-base font-semibold text-foreground">{formatCurrency(collected)}</b>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
