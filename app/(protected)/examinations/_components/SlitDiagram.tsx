import { useId } from "react";
import { EYE } from "@/types/eye-types";
import { SLIT } from "./data";
import type { SlitFindings } from "./types";

export type SlitRegion = keyof typeof SLIT;
type Status = "unset" | "ok" | "abn";

/**
 * The slit-lamp drawing, coloured by what has been recorded (grey = not set,
 * green = normal, clay = abnormal). Interactive on the examination screen
 * (pass `onRegion`), static on the printed record.
 */
export function SlitDiagram({
  eye,
  v,
  active,
  onRegion,
  className,
}: {
  eye: "od" | "os";
  v: SlitFindings;
  active?: SlitRegion;
  onRegion?: (r: SlitRegion) => void;
  className?: string;
}) {
  const interactive = Boolean(onRegion);
  const clipId = useId();
  const act = active;
  const st = (r: SlitRegion): Status => (!v[r] ? "unset" : v[r] === SLIT[r].norm ? "ok" : "abn");
  const sc = (r: SlitRegion) => ({ unset: "var(--color-strong)", ok: "var(--color-sage)", abn: "var(--color-clay)" })[st(r)];
  const fl = (r: SlitRegion) => ({ unset: "var(--color-card)", ok: "var(--color-sage-soft)", abn: "var(--color-clay-soft)" })[st(r)];
  const sw = (r: SlitRegion) => (act === r ? 4 : 2);
  const alm = "M8 70 Q120 -14 232 70 Q120 154 8 70Z";
  return (
  <svg viewBox="0 0 240 140" className={className ?? "w-full max-w-[310px]"} role={interactive ? "group" : "img"} aria-label={`Slit lamp ${EYE[eye]}`}>
      <defs>
        <clipPath id={clipId}>
          <path d={alm} />
        </clipPath>
      </defs>
      <path d={alm} fill={fl("conj")} className={interactive ? "cursor-pointer" : undefined} onClick={() => onRegion?.("conj")}>
        <title>Conjunctiva</title>
      </path>
      <g clipPath={`url(#${clipId})`}>
        <circle
          cx="120"
          cy="70"
          r="50"
          fill={fl("ac")}
          stroke={sc("ac")}
          strokeWidth={sw("ac")}
          className={interactive ? "cursor-pointer" : undefined}
          onClick={() => onRegion?.("ac")}
        >
          <title>Iris and anterior chamber</title>
        </circle>
        <circle
          cx="120"
          cy="70"
          r="53"
          fill="none"
          stroke={sc("k")}
          strokeWidth={act === "k" ? 7 : 5}
          className={interactive ? "cursor-pointer" : undefined}
          onClick={() => onRegion?.("k")}
        >
          <title>Cornea</title>
        </circle>
        <circle
          cx="120"
          cy="70"
          r="24"
          fill="var(--color-ink)"
          stroke={sc("p")}
          strokeWidth={sw("p")}
          className={interactive ? "cursor-pointer" : undefined}
          onClick={() => onRegion?.("p")}
        >
          <title>Pupil</title>
        </circle>
        <circle
          cx="120"
          cy="70"
          r="11"
          fill={st("l") === "abn" ? "var(--color-clay-soft)" : "var(--color-card)"}
          stroke={sc("l")}
          strokeWidth={sw("l")}
          strokeDasharray="3 2"
          className={interactive ? "cursor-pointer" : undefined}
          onClick={() => onRegion?.("l")}
        >
          <title>Lens</title>
        </circle>
      </g>
      <path
        d={alm}
        fill="none"
        stroke="transparent"
        strokeWidth="12"
        style={{ pointerEvents: "stroke" }}
        className={interactive ? "cursor-pointer" : undefined}
        onClick={() => onRegion?.("lids")}
      />
      <path d={alm} fill="none" stroke={sc("lids")} strokeWidth={sw("lids")} style={{ pointerEvents: "none" }} />
    </svg>
  );
}
