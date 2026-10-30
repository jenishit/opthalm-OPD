"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import { Segmented } from "@/components/ui/ChartUi";
import { cn } from "@/lib/utils";
import {
  adToBs,
  bsDaysInMonth,
  bsToAd,
  bsWeekdayIndex,
  BS_MONTHS_EN,
  BS_MONTHS_NP,
  formatAd,
  formatBs,
  toNpDigits,
  todayIsoKathmandu,
  type BSDate,
  type CalendarMode,
} from "@/lib/nepali-calendar";
import { useUiStore } from "@/lib/store/ui";

/** Supported ranges: 1975-01-01 BS (1918-04-13 AD) … 2099-12-30 BS (2043-04-13 AD). */
const BS_MIN_YEAR = 1975;
const BS_MAX_YEAR = 2099;

type Props = {
  /** The controlled value in ISO AD form ("YYYY-MM-DD"), or "" / undefined. */
  value?: string | null;
  onChange: (isoAd: string | undefined) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  /** Per-instance default before the staff preference takes over. */
  defaultMode?: CalendarMode;
};

const fieldCls =
  "flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground outline-none transition-colors hover:border-sage/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-expanded:border-ring";

const gridBtn =
  "grid h-9 place-items-center rounded-md text-sm tabular-nums text-foreground transition-colors hover:bg-sage-soft focus-visible:outline-2 focus-visible:outline-ring";

