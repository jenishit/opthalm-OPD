"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarCheck, CalendarDays, CheckCircle2, Clock3, Plus } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import StatCard from "@/components/ui/StatCard";
import { isReadOnly } from "@/lib/permissions";
import { addDays, iso, mondayOf, today0 } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { BookingDialog, type ModalState } from "./_components/BookingDialog";
import { DayView } from "./_components/DayView";
import { MonthView } from "./_components/MonthView";
import { ViewSwitcher, type ScheduleView } from "./_components/ViewSwitcher";
import { WeekView } from "./_components/WeekView";
import { pad2 } from "./_components/appointment-time";
import { dayStats } from "./_components/schedule-stats";
import { useSchedule } from "./_components/useSchedule";
import { useScheduleActions } from "./_components/useScheduleActions";

export default function AppointmentPage() {
  const staffUser = useAuthStore((s) => s.staffUser);
  const readOnly = isReadOnly(staffUser?.role, "/appointments");

  const [view, setView] = useState<ScheduleView>("Day");
  const [day, setDay] = useState(() => today0());
  const [weekStart, setWeekStart] = useState(() => mondayOf(today0()));
  const [monthStart, setMonthStart] = useState(() => new Date(today0().getFullYear(), today0().getMonth(), 1));
  const [modal, setModal] = useState<ModalState>(null);

  // Each view reads only its own date range from the server (GET /visit).
  const range = useMemo(() => {
    if (view === "Day") return { from: iso(day), to: iso(day) };
    if (view === "Week") return { from: iso(weekStart), to: iso(addDays(weekStart, 6)) };
    const last = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    return { from: iso(mondayOf(monthStart)), to: iso(addDays(mondayOf(last), 6)) };
  }, [view, day, weekStart, monthStart]);
  const schedule = useSchedule(range.from, range.to);
  // Today's figures for the stat cards (same range as the Day view when it shows today — one request).
  const todayIso = iso(today0());
  const todaySchedule = useSchedule(todayIso, todayIso);
  const refreshAll = useCallback(() => {
    schedule.refresh();
    todaySchedule.refresh();
  }, [schedule, todaySchedule]);
  const actions = useScheduleActions(refreshAll);

  const now = new Date();
  const stats = useMemo(() => dayStats(todaySchedule.items, todayIso, now.getHours()), [todaySchedule.items, now.getHours()]); // eslint-disable-line react-hooks/exhaustive-deps
  const pct = stats.scheduled ? Math.round((stats.checkedIn / stats.scheduled) * 100) : 0;
  const v = (n: number) => (todaySchedule.loading ? "…" : String(n));

  const openNew = (date: string, time: string) => !readOnly && setModal({ kind: "new", date, time });
  const nextHour = `${pad2(Math.min(Math.max(now.getHours() + 1, 9), 17))}:00`;

  const shared = { items: schedule.items, loading: schedule.loading, error: schedule.error, onRetry: schedule.refresh };

  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="TODAY'S QUEUE"
        title="Appointments"
        description={readOnly ? "A clear view of your day, from check-in to checkout. View only." : "A clear view of your day, from check-in to checkout."}
        actions={
          !readOnly && (
            <Button onClick={() => openNew(iso(today0()), nextHour)}>
              <Plus />
              Book appointment
            </Button>
          )
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard label="Scheduled today" value={v(stats.scheduled)} change={`${stats.completed} done`} foot="completed so far" icon={CalendarDays} />
        <StatCard label="Checked in" value={v(stats.checkedIn)} change={`${pct}%`} foot="of today's schedule" icon={CheckCircle2} kind="blue" />
        <StatCard label="Waiting" value={v(stats.waiting)} change="Now" foot="in the waiting room" icon={Clock3} kind="amber" />
        <StatCard label="Free hours" value={v(stats.freeSlots)} change="Today" foot="open from now" icon={CalendarCheck} kind="violet" />
      </div>

      <div className="mb-4">
        <ViewSwitcher value={view} onChange={setView} />
      </div>

      {view === "Day" && <DayView date={day} onDateChange={setDay} {...shared} onBook={openNew} onManage={(id) => setModal({ kind: "edit", visitId: id })} readOnly={readOnly} />}
      {view === "Week" && (
        <WeekView
          weekStart={weekStart}
          onWeekStartChange={setWeekStart}
          {...shared}
          onBook={openNew}
          onManage={(id) => setModal({ kind: "edit", visitId: id })}
          onMove={(item, date, time) => actions.move(item, date, time)}
          readOnly={readOnly}
        />
      )}
      {view === "Month" && (
        <MonthView
          monthStart={monthStart}
          onMonthChange={setMonthStart}
          {...shared}
          onPickDay={(d) => {
            setDay(d);
            setView("Day");
          }}
        />
      )}

      <BookingDialog modal={modal} items={schedule.items} actions={actions} readOnly={readOnly} onClose={() => setModal(null)} />
    </div>
  );
}
