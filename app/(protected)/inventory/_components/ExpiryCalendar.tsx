"use client";

import { useMemo } from "react";
import { cn, addDays, fmtDate, today0 } from "@/lib/utils";
import { BUCKET_META, BUCKET_ORDER, EXPIRY_WINDOW_DAYS, bucketOf, type ExpiryEntry } from "./expiry-data";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * The next 90 days of expiries. Layout follows the width of the tracker
 * (container queries, so the sidebar doesn't skew it):
 *  - wide: a heatmap with one column per week that spans the full width;
 *  - narrow: Monday-first weeks stacked as rows.
 */
export function ExpiryCalendar({
  entries,
  selectedDay,
  onSelectDay,
}: {
  entries: ExpiryEntry[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}) {
  const t = today0();

  const byDay = useMemo(() => {
    const map = new Map<number, ExpiryEntry[]>();
    for (const e of entries) {
      if (e.days < 0) continue;
      map.set(e.days, [...(map.get(e.days) ?? []), e]);
    }
    return map;
  }, [entries]);

  // Weeks, Monday-first; null pads the days before today and after day 90.
  const weeks = useMemo(() => {
    const lead = (t.getDay() + 6) % 7;
    const cells: Array<number | null> = [...Array(lead).fill(null), ...Array.from({ length: EXPIRY_WINDOW_DAYS + 1 }, (_, i) => i)];
    while (cells.length % 7) cells.push(null);
    const out: Array<Array<number | null>> = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [t]);

  const cell = (day: number | null, key: string, size: string) => {
    if (day == null) return <div key={key} aria-hidden />;
    const date = addDays(t, day);
    const hits = byDay.get(day);
    const worst = hits ? bucketOf(day) : null;
    const showMonth = date.getDate() === 1 || day === 0;
    const label = `${fmtDate(date, { weekday: "short", day: "numeric", month: "short" })}${hits ? `: ${hits.length} ${hits.length === 1 ? "item" : "items"} expire — ${hits.map((h) => h.name).join(", ")}` : ""}`;
    return (
      <button
        key={key}
        type="button"
        disabled={!hits}
        aria-label={label}
        aria-pressed={selectedDay === day}
        title={label}
        onClick={() => hits && onSelectDay(selectedDay === day ? null : day)}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-md border text-xs leading-none transition-colors",
          size,
          worst ? BUCKET_META[worst].cell : "border-line bg-app text-muted-foreground",
          hits && "cursor-pointer hover:brightness-95",
          day === 0 && !hits && "border-dashed border-strong",
          selectedDay === day && "ring-2 ring-foreground ring-offset-1 ring-offset-card",
        )}
      >
        {showMonth && <span className="absolute left-1 top-0.5 text-[8px] font-bold uppercase opacity-70">{date.toLocaleDateString("en-GB", { month: "short" })}</span>}
        <span className="font-mono text-[11px] font-semibold">{date.getDate()}</span>
        {hits && hits.length > 1 && <span className="absolute bottom-0.5 right-1 text-[9px] font-bold">{hits.length}</span>}
      </button>
    );
  };

  return (
    <div role="group" aria-label="Expiry calendar, next 90 days">
      {/* Wide: one column per week across the whole width. */}
      <div className="hidden @2xl:block">
        <div className="flex gap-2">
          <div className="grid shrink-0 grid-rows-7 gap-1 pt-0" aria-hidden>
            {WEEKDAYS.map((d) => (
              <span key={d} className="flex h-11 items-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</span>
            ))}
          </div>
          <div className="grid min-w-0 flex-1 grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
            {weeks.flat().map((d, i) => cell(d, `w${i}`, "h-11 min-w-0"))}
          </div>
        </div>
      </div>

      {/* Narrow: weeks as rows. */}
      <div className="@2xl:hidden">
        <div aria-hidden className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d[0]}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{weeks.flat().map((d, i) => cell(d, `n${i}`, "min-h-11 sm:min-h-12"))}</div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {BUCKET_ORDER.filter((b) => b !== "expired").map((b) => (
          <span key={b} className="inline-flex items-center gap-1">
            <i className={cn("size-2.5 rounded-sm border", BUCKET_META[b].cell)} /> {BUCKET_META[b].label}
          </span>
        ))}
      </div>
    </div>
  );
}
