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
    <div className="rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] pb-[13px] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="flex items-center justify-between gap-3 px-5 pb-[14px] pt-[19px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Revenue overview</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Sales trend across the selected period</p>
        </div>
        <span className="inline-flex items-center gap-[5px] rounded-[5px] bg-[#e7efe6] px-[7px] py-1 text-[9px] font-semibold leading-none text-[#3e7350]">
          <i className="size-[5px] rounded-full bg-current opacity-80" />
          +12.8%
        </span>
      </div>
      <div className="h-[203px] px-[15px] pt-1.5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#255943" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#255943" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eeeae1" strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#92968e", fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#255943" strokeWidth={2.5} fill="url(#reportFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
