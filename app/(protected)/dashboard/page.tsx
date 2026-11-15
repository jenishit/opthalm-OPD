"use client";

import Link from "next/link";
import { CalendarCheck, CheckCircle2, Clock3, Plus, UserRoundPlus, Wallet } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import StatCard from "@/components/ui/StatCard";
import { canAccess } from "@/lib/permissions";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import SectionHeading from "./_components/SectionHeading";
import AppointmentQueue from "./_components/AppointmentQueue";
import PerformanceChart from "./_components/PerformanceChart";
import QuickActions from "./_components/QuickActions";
import RecentActivity from "./_components/RecentActivity";
import { useDashboardData } from "./_components/use-dashboard";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const staffUser = useAuthStore((state) => state.staffUser);
  const role = staffUser?.role;
  const d = useDashboardData(role);
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()).toUpperCase();

  const items = d.todayItems.filter((i) => i.visit.status !== "cancelled");
  const waiting = items.filter((i) => i.visit.status === "waiting" || i.visit.status === "examining").length;
  const completed = items.filter((i) => i.visit.status === "completed").length;
  const ps = d.stats.data;
  const loading = d.week.loading;
  const n = (v: number) => (loading ? "…" : String(v));

  return (
    <>
      <SectionHeading
        eyebrow={today}
        title={`${greeting()}${staffUser ? `, ${staffUser.name}` : ""}`}
        description="Here's what's happening across your clinic today."
        actions={
          canAccess(role, "/appointments") && (
            <Button asChild>
              <Link href="/appointments">
                <Plus />
                New appointment
              </Link>
            </Button>
          )
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard label="Today's appointments" value={n(items.length)} change={`${completed} done`} foot="completed so far" icon={CalendarCheck} kind="green" />
        <StatCard label="In the clinic now" value={n(waiting)} change="Waiting or examining" foot="right now" icon={Clock3} kind="amber" />
        <StatCard
          label="New patients"
          value={ps ? String(ps.registered.today) : d.stats.loading ? "…" : "—"}
          change={ps ? `${ps.registered.this_month} this month` : "Unavailable"}
          foot="registered today"
          icon={UserRoundPlus}
          kind="blue"
        />
        {d.isAdmin ? (
          <StatCard
            label="Today's revenue"
            value={d.sales.loading ? "…" : formatCurrency(d.todaySales?.total_paid ?? 0)}
            change={`${d.todaySales?.invoice_count ?? 0} invoices`}
            foot="collected today"
            icon={Wallet}
            kind="violet"
          />
        ) : (
          <StatCard label="Completed today" value={n(completed)} change={`of ${items.length}`} foot="examinations finished" icon={CheckCircle2} kind="violet" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <AppointmentQueue items={d.todayItems} loading={d.week.loading} error={d.week.error} onRetry={d.week.reload} />
        <PerformanceChart
          points={d.points}
          isAdmin={d.isAdmin}
          loading={d.isAdmin ? d.sales.loading : d.week.loading}
          error={d.isAdmin ? d.sales.error : d.week.error}
          onRetry={d.isAdmin ? d.sales.reload : d.week.reload}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity todayItems={d.todayItems} invoices={d.invoices.data ?? []} loading={d.week.loading} error={d.week.error} onRetry={d.week.reload} />
      </div>
    </>
  );
}
