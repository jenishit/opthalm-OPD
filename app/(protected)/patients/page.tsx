"use client";
import Link from "next/link";
import { Activity, Clock3, UserRoundPlus, Users } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { PatientListTable } from "@/app/(protected)/patients/_components/PatientListTable";
import SectionHeading from "../dashboard/_components/SectionHeading";
import StatCard from "@/components/ui/StatCard";

export default function PatientsPage() {
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
        <StatCard
          label="Total patients"
          value="2,481"
          change="8.2%"
          foot="this month"
          icon={Users}
        />
        <StatCard
          label="New this month"
          value="148"
          change="14%"
          foot="vs. last month"
          icon={UserRoundPlus}
          kind="blue"
        />
        <StatCard
          label="Follow-ups due"
          value="32"
          change="8 overdue"
          foot="need scheduling"
          icon={Clock3}
          kind="amber"
        />
        <StatCard
          label="Records updated"
          value="96%"
          change="+4%"
          foot="completion rate"
          icon={Activity}
          kind="violet"
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
        <PatientListTable />
      </div>
    </>
  );
}
