"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { CalendarCheck, CalendarDays, CheckCircle2, Clock3, Plus } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { DaySchedule } from "./_components/DaySchedule";
import { WeekView } from "./_components/WeekView";
import { MonthView } from "./_components/MonthView";
import { ViewSwitcher, type ScheduleView } from "./_components/ViewSwitcher";
import { useAuthStore } from "@/stores/authStore";
import { isReadOnly } from "@/lib/permissions";

export default function AppointmentPage() {
  const staffUser = useAuthStore((s) => s.staffUser);
  const readOnly = isReadOnly(staffUser?.role, "/appointments");
  const [view, setView] = useState<ScheduleView>("Day");

  return (
    <div className="flex h-full flex-col">
      <SectionHeading
        eyebrow="TODAY'S QUEUE"
        title="Appointments"
        description={
          readOnly
            ? "A clear view of your day, from check-in to checkout. View only."
            : "A clear view of your day, from check-in to checkout."
        }
        actions={
          !readOnly && (
            <Button onClick={() => setView("Week")}>
              <Plus />
              Book appointment
            </Button>
          )
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard label="Scheduled today" value="12" change="3 more" foot="than yesterday" icon={CalendarDays} />
        <StatCard
          label="Checked in"
          value="04"
          change="33%"
          foot="of today's schedule"
          icon={CheckCircle2}
          kind="blue"
        />
        <StatCard label="Waiting" value="03" change="Average 8 min" foot="current wait" icon={Clock3} kind="amber" />
        <StatCard
          label="Available slots"
          value="06"
          change="Today"
          foot="open appointments"
          icon={CalendarCheck}
          kind="violet"
        />
      </div>

      <div className="mb-4">
        <ViewSwitcher value={view} onChange={setView} />
      </div>

      <div className="min-h-0 flex-1">
        {view === "Day" && <DaySchedule />}
        {view === "Week" && <WeekView />}
        {view === "Month" && <MonthView />}
      </div>
    </div>
  );
}
