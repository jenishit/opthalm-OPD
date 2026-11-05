"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, CalendarDays, Wallet, HeartPulse, TrendingUp, CreditCard, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { RevenueChart } from "./_components/RevenueChart";
import { RevenueBreakdown } from "./_components/RevenueBreakdown";
import { MetricListPanel } from "./_components/MetricListPanel";
import { getClinicalActivity } from "@/services/reports-services";
import { addDays, iso, today0 } from "@/lib/utils";
import type { ClinicalActivity } from "@/types/reports-types";

const TO = iso(today0());
const FROM = iso(addDays(today0(), -29));

function StatCard({
  label,
  value,
  change,
  foot,
  icon: Icon,
  bg,
  text,
}: {
  label: string;
  value: string;
  change: string;
  foot: string;
  icon: React.ElementType;
  bg: string;
  text: string;
}) {
  return (
    <div className="min-w-0 rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] p-[17px_18px_15px] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="flex items-center justify-between gap-2.5 text-[11px] text-[#727a70]">
        <span>{label}</span>
        <span className={"grid size-[34px] shrink-0 place-items-center rounded-[9px] " + bg + " " + text}>
          <Icon size={16} />
        </span>
      </div>
      <div className="my-3 font-['Manrope',sans-serif] text-[27px] font-semibold tracking-[-1px] text-[#293a30]">{value}</div>
      <div className="flex flex-wrap items-center gap-[7px] text-[10px] text-[#9a9e95]">
        <span className="inline-flex items-center gap-px font-bold text-[#3b805e]">
          <ArrowUpRight size={13} />
          {change}
        </span>
        <span>{foot}</span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [clinicalActivity, setClinicalActivity] = useState<ClinicalActivity | null>(null);

  useEffect(() => {
    let active = true;
    getClinicalActivity(FROM, TO)
      .then((data) => {
        if (active) setClinicalActivity(data);
      })
      .catch((error) => {
        console.error("Failed to load clinical activity", error);
      });
    return () => {
      active = false;
    };
  }, []);

  const clinicalMetrics: [string, string][] = clinicalActivity
    ? [
        ["New patients", clinicalActivity.new_patients.toLocaleString()],
        ["Comprehensive exams", clinicalActivity.comprehensive_exams.toLocaleString()],
        ["Refraction visits", clinicalActivity.refraction_visits.toLocaleString()],
        ["Follow-ups due", clinicalActivity.follow_up_visits.toLocaleString()],
      ]
    : [
        ["New patients", "—"],
        ["Comprehensive exams", "—"],
        ["Refraction visits", "—"],
        ["Follow-ups due", "—"],
      ];

  return (
    <div className="font-['DM_Sans',sans-serif] text-[13px] text-[#23342c]">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap"
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-[18px]">
        <div>
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-[#8d927f]">INSIGHTS & PERFORMANCE</div>
          <h1 className="m-0 font-['Playfair_Display',serif] text-[29px] font-semibold tracking-[-0.5px] text-[#26392e]">
            Reports & analytics
          </h1>
          <p className="m-0 mt-[7px] text-[12px] text-[#82877e]">
            Understand clinical activity, optical sales, inventory health, and practice performance.
          </p>
        </div>
        <Button
          onClick={() => toast.info("Report export prepared")}
          className="min-h-9 gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
        >
          <Download size={14} />
          Export report
        </Button>
      </div>

      <div className="mb-[18px] flex flex-wrap items-center gap-3 rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] px-4 py-3 shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
        <span className="flex items-center gap-[7px] text-[10px] text-[#6d796d]">
          <CalendarDays size={16} /> Reporting period
        </span>
        <select className="rounded-md border border-[#e5e2d8] bg-[#fffefa] px-2.5 py-[7px] text-[10px] text-[#536252]">
          <option>Last 30 days</option>
          <option>This week</option>
          <option>This quarter</option>
          <option>This year</option>
        </select>
        <span className="ml-auto text-[9px] text-[#a0a399]">Last updated just now</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <StatCard label="Total revenue" value="$64,820" change="12.8%" foot="vs. previous period" icon={Wallet} bg="bg-[#e9f0e8]" text="text-[#214c3a]" />
        <StatCard
          label="Completed visits"
          value="386"
          change="9.4%"
          foot="vs. previous period"
          icon={HeartPulse}
          bg="bg-[#e8f0f2]"
          text="text-[#557d8b]"
        />
        <StatCard
          label="Optical conversion"
          value="68.4%"
          change="4.2%"
          foot="of examined patients"
          icon={TrendingUp}
          bg="bg-[#f7efdf]"
          text="text-[#a47a35]"
        />
        <StatCard
          label="Avg. transaction"
          value="$168.40"
          change="6.1%"
          foot="vs. previous period"
          icon={CreditCard}
          bg="bg-[#f0edf6]"
          text="text-[#8477a3]"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <RevenueChart />
        <RevenueBreakdown from={FROM} to={TO} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <MetricListPanel
          title="Clinical activity"
          description="Patient care over the last 30 days"
          metrics={clinicalMetrics}
        />
        <MetricListPanel
          title="Inventory health"
          description="Stock and fulfilment indicators"
          metrics={[
            ["Active SKUs", "1,284"],
            ["Low-stock products", "18"],
            ["Open customer orders", "28"],
            ["On-time lab fulfilment", "94.2%"],
          ]}
        />
      </div>
    </div>
  );
}
