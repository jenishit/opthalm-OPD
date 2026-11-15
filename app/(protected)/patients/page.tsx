"use client";

import Link from "next/link";
import { CalendarPlus, CalendarRange, UserRoundPlus, Users } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import StatCard from "@/components/ui/StatCard";
import { useAsync } from "@/lib/hooks/use-async";
import { getPatientStats } from "@/services/patients-services";
import { PatientListTable } from "@/app/(protected)/patients/_components/PatientListTable";
import SectionHeading from "../dashboard/_components/SectionHeading";

export default function PatientsPage() {
  // Counters come from GET /patient/stats (one aggregate query) — the page never loads the whole list to count it.
  const { data: ps, loading } = useAsync(() => getPatientStats().catch(() => null));
  const v = (n: number | undefined) => (loading ? "…" : n == null ? "—" : n.toLocaleString());

  return (
    <>
      <SectionHeading
        eyebrow="PATIENT CARE"
        title="Patients"
        description="Every patient, every visit, one continuous care record."
        actions={
          <Button asChild>
            <Link href="/patients/register">
              <UserRoundPlus />
              Add patient
            </Link>
          </Button>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard label="Total patients" value={v(ps?.total)} change="All time" foot="in this clinic" icon={Users} />
        <StatCard label="New this month" value={v(ps?.registered.this_month)} change={ps ? `${ps.registered.last_month} last month` : "—"} foot="registered" icon={CalendarRange} kind="blue" />
        <StatCard label="Last 7 days" value={v(ps?.registered.last_7_days)} change="Rolling week" foot="registered" icon={CalendarPlus} kind="amber" />
        <StatCard label="Registered today" value={v(ps?.registered.today)} change={ps ? `${ps.seen_today} seen today` : "—"} foot="new records" icon={UserRoundPlus} kind="violet" />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
        <PatientListTable />
      </div>
    </>
  );
}
