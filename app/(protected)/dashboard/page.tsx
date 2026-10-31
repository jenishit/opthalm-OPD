"use client";
import { Button } from "@/components/shadcn/button";
import { useAuthStore } from "@/stores/authStore";

import SectionHeading from "./_components/SectionHeading";
import {
  CalendarCheck,
  Download,
  FileText,
  Plus,
  UserRoundPlus,
  Wallet,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import AppointmentQueue from "./_components/AppointmentQueue";
import PerformanceChart from "./_components/PerformanceChart";
import QuickActions from "./_components/QuickActions";
import RecentActivity from "./_components/RecentActivity";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const staffUser = useAuthStore((state) => state.staffUser);
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date())
    .toUpperCase();

  return (
    <>
      <SectionHeading
        eyebrow={today}
        title={`${greeting()}${staffUser ? `, ${staffUser.name}` : ""}`}
        description="Here's what's happening across your clinic today."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => alert("Your daily summary is being prepared")}
            >
              <Download />
              Export summary
            </Button>
            <Button onClick={() => alert("Appointment scheduling is coming soon")}>
              <Plus />
              New appointment
            </Button>
          </>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard
          label="Today's appointments"
          value="12"
          change="8%"
          foot="vs. last week"
          icon={CalendarCheck}
          kind="green"
        />
        <StatCard
          label="New patients"
          value="08"
          change="12%"
          foot="vs. last week"
          icon={UserRoundPlus}
          kind="blue"
        />
        <StatCard
          label="Pending prescriptions"
          value="05"
          change="2 urgent"
          foot="need your review"
          icon={FileText}
          kind="amber"
        />
        <StatCard
          label="Today's revenue"
          value="$2,480"
          change="12%"
          foot="vs. yesterday"
          icon={Wallet}
          kind="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <AppointmentQueue />
        <PerformanceChart />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>
    </>
  );
}
