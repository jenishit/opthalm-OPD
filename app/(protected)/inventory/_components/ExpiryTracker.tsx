"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CalendarCheck2 } from "lucide-react";
import { cn, addDays, fmtDate, today0 } from "@/lib/utils";
import { CATEGORY_ICON, daysUntilExpiry } from "@/lib/inventory-category";
import type { InventoryCategory, InventoryItem } from "@/types/inventory-types";

const WINDOW_DAYS = 90;

const HEAT_TONE = {
  bad: "bg-bad-soft border-bad",
  warn: "bg-warn-soft border-warn",
  mute: "bg-sage-soft border-sage",
} as const;

function heatTone(days: number): keyof typeof HEAT_TONE {
  return days <= 30 ? "bad" : days <= 60 ? "warn" : "mute";
}

export function ExpiryTracker({ items }: { items: InventoryItem[] }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const expiring = useMemo(() => {
    return items
      .map((item) => ({ item, days: daysUntilExpiry(item) }))
      .filter(
        (x): x is { item: InventoryItem; days: number } =>
          x.days != null && x.days <= WINDOW_DAYS,
      )
      .sort((a, b) => a.days - b.days);
  }, [items]);

  const byDay = useMemo(() => {
    const map = new Map<number, InventoryItem[]>();
    for (const { item, days } of expiring) {
      if (days < 0) continue;
      const list = map.get(days) ?? [];
      list.push(item);
      map.set(days, list);
    }
    return map;
  }, [expiring]);

  const t = today0();
  const lead = (t.getDay() + 6) % 7; // calendar starts on Monday
  const cells: Array<number | null> = [
    ...Array(lead).fill(null),
    ...Array.from({ length: WINDOW_DAYS + 1 }, (_, i) => i),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const visible =
    selectedDay == null
      ? expiring
      : expiring.filter((x) => x.days === selectedDay);

  return (
    <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            Expiry tracker
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Next {WINDOW_DAYS} days, across contacts, coatings, and medications
          </p>
        </div>
        <div className="flex gap-1.5">
          <span className="pill pill-bad">≤ 30 days</span>
          <span className="pill pill-warn">≤ 60</span>
          <span className="pill pill-mute">≤ 90</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-max gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                if (day == null) return <div key={di} className="size-6" />;
                const hit = byDay.get(day);
                const d = addDays(t, day);
                const tone = hit
                  ? HEAT_TONE[heatTone(day)]
                  : "bg-app border-line";
                return (
                  <button
                    key={di}
                    type="button"
                    title={`${fmtDate(d)}${hit ? ": " + hit.map((i) => i.name).join(", ") : ""}`}
                    onClick={() =>
                      hit && setSelectedDay(selectedDay === day ? null : day)
                    }
                    disabled={!hit}
                    className={cn(
                      "grid size-6 place-items-center rounded-[4px] border font-mono text-[9px] text-muted-foreground",
                      tone,
                      hit && "cursor-pointer",
                      selectedDay === day && "border-2 border-foreground",
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-line/70 pt-3.5">
        {visible.length ? (
          visible.map(({ item, days }) => {
            const Icon =
              CATEGORY_ICON[item.category as InventoryCategory] ??
              CalendarClock;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setSelectedDay(selectedDay === days ? null : days)
                }
                className={cn(
                  "flex items-center gap-2.5 rounded-md border px-3 py-2 text-left hover:border-sage",
                  selectedDay === days
                    ? "border-sage bg-sage-soft"
                    : "border-line bg-app",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-card text-sage">
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {item.name}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {item.sku}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 pill",
                    days < 0
                      ? "pill-bad"
                      : days <= 30
                        ? "pill-bad"
                        : days <= 60
                          ? "pill-warn"
                          : "pill-mute",
                  )}
                >
                  {fmtDate(addDays(t, days))}
                </span>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CalendarCheck2 className="size-6 text-muted-foreground" />
            <div className="text-sm font-semibold text-foreground">
              Nothing expires soon
            </div>
            <p className="text-xs text-muted-foreground">
              Items with an expiry date within {WINDOW_DAYS} days will show up
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
