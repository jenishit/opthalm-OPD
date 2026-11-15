"use client";

import { useState } from "react";
import { CalendarCheck2, CalendarClock } from "lucide-react";
import { CATEGORY_ICON } from "@/lib/inventory-category";
import { cn, fmtDate } from "@/lib/utils";
import type { InventoryCategory } from "@/types/inventory-types";
import { BUCKET_META, EXPIRY_WINDOW_DAYS, bucketOf, type ExpiryEntry } from "./expiry-data";

const PAGE = 8;

function daysText(days: number) {
  if (days < 0) return `${Math.abs(days)} d overdue`;
  if (days === 0) return "Today";
  return `in ${days} d`;
}

export function ExpiryList({ entries }: { entries: ExpiryEntry[] }) {
  const [limit, setLimit] = useState(PAGE);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <CalendarCheck2 className="size-6 text-muted-foreground" aria-hidden />
        <div className="text-sm font-semibold text-foreground">Nothing expires here</div>
        <p className="text-xs text-muted-foreground">Stock expiring within {EXPIRY_WINDOW_DAYS} days will show up here.</p>
      </div>
    );
  }

  const shown = entries.slice(0, limit);
  return (
    <>
      <ul className="grid grid-cols-1 gap-1.5 @3xl:grid-cols-2">
        {shown.map((e) => {
          const Icon = CATEGORY_ICON[e.category as InventoryCategory] ?? CalendarClock;
          const meta = BUCKET_META[bucketOf(e.days)];
          return (
            <li key={e.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-line bg-app px-3 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-card text-sage">
                <Icon size={15} aria-hidden />
              </span>
              <div className="min-w-0 flex-1 basis-40">
                <div className="truncate text-sm font-semibold text-foreground">{e.name}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {e.sku}
                  {e.lotNo ? ` · Lot ${e.lotNo}` : ""}
                  {e.quantity != null ? ` · ${e.quantity} in stock` : ""}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className={cn("pill", meta.pill)}>{fmtDate(new Date(`${e.expiry}T00:00`), { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="text-[11px] text-muted-foreground">{daysText(e.days)}</span>
              </div>
            </li>
          );
        })}
      </ul>
      {entries.length > limit && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-2 w-full rounded-md border border-line py-2 text-xs font-semibold text-sage hover:border-sage">
          Show {Math.min(PAGE, entries.length - limit)} more ({entries.length - limit} remaining)
        </button>
      )}
    </>
  );
}
