"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { OpsNotice } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import type { PlatformRevenuePoint } from "@/types/platform-types";

const shortDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** Invoiced vs collected money over the selected period. */
export function RevenueTrendChart({
  points,
  loading,
  error,
  onRetry,
  title = "Revenue trend",
  description = "Invoiced amount and money collected",
}: {
  points: PlatformRevenuePoint[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  title?: string;
  description?: string;
}) {
  const invoiced = points.reduce((sum, p) => sum + p.revenue, 0);
  const collected = points.reduce((sum, p) => sum + p.collected, 0);

  return (
    <div className="flex min-w-0 flex-col rounded-[11px] border border-line bg-card pb-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-[18px]">
        <div>
          <h3 className="m-0 font-display text-base font-semibold text-ink">{title}</h3>
          <p className="m-0 mt-[5px] text-[10px] text-mute">{description}</p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <span className="block text-[9px] uppercase tracking-[0.5px] text-mute">Invoiced</span>
            <b className="font-display text-sm font-semibold text-ink">{formatCurrency(invoiced)}</b>
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-[0.5px] text-mute">Collected</span>
            <b className="font-display text-sm font-semibold text-ok-ink">{formatCurrency(collected)}</b>
          </div>
        </div>
      </div>

      {loading && points.length === 0 ? (
        <OpsNotice kind="loading" text="Loading revenue…" />
      ) : error && points.length === 0 ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : points.length === 0 ? (
        <OpsNotice kind="empty" text="No invoices in this period yet." />
      ) : (
        <>
          <div className="flex justify-end gap-3.5 px-5 pb-1 text-[10px] text-mute">
            <span className="flex items-center gap-1.5">
              <i className="size-1.5 rounded-full bg-c1" /> Invoiced
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-1.5 rounded-full bg-c3" /> Collected
            </span>
          </div>
          <div className="h-[235px] px-2.5 pt-1.5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="platformRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--c-chart-1)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--c-chart-1)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--c-line)" strokeDasharray="3 4" vertical={false} />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={26}
                  tick={{ fill: "var(--c-mute)", fontSize: 10 }}
                  tickFormatter={shortDate}
                  dy={8}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--c-line)",
                    background: "var(--c-card)",
                    color: "var(--c-ink)",
                    fontSize: 11,
                  }}
                  labelFormatter={(value) => shortDate(String(value))}
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === "collected" ? "Collected" : "Invoiced",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--c-chart-1)"
                  strokeWidth={2.2}
                  fill="url(#platformRevenueFill)"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="var(--c-chart-3)"
                  strokeWidth={1.8}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
