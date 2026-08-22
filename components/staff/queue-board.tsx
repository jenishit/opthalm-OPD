"use client";

import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import { Clock, RefreshCcw, User, Eye } from "lucide-react";
import { getTodayQueue, type QueueItem } from "@/lib/api/queue";
import { VisitStatus } from "@/lib/schemas/visit.schema";

const statusColumns: { id: VisitStatus; label: string }[] = [
  { id: "scheduled", label: "Scheduled" },
  { id: "waiting", label: "Waiting" },
  { id: "examining", label: "Examining" },
  { id: "completed", label: "Completed" },
];

export function QueueBoard() {
  const [queue, setQueue] = React.useState<QueueItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getTodayQueue();
      setQueue(data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Failed to fetch queue", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchQueue();
  }, []);

  const getItemsByStatus = (status: VisitStatus) => {
    return queue.filter((item) => item.visit.status === status);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchQueue}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-organic-sm transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {statusColumns.map((col) => {
          const items = getItemsByStatus(col.id);

          return (
            <div
              key={col.id}
              className="flex min-w-72 flex-col rounded-2xl border border-border/60 bg-muted/40"
            >
              <div
                className="flex items-center justify-between rounded-t-2xl px-4 py-3"
                style={{ backgroundColor: `var(--status-${col.id}-bg)` }}
              >
                <h3 className="font-medium" style={{ color: `var(--status-${col.id})` }}>
                  {col.label}
                </h3>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `var(--status-${col.id})`,
                    color: `var(--status-${col.id}-foreground)`,
                  }}
                >
                  {items.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {items.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                    No patients
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <QueueCard key={item.visit.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueueCard({ item }: { item: QueueItem }) {
  const { visit, patient } = item;

  return (
    <Link
      href={`/staff/patients/${patient.id}/visits/${visit.id}`}
      className="block rounded-2xl border border-border/60 bg-card p-3.5 shadow-organic-sm outline-none transition-all hover:-translate-y-0.5 hover:shadow-organic hover:border-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h4 className="font-medium text-foreground">{patient.first_name} {patient.last_name}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{patient.age}y • {patient.sex.charAt(0)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-muted-foreground">
            {new Date(visit.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="mb-3 rounded-xl bg-muted/60 p-2.5 text-sm text-foreground line-clamp-2">
        <span className="font-medium mr-1">C/C:</span>
        {visit.chief_complaint}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-2.5 mt-2">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <User className="h-3 w-3" />
          {visit.examined_by ? `Dr. ${visit.examined_by}` : "Unassigned"}
        </div>

        {visit.status === "scheduled" && (
          <div className="text-xs font-medium text-primary flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Start Exam
          </div>
        )}
      </div>
    </Link>
  );
}
