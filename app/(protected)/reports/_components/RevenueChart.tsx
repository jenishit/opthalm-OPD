"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const salesData = [
  { day: "Mon", sales: 1850 },
  { day: "Tue", sales: 2200 },
  { day: "Wed", sales: 1960 },
  { day: "Thu", sales: 2640 },
  { day: "Fri", sales: 3120 },
  { day: "Sat", sales: 3480 },
  { day: "Sun", sales: 2910 },
];

export function RevenueChart() {
  return (
    <div className="rounded-[11px] border border-line bg-card pb-[13px] shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pb-[14px] pt-[19px]">
        <div>
          <h3 className="m-0 font-display text-base font-semibold text-ink">Revenue overview</h3>
          <p className="m-0 mt-[5px] text-[10px] text-mute">Sales trend across the selected period</p>
        </div>
        <span className="inline-flex items-center gap-[5px] rounded-[5px] bg-ok-soft px-[7px] py-1 text-[9px] font-semibold leading-none text-ok-ink">
          <i className="size-[5px] rounded-full bg-current opacity-80" />
          +12.8%
        </span>
      </div>
      <div className="h-[203px] px-[15px] pt-1.5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--c-chart-1)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--c-chart-1)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--c-line)" strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--c-mute)", fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="var(--c-chart-1)" strokeWidth={2.5} fill="url(#reportFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
