"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";

const nav = "grid size-9 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-foreground";

/** Prev / next / today controls shared by the Day, Week and Month views. */
export function ScheduleNav({
  unit,
  title,
  onPrev,
  onNext,
  onToday,
  children,
}: {
  unit: "day" | "week" | "month";
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" aria-label={`Previous ${unit}`} onClick={onPrev} className={nav}>
        <ChevronLeft size={17} />
      </button>
      <button type="button" aria-label={`Next ${unit}`} onClick={onNext} className={nav}>
        <ChevronRight size={17} />
      </button>
      <Button size="sm" variant="secondary" onClick={onToday}>
        <CalendarDays className="size-4" />
        Today
      </Button>
      <h3 className="ml-1 min-w-0 flex-1 basis-48 font-display text-lg font-semibold text-foreground" aria-live="polite">
        {title}
      </h3>
      {children}
    </div>
  );
}
