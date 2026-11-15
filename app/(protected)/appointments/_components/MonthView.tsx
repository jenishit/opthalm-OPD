"use client";

import { useMemo } from "react";
import { OpsNotice } from "@/components/ui/OpsStat";
import { addDays, cn, DAYS, iso, mondayOf, today0 } from "@/lib/utils";
import type { QueueItem } from "@/services/queue-services";
import { visitDay } from "@/services/queue-services";
import { ScheduleNav } from "./schedule-nav";

const VISIBLE_NAMES = 3;

export function MonthView({
  monthStart,
  onMonthChange,
  items,
  loading,
  error,
  onRetry,
  onPickDay,
}: {
  /** First day of the month being shown. */
  monthStart: Date;
  onMonthChange: (firstOfMonth: Date) => void;
  items: QueueItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Open a day in the Day view. */
  onPickDay: (d: Date) => void;
}) {
  const monthLabel = monthStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const lastOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const gridStart = mondayOf(monthStart);
  const gridEnd = addDays(mondayOf(lastOfMonth), 6);
  const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86_400_000) + 1;
  const cells = Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i));
  const weeks: Date[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const byDay = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const item of items) {
      if (item.visit.status === "cancelled") continue;
      const key = visitDay(item);
      m.set(key, [...(m.get(key) ?? []), `${item.patient.first_name} ${item.patient.last_name}`]);
    }
    return m;
  }, [items]);

  const td = iso(today0());
  const shift = (n: number) => onMonthChange(new Date(monthStart.getFullYear(), monthStart.getMonth() + n, 1));

  return (
    <div className="flex flex-col gap-4">
      <ScheduleNav unit="month" title={monthLabel} onPrev={() => shift(-1)} onNext={() => shift(1)} onToday={() => onMonthChange(new Date(today0().getFullYear(), today0().getMonth(), 1))} />

      {loading ? (
        <OpsNotice kind="loading" text="Loading schedule…" />
      ) : error ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : (
        <div className="overflow-hidden rounded-md border border-line bg-card">
          <div className="grid grid-cols-7">
            {DAYS.map((d) => (
              <div key={d} className="border-b border-l border-line p-2 text-center first:border-l-0">
                <span className="mono-label">{d}</span>
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((d, di) => {
                const key = iso(d);
                const names = byDay.get(key) ?? [];
                const inMonth = d.getMonth() === monthStart.getMonth();
                const visible = names.slice(0, VISIBLE_NAMES);
                const extra = names.length - visible.length;
                return (
                  <button
                    key={di}
                    type="button"
                    onClick={() => onPickDay(d)}
                    aria-label={`${d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}: ${names.length} appointment${names.length === 1 ? "" : "s"}`}
                    className={cn(
                      "flex min-h-[72px] min-w-0 flex-col items-stretch border-b border-l border-line p-1.5 text-left first:border-l-0 hover:bg-app sm:min-h-[104px] sm:p-2",
                      key === td && "bg-sage-soft",
                      !inMonth && "bg-muted/30",
                    )}
                  >
                    <span className={cn("font-display text-sm font-semibold", inMonth ? "text-foreground" : "text-muted-foreground/60", key === td && "text-sage")}>{d.getDate()}</span>
                    {/* Names on wide screens; a count badge on phones, where names don't fit. */}
                    <ul className="mt-1 hidden flex-col gap-1 sm:flex">
                      {visible.map((name, i) => (
                        <li key={i} className="truncate rounded bg-sage-soft px-1.5 py-0.5 text-[11px] font-semibold text-sage" title={name}>{name}</li>
                      ))}
                    </ul>
                    {extra > 0 && <span className="mt-1 hidden text-[11px] text-muted-foreground sm:block">+{extra} more</span>}
                    {names.length > 0 && (
                      <span className="mt-1 inline-flex w-fit rounded-full bg-sage px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground sm:hidden">{names.length}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
