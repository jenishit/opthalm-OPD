"use client";

import { cn } from "@/lib/utils";

const SNELLEN = [
  ["E"],
  ["F", "P"],
  ["T", "O", "Z"],
  ["L", "P", "E", "D"],
  ["P", "E", "C", "F", "D"],
  ["E", "D", "F", "C", "Z", "P"],
  ["F", "E", "L", "O", "P", "Z", "D"],
];

const SNL = ["6/60", "6/36", "6/24", "6/18", "6/12", "6/9", "6/6"];
const SNS = [64, 48, 36, 28, 22, 17, 13];

export function snellenVA(keys: string[]): { l: string; miss: number } | null {
  let best: { l: string; miss: number } | null = null;
  SNELLEN.forEach((r, i) => {
    const n = r.filter((_, j) => keys.includes(`${i}-${j}`)).length;
    if (n >= Math.ceil(r.length / 2)) best = { l: SNL[i], miss: r.length - n };
  });
  return best;
}

/** Uncorrected / presenting visual acuity — tap the letters the patient reads correctly. */
export default function Snellen({ keys, onChange }: { keys: string[]; onChange: (keys: string[]) => void }) {
  const va = snellenVA(keys);
  const tog = (k: string) => onChange(keys.includes(k) ? keys.filter((x) => x !== k) : [...keys, k]);
  return (
    <div>
      <div className="bg-card border border-line rounded-md p-3 flex flex-col items-center gap-1.5">
        {SNELLEN.map((r, i) => (
          <div key={i} className="flex items-center gap-2 w-full justify-center">
            <button
              type="button"
              aria-label={`Mark whole row ${SNL[i]}`}
              onClick={() => {
                const all = r.map((_, j) => `${i}-${j}`);
                const full = all.every((k) => keys.includes(k));
                onChange(full ? keys.filter((k) => !all.includes(k)) : [...new Set([...keys, ...all])]);
              }}
              className="w-12 text-left font-mono text-[11px] text-mute hover:text-sage"
            >
              {SNL[i]}
            </button>
            <div className="flex gap-2 sm:gap-3 flex-1 justify-center">
              {r.map((ch, j) => {
                const k = `${i}-${j}`,
                  on = keys.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() => tog(k)}
                    style={{ fontSize: SNS[i], lineHeight: 1, fontWeight: 700 }}
                    className={cn(
                      "px-1.5 py-0.5 rounded transition-colors font-sans",
                      on ? "bg-sage text-onacc" : "text-ink hover:bg-sage-soft"
                    )}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
            <span className="w-12" />
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Acuity</span>
        <span className="font-mono text-2xl">{va ? `${va.l}${va.miss ? ` −${va.miss}` : ""}` : "—"}</span>
      </div>
    </div>
  );
}
