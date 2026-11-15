"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Loader2, Plus, Settings2 } from "lucide-react";
import { OpsNotice } from "@/components/ui/OpsStat";
import { addDays, cn, iso, today0 } from "@/lib/utils";
import type { QueueItem } from "@/services/queue-services";
import { visitDay } from "@/services/queue-services";
import { TY, inferApptType } from "./appointment-type";
import { hourLabel, pad2, toMinutes, visitHour, visitTime } from "./appointment-time";
import { ScheduleNav } from "./schedule-nav";
import { STATUS_LABEL, rowHours } from "./schedule-config";

export function DayView({
  date,
  onDateChange,
  items,
  loading,
  error,
  onRetry,
  onBook,
  onManage,
  readOnly,
}: {
  date: Date;
  onDateChange: (d: Date) => void;
  items: QueueItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onBook: (dateIso: string, time: string) => void;
  onManage: (visitId: string) => void;
  readOnly: boolean;
}) {
  const dayIso = iso(date);
  const todayIso = iso(today0());
  const isToday = dayIso === todayIso;
  const nowHour = new Date().getHours();
  const nowRef = useRef<HTMLLIElement>(null);

  const dayItems = useMemo(
    () =>
      items
        .filter((i) => visitDay(i) === dayIso)
        .sort((a, b) => toMinutes(visitTime(a.visit) ?? "00:00") - toMinutes(visitTime(b.visit) ?? "00:00")),
    [items, dayIso],
  );

  // Appointments with no usable time (shouldn't happen, but never hide one).
  const untimed = dayItems.filter((i) => visitHour(i.visit) == null);
  const byHour = useMemo(() => {
    const m = new Map<number, QueueItem[]>();
    for (const i of dayItems) {
      const h = visitHour(i.visit);
      if (h != null) m.set(h, [...(m.get(h) ?? []), i]);
    }
    return m;
  }, [dayItems]);
  const hours = rowHours([...byHour.keys()]);
  const activeCount = dayItems.filter((i) => i.visit.status !== "cancelled").length;

  // Bring the current hour into view once, when looking at today.
  useEffect(() => {
    if (isToday && !loading) nowRef.current?.scrollIntoView({ block: "nearest" });
  }, [isToday, loading]);

  const title = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <ScheduleNav unit="day" title={title} onPrev={() => onDateChange(addDays(date, -1))} onNext={() => onDateChange(addDays(date, 1))} onToday={() => onDateChange(today0())}>
        <input
          type="date"
          aria-label="Jump to date"
          value={dayIso}
          onChange={(e) => e.target.value && onDateChange(new Date(`${e.target.value}T00:00`))}
          className="h-9 rounded-md border border-line bg-card px-2 text-sm text-foreground"
        />
      </ScheduleNav>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <b className="text-foreground">{activeCount}</b> {activeCount === 1 ? "appointment" : "appointments"}
        </span>
        {(["scheduled", "waiting", "examining", "completed"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <i className="size-2 rounded-full" style={{ background: `var(--status-${s})` }} aria-hidden />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      {loading ? (
        <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading schedule…
        </div>
      ) : error ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : (
        <ol className="divide-y divide-line overflow-hidden rounded-lg border border-line" aria-label={`Hourly schedule for ${title}`}>
          {hours.map((h) => {
            const list = byHour.get(h) ?? [];
            const isNow = isToday && h === nowHour;
            const past = isToday && h < nowHour;
            return (
              <li key={h} ref={isNow ? nowRef : undefined} className={cn("grid grid-cols-[3.75rem_minmax(0,1fr)] sm:grid-cols-[4.5rem_minmax(0,1fr)]", isNow && "bg-sage-soft/50")}>
                <div className={cn("border-r border-line px-2 py-3 text-right font-mono text-xs", isNow ? "font-bold text-sage" : "text-muted-foreground", past && "opacity-60")}>
                  {hourLabel(h)}
                  {isNow && <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wider">Now</span>}
                </div>
                <div className="flex min-h-[64px] flex-col gap-1.5 p-2">
                  {list.map((item) => {
                    const { visit, patient } = item;
                    const type = TY[inferApptType(visit.chief_complaint)];
                    const cancelled = visit.status === "cancelled";
                    return (
                      <div
                        key={visit.id}
                        className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 rounded-r-lg border-l-[3px] px-3 py-2", cancelled && "opacity-55")}
                        style={{ borderLeftColor: `var(--status-${visit.status})`, backgroundColor: `var(--status-${visit.status}-bg)` }}
                      >
                        <span className="w-12 shrink-0 font-mono text-xs font-semibold text-foreground">{visitTime(visit)}</span>
                        <Link href={`/patients/${patient.id}/visits/${visit.id}`} className="min-w-0 flex-1 basis-40 hover:underline">
                          <b className={cn("block truncate text-sm font-semibold text-foreground", cancelled && "line-through")}>
                            {patient.first_name} {patient.last_name}
                          </b>
                          <span className="block truncate text-xs text-muted-foreground">
                            {type.label}
                            {visit.chief_complaint && visit.chief_complaint !== "New patient consultation" && visit.chief_complaint !== "Follow-up visit" && visit.chief_complaint !== "Surgery" ? ` · ${visit.chief_complaint}` : ""}
                            {visit.examined_by ? ` · Dr. ${visit.examined_by}` : ""}
                          </span>
                        </Link>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: `var(--status-${visit.status}-ink)` }}>
                          <i className="size-1.5 rounded-full bg-current" aria-hidden />
                          {STATUS_LABEL[visit.status]}
                        </span>
                        <button
                          type="button"
                          onClick={() => onManage(visit.id)}
                          aria-label={`Manage appointment for ${patient.first_name} ${patient.last_name}`}
                          className="grid size-8 place-items-center rounded-md border border-line bg-card text-muted-foreground hover:border-sage hover:text-foreground"
                        >
                          <Settings2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onBook(dayIso, `${pad2(h)}:00`)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border border-dashed border-line px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-sage hover:text-sage",
                        list.length === 0 ? "min-h-11 flex-1" : "min-h-8 self-start",
                      )}
                    >
                      <Plus size={14} aria-hidden />
                      {list.length === 0 ? `Free · book ${hourLabel(h)}` : "Add another"}
                    </button>
                  )}
                  {readOnly && list.length === 0 && <span className="py-3 text-xs text-muted-foreground">—</span>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {untimed.length > 0 && (
        <p className="text-xs text-muted-foreground">{untimed.length} appointment(s) without a time are not shown above.</p>
      )}
    </div>
  );
}
