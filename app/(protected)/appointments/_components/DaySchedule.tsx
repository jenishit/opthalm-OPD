"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download, Filter, Loader2 } from "lucide-react";
import { getTodayQueue, type QueueItem } from "@/services/queue-services";
import type { VisitStatus } from "@/schemas/visit-schema";
import { cn } from "@/lib/utils";
import { MOCK_QUEUE } from "./mock-data";

const STATUS_LABEL: Record<VisitStatus, string> = {
  scheduled: "Scheduled",
  waiting: "Waiting",
  examining: "Examining",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function DaySchedule() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getTodayQueue();
        if (active) setQueue(data);
      } catch (error) {
        console.error("Failed to fetch today's queue", error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const usingMock = !loading && queue.length === 0;
  const sorted = [...(usingMock ? MOCK_QUEUE : queue)].sort(
    (a, b) => new Date(a.visit.created_at ?? 0).getTime() - new Date(b.visit.created_at ?? 0).getTime()
  );
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex h-full min-h-[600px] flex-col rounded-xl border border-line bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-5 py-3.5">
        <h3 className="font-display text-base font-semibold text-foreground">Day schedule</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Schedule filters are coming soon")}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:border-sage"
          >
            <Filter className="size-4" />
            Filter
          </button>
          <button
            onClick={() => toast.info("Schedule export is coming soon")}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:border-sage"
          >
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={() => toast.info("Date navigation is coming soon")}
          className="grid size-8 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-foreground"
        >
          <ChevronLeft size={17} />
        </button>
        <h3 className="font-display text-lg font-semibold text-foreground">{today}</h3>
        <button
          onClick={() => toast.info("Date navigation is coming soon")}
          className="grid size-8 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-foreground"
        >
          <ChevronRight size={17} />
        </button>
        <span className="rounded-md bg-sage-soft px-2 py-1 text-xs font-bold text-sage">Today</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading today&apos;s queue…
          </div>
        ) : (
          <>
            {usingMock && (
              <div className="mb-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                Showing sample appointments — no visits are scheduled for today yet.
              </div>
            )}
            {sorted.map((item) => {
              const { visit, patient } = item;
              const status = visit.status;
              const time = visit.created_at
                ? new Date(visit.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—";
              const rowClassName = cn(
                "flex flex-wrap items-center gap-3 rounded-r-lg border-l-[3px] px-4 py-4 transition-opacity",
                !usingMock && "hover:opacity-90"
              );
              const rowStyle = {
                borderLeftColor: `var(--status-${status})`,
                backgroundColor: `var(--status-${status}-bg)`,
              };
              const rowContent = (
                <>
                  <b className="min-w-[140px] text-sm font-semibold text-foreground">
                    {patient.first_name} {patient.last_name}
                  </b>
                  <span className="flex-1 truncate text-xs text-muted-foreground">{visit.chief_complaint}</span>
                  <small className="text-xs text-muted-foreground">
                    {visit.examined_by ? `Dr. ${visit.examined_by}` : "Unassigned"}
                  </small>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: `var(--status-${status}-ink)` }}
                  >
                    <i className="size-1.5 rounded-full" style={{ background: "currentColor" }} />
                    {STATUS_LABEL[status]}
                  </span>
                </>
              );
              return (
                <div
                  key={visit.id}
                  className="grid min-h-[72px] grid-cols-[70px_1fr] items-center border-t border-line/70 py-2.5 first:border-t-0"
                >
                  <span className="text-xs text-muted-foreground">{time}</span>
                  {usingMock ? (
                    <div className={rowClassName} style={rowStyle}>
                      {rowContent}
                    </div>
                  ) : (
                    <Link href={`/patients/${patient.id}/visits/${visit.id}`} className={rowClassName} style={rowStyle}>
                      {rowContent}
                    </Link>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
