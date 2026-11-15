import type { MouseEventHandler, Ref } from "react";
import { EYE } from "@/types/eye-types";
import { FMARKS } from "./data";
import type { FundusFindings } from "./types";

/**
 * The fundus drawing: disc with its cup:disc ratio, macula, vessels and the
 * marks placed on the retina. Interactive on the examination screen (pass
 * `onClickRetina` / `onRemoveMark`), static on the printed record.
 */
export function FundusDiagram({
  eye,
  d,
  svgRef,
  onClickRetina,
  onRemoveMark,
  className,
}: {
  eye: "od" | "os";
  d: FundusFindings;
  svgRef?: Ref<SVGSVGElement>;
  onClickRetina?: MouseEventHandler<SVGSVGElement>;
  onRemoveMark?: (index: number) => void;
  className?: string;
}) {
  const od = eye === "od";
  const dx = od ? 138 : 62;
  const mx = od ? 92 : 108;
  const col = (t: string) => FMARKS.find((m) => m.id === t)!.c;
  return (
  <svg
    ref={svgRef}
    viewBox="0 0 200 200"
    className={className ?? "w-full max-w-[250px]" + (onClickRetina ? " cursor-crosshair" : "")}
    onClick={onClickRetina}
    role="img"
      aria-label={`Fundus ${EYE[eye]}`}
    >
      <circle cx="100" cy="100" r="92" fill="var(--color-clay-soft)" stroke="var(--color-ink)" strokeWidth="2" />
      {[
        [-30, -34],
        [-34, 6],
        [-20, 40],
        [-8, -52],
      ].map(([a, b], i) => (
        <path
          key={i}
          d={`M${dx} 100 Q${dx + (od ? -1 : 1) * Math.abs(a)} ${100 + b / 2} ${dx + (od ? -1 : 1) * (Math.abs(a) + 30)} ${100 + b * 1.6}`}
          fill="none"
          stroke="var(--color-bad)"
          strokeWidth="2"
          opacity=".6"
        />
      ))}
      <circle cx={mx} cy="102" r="11" fill="none" stroke="var(--color-warn)" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx={mx} cy="102" r="2.6" fill="var(--color-warn)" />
      <circle cx={dx} cy="98" r="16" fill="var(--color-warn-soft)" stroke="var(--color-warn)" strokeWidth="1.8" />
      <circle cx={dx} cy="98" r={16 * d.cd} fill="var(--color-card)" stroke="var(--color-mute)" strokeWidth="1" />
      {d.marks.map((m, i) => (
        <g
          key={i}
          onClick={onRemoveMark ? (e) => { e.stopPropagation(); onRemoveMark(i); } : undefined}
          className={onRemoveMark ? "cursor-pointer" : undefined}
        >
          <circle cx={m.x} cy={m.y} r="7" fill={col(m.t)} stroke="var(--color-card)" strokeWidth="1.5" />
          <title>{FMARKS.find((f) => f.id === m.t)!.n}{onRemoveMark ? " (tap to remove)" : ""}</title>
        </g>
      ))}
    </svg>
  );
}
