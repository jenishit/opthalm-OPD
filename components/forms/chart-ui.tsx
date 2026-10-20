"use client";

import React, { useState } from "react";
import { Check, Minus, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small uppercase label, the equivalent of the reference's mono-label in our type system. */
export const chartLabel =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

export const chartShell =
  "overflow-hidden rounded-2xl border border-border/60 bg-card ";

export const chartRowLabel = "bg-muted/40 p-3 sm:p-4";

export const chartRowTitle = "font-display text-base font-medium text-foreground sm:text-lg";

export const chartField =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

/** Segmented pill control — Reference "Seg", restyled with our tokens. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: LucideIcon }[];
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-full border border-border/60 bg-muted/50 p-1",
        className
      )}
    >
      {options.map((option) => {
        const on = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
              on
                ? "bg-primary text-primary-foreground "
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Toggle chip — used for conditions, follow-up windows and quick picks. */
export function Chip({
  on,
  onClick,
  children,
  icon: Icon,
  warm = false,
  className,
}: {
  on?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: LucideIcon;
  warm?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={!!on}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        on
          ? warm
            ? "border-clay/40 bg-clay/15 text-clay"
            : "border-primary/40 bg-primary/12 text-primary"
          : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className
      )}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {children}
    </button>
  );
}

/** Numbered step rail with completed ticks — Reference Register stepper. */
export function StepRail({
  steps,
  current,
  onSelect,
}: {
  steps: { label: string; icon: LucideIcon }[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.label}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                active && "border-primary bg-primary text-primary-foreground ",
                done && "border-primary/20 bg-primary/10 text-primary",
                !active && !done && "border-border/60 bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              {step.label}
            </button>
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn("h-px w-5 border-t-2", done ? "border-primary/40" : "border-border")}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function formatNumber(value: number, decimals: number, signed: boolean) {
  const sign = signed ? (value > 0 ? "+" : value < 0 ? "\u2212" : "") : value < 0 ? "\u2212" : "";
  return `${sign}${Math.abs(value).toFixed(decimals)}`;
}

/**
 * Dashed "tap to enter" value cell from the reference chart, with discrete
 * steppers so a click is enough on desktop. Dioptres step by 0.25, axis by 5.
 */
export function NumericCell({
  label,
  value,
  onChange,
  step = 0.25,
  min = -30,
  max = 30,
  decimals = 2,
  signed = true,
  suffix,
  placeholder = "\u2014",
  className,
}: {
  label: string;
  value?: number | null;
  onChange: (value: number | undefined) => void;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
  signed?: boolean;
  suffix?: string;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const display =
    draft ?? (value == null ? "" : `${formatNumber(value, decimals, signed)}${suffix ?? ""}`);

  const commit = (raw: string) => {
    const cleaned = raw.replace(/[\u2212\u2013]/g, "-").replace(/[^0-9.+-]/g, "").trim();
    setDraft(null);
    if (!cleaned || cleaned === "-" || cleaned === "+" || cleaned === ".") {
      onChange(undefined);
      return;
    }
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return;
    const snapped = Math.round(parsed / step) * step;
    const clamped = Math.min(max, Math.max(min, snapped));
    onChange(Number(clamped.toFixed(decimals)));
  };

  const bump = (direction: 1 | -1) => {
    setDraft(null);
    const base = value ?? 0;
    const next = Math.min(max, Math.max(min, Number((base + direction * step).toFixed(decimals))));
    onChange(next);
  };

  return (
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-xl border-[1.5px] border-dashed border-border/80 bg-card transition-colors hover:border-primary/50 focus-within:border-primary focus-within:bg-background",
        value != null && "border-solid border-border",
        className
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={`Decrease ${label}`}
        onClick={() => bump(-1)}
        className="px-1.5 text-muted-foreground transition-colors hover:text-primary"
      >
        <Minus className="size-3.5" />
      </button>
      <input
        type="text"
        inputMode="decimal"
        aria-label={label}
        value={display}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => {
          setDraft(value == null ? "" : formatNumber(value, decimals, false));
          requestAnimationFrame(() => event.target.select());
        }}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit((event.target as HTMLInputElement).value);
            (event.target as HTMLInputElement).blur();
          }
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            bump(event.key === "ArrowUp" ? 1 : -1);
            setDraft(null);
          }
        }}
        className="w-full min-w-0 bg-transparent py-2 text-center text-[1.05rem] font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground/40"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={`Increase ${label}`}
        onClick={() => bump(1)}
        className="px-1.5 text-muted-foreground transition-colors hover:text-primary"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/** Plain dashed cell used for free-text chart values (slit lamp, fundus, notes). */
export function ChartCellInput({
  label,
  placeholder,
  className,
  ...props
}: React.ComponentProps<"input"> & { label: string }) {
  return (
    <input
      aria-label={label}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-xl border-[1.5px] border-dashed border-border/80 bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-solid focus:border-primary focus:bg-background focus:ring-3 focus:ring-ring/30",
        className
      )}
      {...props}
    />
  );
}

/** Field wrapper used inside chart cells. */
export function ChartField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className={cn(chartLabel, "text-[10px]")}>{label}</span>
      {children}
    </label>
  );
}
