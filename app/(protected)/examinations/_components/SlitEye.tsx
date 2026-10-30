"use client";

import { useState } from "react";
import { EYE } from "@/types/eye-types";
import { Chip } from "@/components/ui/ChartUi";
import { SLIT } from "./data";
import type { SlitFindings } from "./types";

type Region = keyof typeof SLIT;
type Status = "unset" | "ok" | "abn";

/** Interactive slit-lamp drawing — tap a structure, then tap a finding. Every tap writes into the exam state. */
export function SlitEye({
  eye,
  v,
  set,
}: {
  eye: "od" | "os";
  v: SlitFindings;
  set: (path: Array<string | number>, value: unknown) => void;
}) {
  const [act, setAct] = useState<Region>("k");
  const st = (r: Region): Status => (!v[r] ? "unset" : v[r] === SLIT[r].norm ? "ok" : "abn");
  const sc = (r: Region) =>
    ({
      unset: "var(--color-strong)",
      ok: "var(--color-sage)",
      abn: "var(--color-clay)",
    })[st(r)];
  const fl = (r: Region) =>
    ({
      unset: "var(--color-card)",
      ok: "var(--color-sage-soft)",
      abn: "var(--color-clay-soft)",
    })[st(r)];
  const sw = (r: Region) => (act === r ? 4 : 2);
  const alm = "M8 70 Q120 -14 232 70 Q120 154 8 70Z";
  const regions = Object.keys(SLIT) as Region[];
  return (
    <div className="flex flex-col gap-3 items-start w-full">
      <div className="mono-label">{EYE[eye]}</div>
      <svg viewBox="0 0 240 140" className="w-full max-w-[310px]" role="group" aria-label={`Slit lamp ${EYE[eye]}`}>
        <defs>
          <clipPath id={"cl" + eye}>
            <path d={alm} />
          </clipPath>
        </defs>
        <path d={alm} fill={fl("conj")} className="cursor-pointer" onClick={() => setAct("conj")}>
          <title>Conjunctiva</title>
        </path>
        <g clipPath={`url(#cl${eye})`}>
          <circle
            cx="120"
            cy="70"
            r="50"
            fill={fl("ac")}
            stroke={sc("ac")}
            strokeWidth={sw("ac")}
            className="cursor-pointer"
            onClick={() => setAct("ac")}
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
            className="cursor-pointer"
            onClick={() => setAct("k")}
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
            className="cursor-pointer"
            onClick={() => setAct("p")}
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
            className="cursor-pointer"
            onClick={() => setAct("l")}
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
          className="cursor-pointer"
          onClick={() => setAct("lids")}
        />
        <path d={alm} fill="none" stroke={sc("lids")} strokeWidth={sw("lids")} style={{ pointerEvents: "none" }} />
      </svg>
      <div className="flex flex-wrap gap-1.5">
        {regions.map((r) => (
          <Chip key={r} on={act === r} onClick={() => setAct(r)} className="!py-1 !px-2.5 !text-xs">
            {SLIT[r].n}
          </Chip>
        ))}
      </div>
      <div className="rounded-md border border-line bg-app p-2.5 w-full">
        <div className="mono-label mb-1.5">{SLIT[act].n}</div>
        <div className="flex flex-wrap gap-1.5">
          {SLIT[act].o.map((o) => (
            <Chip
              key={o}
              on={v[act] === o}
              warm={o !== SLIT[act].norm}
              onClick={() => set(["slit", eye, act], v[act] === o ? null : o)}
              className="!py-1 !px-2.5 !text-sm"
            >
              {o}
            </Chip>
          ))}
        </div>
      </div>
      <div className="font-mono text-base leading-snug">
        {(["k", "p", "l", "conj", "lids", "ac"] as Region[])
          .filter((r) => v[r])
          .map((r) => (
            <div key={r} className={v[r] !== SLIT[r].norm ? "text-clay font-semibold" : ""}>
              {r === "k" ? "K" : r === "l" ? "L" : SLIT[r].n.split(" ")[0]} – {v[r]}
            </div>
          ))}
        {!Object.values(v).some(Boolean) && (
          <div className="text-mute font-sans text-sm">Tap a part of the eye, then a finding.</div>
        )}
      </div>
    </div>
  );
}
