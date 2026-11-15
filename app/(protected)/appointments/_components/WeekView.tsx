"use client";

import React, { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { toast } from "sonner";
import { OpsNotice } from "@/components/ui/OpsStat";
import { addDays, cn, DAYS, fmtDate, iso, mondayOf, today0 } from "@/lib/utils";
import type { QueueItem } from "@/services/queue-services";
import { visitDay } from "@/services/queue-services";
import { TY } from "./appointment-type";
import { AppointmentTile } from "./AppointmentCard";
import { hourLabel, pad2, toMinutes, visitHour, visitTime } from "./appointment-time";
import { ScheduleNav } from "./schedule-nav";
import { rowHours } from "./schedule-config";

export function WeekView({
  weekStart,
  onWeekStartChange,
  items,
  loading,
  error,
  onRetry,
  onBook,
  onManage,
  onMove,
  readOnly,
}: {
  weekStart: Date;
  onWeekStartChange: (monday: Date) => void;
  items: QueueItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onBook: (dateIso: string, time: string) => void;
  onManage: (visitId: string) => void;
  onMove: (item: QueueItem, dateIso: string, time: string) => Promise<boolean>;
  readOnly: boolean;
}) {
  const [over, setOver] = useState<string | null>(null);
  const days = useMemo(() => [...Array(7)].map((_, i) => addDays(weekStart, i)), [weekStart]);
  const dayKeys = useMemo(() => days.map(iso), [days]);
  const td = iso(today0());

  const weekItems = useMemo(
    () => items.filter((i) => dayKeys.includes(visitDay(i)) && i.visit.status !== "cancelled"),
    [items, dayKeys],
  );
  const cell = useMemo(() => {
    const m = new Map<string, QueueItem[]>();
    for (const i of weekItems) {
      const h = visitHour(i.visit);
      if (h == null) continue;
      const k = `${visitDay(i)}|${h}`;
      m.set(k, [...(m.get(k) ?? []), i].sort((a, b) => toMinutes(visitTime(a.visit) ?? "0:0") - toMinutes(visitTime(b.visit) ?? "0:0")));
    }
    return m;
  }, [weekItems]);
  const hours = rowHours(weekItems.map((i) => visitHour(i.visit)).filter((h): h is number => h != null));

  function drop(e: React.DragEvent, dayIso: string, h: number) {
    e.preventDefault();
    setOver(null);
    if (readOnly) return;
    const id = e.dataTransfer.getData("text/plain");
    const item = items.find((i) => i.visit.id === id);
    if (!item) return;
    // Keep the original minutes; only the hour and day change.
    const minutes = (visitTime(item.visit) ?? "00:00").slice(3, 5);
    if (visitDay(item) === dayIso && visitHour(item.visit) === h) return;
    void onMove(item, dayIso, `${pad2(h)}:${minutes}`);
  }

  const title = `${fmtDate(days[0])} – ${fmtDate(days[6], { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="flex flex-col gap-4">
      <ScheduleNav
        unit="week"
        title={title}
        onPrev={() => onWeekStartChange(addDays(weekStart, -7))}
        onNext={() => onWeekStartChange(addDays(weekStart, 7))}
        onToday={() => {
          onWeekStartChange(mondayOf(today0()));
          toast.info("Jumped to this week");
        }}
      >
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {Object.entries(TY).map(([k, v]) => (
            <span key={k} className={cn("pill", v.pillClass)}>{v.label}</span>
          ))}
        </div>
      </ScheduleNav>

      {loading ? (
        <OpsNotice kind="loading" text="Loading schedule…" />
      ) : error ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : (
        // Full width at laptop sizes; scrolls sideways only on narrow screens.
        <div className="overflow-x-auto rounded-md border border-line bg-card">
          <div className="grid min-w-[720px] lg:min-w-0" style={{ gridTemplateColumns: "3.25rem repeat(7, minmax(0, 1fr))" }}>
            <div className="border-b border-line" />
            {days.map((d, i) => (
              <div key={i} className={cn("border-b border-l border-line p-2 text-center", iso(d) === td && "bg-sage-soft")}>
                <div className="mono-label">{DAYS[i]}</div>
                <div className={cn("font-display text-xl font-semibold text-foreground", iso(d) === td && "text-sage")}>{d.getDate()}</div>
              </div>
            ))}
            {hours.map((h) => (
              <React.Fragment key={h}>
                <div className="border-b border-line p-1.5 text-right font-mono text-[11px] text-muted-foreground">{hourLabel(h)}</div>
                {days.map((d) => {
                  const dayIso = iso(d);
                  const k = `${dayIso}|${h}`;
                  const list = cell.get(k) ?? [];
                  return (
                    <div
                      key={k}
                      role={readOnly ? undefined : "button"}
                      tabIndex={readOnly ? undefined : 0}
                      aria-label={readOnly ? undefined : `Book ${fmtDate(d)} at ${hourLabel(h)}`}
                      onDragOver={(e) => {
                        if (readOnly) return;
                        e.preventDefault();
                        setOver(k);
                      }}
                      onDragLeave={() => setOver(null)}
                      onDrop={(e) => drop(e, dayIso, h)}
                      onClick={() => !readOnly && onBook(dayIso, `${pad2(h)}:00`)}
                      onKeyDown={(e) => {
                        if (!readOnly && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          onBook(dayIso, `${pad2(h)}:00`);
                        }
                      }}
                      className={cn(
                        "flex min-h-[60px] min-w-0 flex-col gap-1 border-b border-l border-line p-1",
                        !readOnly && "cursor-pointer hover:bg-app focus-visible:outline-2 focus-visible:outline-ring",
                        dayIso === td && "bg-sage-soft/60",
                        over === k && "!bg-clay-soft",
                      )}
                    >
                      {list.map((item) => (
                        <AppointmentTile
                          key={item.visit.id}
                          item={item}
                          draggable={!readOnly}
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", item.visit.id)}
                          onClick={() => onManage(item.visit.id)}
                        />
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && weekItems.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-card p-8 text-center shadow-sm">
          <CalendarRange className="size-6 text-muted-foreground" aria-hidden />
          <div className="text-sm font-semibold text-foreground">No appointments this week</div>
          <p className="text-xs text-muted-foreground">Click any slot to book one.</p>
        </div>
      )}
    </div>
  );
}
