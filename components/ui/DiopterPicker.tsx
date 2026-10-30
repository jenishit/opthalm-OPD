"use client";

import { useState } from "react";
import { cn, fD } from "@/lib/utils";

/** Tap-grid dioptre entry (sign, whole numbers, quarter steps) — no existing equivalent. */
export function DiopterPicker({
  value,
  onChange,
  defSign = -1,
}: {
  value: number | null;
  onChange: (v: number) => void;
  defSign?: 1 | -1;
}) {
  const [sign, setSign] = useState<1 | -1>(
    value == null ? defSign : value < 0 ? -1 : value > 0 ? 1 : defSign
  );
  const a = Math.abs(value || 0),
    whole = Math.floor(a + 1e-9),
    frac = Math.round((a - whole) * 100) / 100,
    tens = whole >= 10 ? 10 : 0,
    ones = whole - tens;
  const emit = (s: number, t: number, o: number, f: number) =>
    onChange(Math.round(s * (t + o + f) * 100) / 100);
  const sel = value != null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex rounded-md overflow-hidden border border-line shrink-0">
          {([-1, 1] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-label={s < 0 ? "Minus" : "Plus"}
              onClick={() => {
                setSign(s);
                emit(s, tens, ones, frac);
              }}
              className={cn(
                "w-14 h-14 text-3xl font-mono",
                sign === s ? "bg-sage text-onacc" : "bg-card text-ink hover:bg-sage-soft"
              )}
            >
              {s < 0 ? "−" : "+"}
            </button>
          ))}
        </div>
        <div className="flex-1 text-center font-mono text-4xl tabular-nums">
          {fD(value)}
          <span className="text-base text-mute ml-1">D</span>
        </div>
      </div>
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Whole dioptres
        </span>
        <div className="grid grid-cols-5 gap-2 mt-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => emit(sign, tens, n, frac)}
              className={cn(
                "h-12 rounded-md border font-mono text-xl",
                sel && ones === n
                  ? "bg-sage text-onacc border-sage"
                  : "bg-card border-line hover:border-sage"
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => emit(sign, tens ? 0 : 10, ones, frac)}
          className={cn(
            "mt-2 h-10 w-full rounded-md border text-sm font-semibold",
            tens ? "bg-sage text-onacc border-sage" : "bg-card border-line hover:border-sage"
          )}
        >
          {tens ? "10 added (tap to remove)" : "Add 10 dioptres"}
        </button>
      </div>
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Quarter steps
        </span>
        <div className="grid grid-cols-4 gap-2 mt-1.5">
          {[0, 0.25, 0.5, 0.75].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => emit(sign, tens, ones, f)}
              className={cn(
                "h-12 rounded-md border font-mono text-xl",
                sel && frac === f
                  ? "bg-sage text-onacc border-sage"
                  : "bg-card border-line hover:border-sage"
              )}
            >
              .{String(Math.round(f * 100)).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
