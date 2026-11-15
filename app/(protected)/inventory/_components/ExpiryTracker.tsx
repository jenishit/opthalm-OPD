"use client";

import { useMemo, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { OpsNotice } from "@/components/ui/OpsStat";
import { cn } from "@/lib/utils";
import { ExpiryCalendar } from "./ExpiryCalendar";
import { ExpiryList } from "./ExpiryList";
import { BUCKET_META, BUCKET_ORDER, EXPIRY_WINDOW_DAYS, bucketOf, countByBucket, type ExpiryBucket, type ExpiryEntry } from "./expiry-data";

/**
 * Stock expiring in the next 90 days, from the backend's per-lot expiry report
 * (plus items that only carry a single legacy expiry date). Summary tiles
 * filter the list; the calendar is collapsible on phones.
 */
export function ExpiryTracker({ entries, loading, error, onRetry }: { entries: ExpiryEntry[]; loading: boolean; error: string | null; onRetry: () => void }) {
  const [bucket, setBucket] = useState<ExpiryBucket | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const counts = useMemo(() => countByBucket(entries), [entries]);

  const visible = entries.filter((e) => (bucket ? bucketOf(e.days) === bucket : true) && (selectedDay == null ? true : e.days === selectedDay));
  const filtered = bucket !== null || selectedDay !== null;

  return (
    <section aria-labelledby="expiry-heading" className="@container w-full rounded-xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id="expiry-heading" className="font-display text-base font-semibold text-foreground">Expiry tracker</h3>
          <p className="mt-1 text-xs text-muted-foreground">Next {EXPIRY_WINDOW_DAYS} days, by lot — contacts, coatings and medications</p>
        </div>
        {filtered && (
          <button type="button" onClick={() => { setBucket(null); setSelectedDay(null); }} className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-foreground hover:border-sage">
            <X className="size-3.5" aria-hidden /> Clear filter
          </button>
        )}
      </div>

      {loading ? (
        <OpsNotice kind="loading" text="Loading expiry data…" />
      ) : error && entries.length === 0 ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : (
        <>
          {error && <p role="alert" className="mt-3 rounded-md bg-warn-soft px-3 py-2 text-xs text-warn-ink">Lot data couldn&apos;t be loaded — showing item-level expiry dates only.</p>}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Filter by urgency">
            {BUCKET_ORDER.map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={bucket === b}
                onClick={() => { setBucket(bucket === b ? null : b); setSelectedDay(null); }}
                className={cn("rounded-lg border px-3 py-2.5 text-left transition-shadow", BUCKET_META[b].tile, bucket === b && "ring-2 ring-foreground ring-offset-1 ring-offset-card")}
              >
                <span className="block font-display text-2xl font-semibold leading-none">{counts[b]}</span>
                <span className="mt-1 block text-[11px] font-semibold">{BUCKET_META[b].label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              aria-expanded={showCalendar}
              onClick={() => setShowCalendar((v) => !v)}
              className="mb-2 flex w-full items-center justify-between rounded-md border border-line px-3 py-2 text-sm font-semibold text-foreground hover:border-sage @2xl:hidden"
            >
              <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-sage" aria-hidden /> Calendar view</span>
              <span className="text-xs text-muted-foreground">{showCalendar ? "Hide" : "Show"}</span>
            </button>
            <div className={cn(showCalendar ? "block" : "hidden", "@2xl:block")}>
              <ExpiryCalendar entries={entries} selectedDay={selectedDay} onSelectDay={(d) => { setSelectedDay(d); setBucket(null); }} />
            </div>
          </div>

          <div className="mt-5 min-w-0 border-t border-line/70 pt-4">
            <ExpiryList entries={visible} />
          </div>
        </>
      )}
    </section>
  );
}
