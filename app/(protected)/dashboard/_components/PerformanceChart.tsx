"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const salesData = [
  { day: "Mon", sales: 2300, orders: 1800 },
  { day: "Tue", sales: 2800, orders: 2100 },
  { day: "Wed", sales: 2450, orders: 1950 },
  { day: "Thu", sales: 3900, orders: 2700 },
  { day: "Fri", sales: 3400, orders: 2500 },
  { day: "Sat", sales: 4650, orders: 3300 },
  { day: "Sun", sales: 5100, orders: 3900 },
];

export default function PerformanceChart() {
  const [timeframe, setTimeframe] = useState("This week");
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-card pb-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pb-3.5 pt-4.5">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            Practice performance
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Sales and completed orders</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="rounded-md border border-line bg-card px-2.5 py-1.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <option>This week</option>
          <option>This month</option>
          <option>This year</option>
        </select>
      </div>

      <div className="flex justify-end gap-3.5 px-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <i className="size-1.5 rounded-full bg-sage" /> Sales
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-1.5 rounded-full bg-[#7fa6b2]" /> Orders
        </span>
      </div>

      <div className="h-52 px-2.5 pt-1.5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#255943" stopOpacity={0.17} />
                <stop offset="100%" stopColor="#255943" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eeeae1" strokeDasharray="3 4" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#92968e", fontSize: 11 }}
              dy={10}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e8e4da",
                fontSize: 12,
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#255943"
              strokeWidth={2.4}
              fill="url(#salesFill)"
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#7fa6b2"
              strokeWidth={2}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mx-5 flex gap-7 border-t border-line/70 pt-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Gross sales</span>
          <b className="font-display text-base font-semibold text-foreground">
            $21,640{" "}
            <small className="font-sans text-xs font-semibold text-sage">↑ 12.8%</small>
          </b>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Optical orders</span>
          <b className="font-display text-base font-semibold text-foreground">
            84 <small className="font-sans text-xs font-semibold text-sage">↑ 8.4%</small>
          </b>
        </div>
      </div>
    </div>
  );
}
