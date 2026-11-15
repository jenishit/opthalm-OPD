"use client";

import { useState } from "react";
import { EYE } from "@/types/eye-types";
import { Chip } from "@/components/ui/ChartUi";
import { SLIT } from "./data";
import { SlitDiagram } from "./SlitDiagram";
import type { SlitFindings } from "./types";

type Region = keyof typeof SLIT;

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
  const regions = Object.keys(SLIT) as Region[];
  return (
    <div className="flex flex-col gap-3 items-start w-full">
      <div className="mono-label">{EYE[eye]}</div>
      <SlitDiagram eye={eye} v={v} active={act} onRegion={setAct} />
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