const WS_NP = ["आ", "सो", "मं", "बु", "बि", "शु", "श"];
const WS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function NepaliDateField({
  value,
  onChange,
  id,
  placeholder = "Select date",
  disabled,
  label,
  className,
  defaultMode,
}: Props) {
  const storeMode = useUiStore((s) => s.calendarMode);
  const setStoreMode = useUiStore((s) => s.setCalendarMode);
  const [open, setOpen] = useState(false);
  const mode: CalendarMode = defaultMode ?? storeMode;
  // View year/month the popover shows; re-seeded whenever it opens.
  const [view, setView] = useState(() => seedView(value ?? "", mode));

  const iso = value || "";
  const bs = useMemo(() => (iso ? adToBs(iso) : null), [iso]);


  const openPanel = () => {
    if (disabled) return;
    setView(seedView(iso, mode));
    setOpen(true);
  };

  const switchMode = (next: string) => {
    const m = next as CalendarMode;
    setStoreMode(m);
    setView(seedView(iso, m));
  };

  const setYearMonth = (delta: number) => {
    setView((v) => {
      if (mode === "BS") {
        let y = v.year + (v.month + delta - 1 < 0 ? -1 : v.month + delta > 12 ? 1 : 0);
        let m = ((v.month + delta - 1 + 12) % 12) + 1;
        y = Math.min(BS_MAX_YEAR, Math.max(BS_MIN_YEAR, y));
        return { year: y, month: m };
      }
      const d = new Date(Date.UTC(v.year, v.month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
    });
  };

  const pick = (m: number, d: number) => {
    if (mode === "BS") {
      const next = bsToAd({ year: view.year, month: m, day: d });
      if (next) {
        onChange(next);
        setOpen(false);
      }
      return;
    }
    onChange(`${view.year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    setOpen(false);
  };

  const today = todayIsoKathmandu();
  const todayBs = adToBs(today);

  // Grid cells for the current view.
  const cells = useMemo(() => {
    if (mode === "BS") {
      const first = bsWeekdayIndex({ year: view.year, month: view.month, day: 1 });
      const days = bsDaysInMonth(view.year, view.month);
      return { leading: first, count: days };
    }
    const first = new Date(Date.UTC(view.year, view.month - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(view.year, view.month, 0)).getUTCDate();
    return { leading: first, count: days };
  }, [mode, view]);

  const isSelected = (d: number) => {
    if (!bs || iso === "") return false;
    if (mode === "BS") return view.year === bs.year && view.month === bs.month && bs.day === d;
    return iso === `${view.year}-${String(view.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const isToday = (d: number) => {
    if (mode === "BS") return view.year === todayBs?.year && view.month === todayBs?.month && todayBs.day === d;
    return today === `${view.year}-${String(view.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const headerLabel =
    mode === "BS"
      ? `${BS_MONTHS_NP[view.month - 1]} ${toNpDigits(view.year)}`
      : new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
          new Date(Date.UTC(view.year, view.month - 1, 1))
        );

  const triggerText = bs
    ? mode === "BS"
      ? formatBs(bs, "np")
      : formatAd(iso)
    : placeholder;

  const crossCaption =
    mode === "BS"
      ? bs != null && iso
        ? `${BS_MONTHS_EN[bs.month - 1]} ${bs.day}, ${bs.year} · AD ${formatAd(iso)}`
        : "BS 1975 – 2099 only"
      : bs
        ? `BS ${formatBs(bs, "en")}`
        : "BS 1975 – 2099 only";

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next && !disabled) setView(seedView(iso, mode));
          setOpen(next);
        }}
      >
        <PopoverTrigger
          id={id}
          className={cn(fieldCls, !iso && "text-muted-foreground", className)}
          onClick={openPanel}
          disabled={disabled}
          aria-label={label}
        >
          <span className="truncate">{triggerText}</span>
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent className="w-[19.5rem] divide-y divide-border/60" align="start">
          <div className="flex items-center justify-between gap-2 pb-2.5">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setYearMonth(-1)}
                aria-label="Previous month"
                className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sage-soft hover:text-ink"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setYearMonth(1)}
                aria-label="Next month"
                className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sage-soft hover:text-ink"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-foreground" aria-live="polite">
              {headerLabel}
            </p>
            <div className="flex items-center">
              {iso ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange(undefined);
                    setView(seedView("", mode));
                  }}
                  aria-label="Clear date"
                  title="Clear date"
                  className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sage-soft hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  onChange(today);
                  setOpen(false);
                }}
                className="rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-sage-soft"
              >
                Today
              </button>
            </div>
          </div>

          <div className="py-2.5">
            <div className="mb-1 grid grid-cols-7">
              {(mode === "BS" ? WS_NP : WS_EN).map((w) => (
                <span key={w} className="grid h-6 place-items-center text-[11px] font-semibold text-muted-foreground">
                  {w}
                </span>
              ))}
            </div>
            <div
              className="grid grid-cols-7"
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                const list = Array.from(
                  event.currentTarget.querySelectorAll("button")
                ) as HTMLButtonElement[];
                const active = document.activeElement;
                const i = list.findIndex((el) => el === active);
                if (i === -1) return;
                event.preventDefault();
                const next = (i + (event.key === "ArrowRight" ? 1 : list.length - 1)) % list.length;
                list[next].focus();
              }}
            >
              {Array.from({ length: cells.leading }).map((_, i) => (
                <span key={`gap-${i}`} />
              ))}
              {Array.from({ length: cells.count }, (_, i) => i + 1).map((d) => {
                const selected = isSelected(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={selected}
                    aria-label={mode === "BS" ? `${BS_MONTHS_EN[view.month - 1]} ${d}, ${view.year}` : undefined}
                    onClick={() => pick(view.month, d)}
                    className={cn(
                      gridBtn,
                      selected && "bg-primary text-primary-foreground hover:bg-primary-hover",
                      !selected && isToday(d) && "border border-dashed border-strong ring-1 ring-inset ring-strong/30"
                    )}
                  >
                    {mode === "BS" ? toNpDigits(d) : d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2.5">
            <Segmented
              label="Calendar system"
              value={mode}
              onChange={switchMode}
              options={[
                { value: "BS", label: "BS" },
                { value: "AD", label: "AD" },
              ]}
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {iso && bs ? <Check className="size-3.5 text-ok" aria-hidden /> : null}
              <span className="truncate">{crossCaption}</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

function seedView(iso: string, mode: CalendarMode) {
  if (iso) {
    if (mode === "BS") {
      const bs = adToBs(iso);
      if (bs) return { year: bs.year, month: bs.month };
    } else {
      const [y, m] = iso.split("-").map(Number);
      if (y && m) return { year: y, month: m };
    }
  }
  const t = mode === "BS" ? adToBs(todayIsoKathmandu()) : null;
  if (mode === "BS" && t) return { year: t.year, month: t.month };
  const n = todayIsoKathmandu().split("-").map(Number);
  return { year: n[0], month: n[1] };
}
