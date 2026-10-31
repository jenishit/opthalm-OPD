"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { cn, addDays, mondayOf, today0, iso, DAYS } from "@/lib/utils";
import { useMonthQueue } from "./useMonthQueue";

const VISIBLE_NAMES = 4;

export function MonthView() {
  const [moff, setMoff] = useState(0);
  const base = today0();
  const monthDate = new Date(base.getFullYear(), base.getMonth() + moff, 1);
  const monthLabel = monthDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const lastOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const gridStart = mondayOf(monthDate);
  const gridEnd = addDays(mondayOf(lastOfMonth), 6);
  const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86_400_000) + 1;
  const cells = Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i));
  const weeks: Date[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const { items, loading, usingMock } = useMonthQueue(gridStart, gridEnd);

  const byDay = new Map<string, string[]>();
  for (const item of items) {
    const key = item.visit.visit_date;
    const list = byDay.get(key) ?? [];
    list.push(`${item.patient.first_name} ${item.patient.last_name}`);
    byDay.set(key, list);
  }

  const td = iso(today0());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          title="Previous month"
          onClick={() => setMoff((m) => m - 1)}
          className="grid size-8 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-foreground"
        >
          <ChevronLeft size={17} />
        </button>
        <button
          type="button"
          title="Next month"
          onClick={() => setMoff((m) => m + 1)}
          className="grid size-8 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-foreground"
        >
          <ChevronRight size={17} />
        </button>
        <Button
          size="sm"
          onClick={() => {
            setMoff(0);
            toast.info("Jumped to today");
          }}
        >
          <CalendarDays className="size-4" />
          Today
        </Button>
        <div className="ml-1 font-display text-lg font-semibold text-foreground">{monthLabel}</div>
      </div>

      {usingMock && (
        <div className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Showing a sample week — no appointments are scheduled yet.
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-line bg-card">
        <div className="grid grid-cols-7">
          {DAYS.map((d) => (
            <div key={d} className="border-b border-l border-line p-2 text-center first:border-l-0">
              <span className="mono-label">{d}</span>
            </div>
          ))}
        </div>
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading schedule…</div>
        ) : (
          weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((d, di) => {
                const key = iso(d);
                const names = byDay.get(key) ?? [];
                const inMonth = d.getMonth() === monthDate.getMonth();
                const visible = names.slice(0, VISIBLE_NAMES);
                const extra = names.length - visible.length;
                return (
                  <div
                    key={di}
                    className={cn(
                      "min-h-[104px] border-b border-l border-line p-2 first:border-l-0",
                      key === td && "bg-sage-soft",
                      !inMonth && "bg-muted/20"
                    )}
                  >
                    <div
                      className={cn(
                        "font-display text-sm font-semibold",
                        inMonth ? "text-foreground" : "text-muted-foreground/60",
                        key === td && "text-sage"
                      )}
                    >
                      {d.getDate()}
                    </div>
                    {visible.length > 0 && (
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {visible.map((name, i) => (
                          <li
                            key={i}
                            className="truncate rounded bg-sage-soft px-1.5 py-0.5 text-[11px] font-semibold text-sage"
                            title={name}
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    )}
                    {extra > 0 && <div className="mt-1 text-[11px] text-muted-foreground">+{extra} more</div>}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
