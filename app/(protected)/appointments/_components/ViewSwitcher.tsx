"use client";

import { cn } from "@/lib/utils";

export type ScheduleView = "Day" | "Week" | "Month";

const VIEWS: ScheduleView[] = ["Day", "Week", "Month"];

export function ViewSwitcher({
  value,
  onChange,
}: {
  value: ScheduleView;
  onChange: (view: ScheduleView) => void;
}) {
  return (
    <div className="inline-flex w-fit gap-0.5 rounded-lg bg-muted/60 p-0.5">
      {VIEWS.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors",
            value === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
