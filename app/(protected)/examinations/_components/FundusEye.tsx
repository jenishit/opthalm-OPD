"use client";

import { useRef, useState } from "react";
import { EYE } from "@/types/eye-types";
import { Chip } from "@/components/ui/ChartUi";
import { FMARKS, FSTATUS } from "./data";
import { FundusDiagram } from "./FundusDiagram";
import type { FundusFindings } from "./types";

/** Interactive fundus drawing — tap the retina to place the selected mark, tap a mark to remove it. Every tap writes into the exam state. */
export function FundusEye({
  eye,
  d,
  set,
}: {
  eye: "od" | "os";
  d: FundusFindings;
  set: (path: Array<string | number>, value: unknown) => void;
}) {
  const [tool, setTool] = useState(FMARKS[0].id);
  const ref = useRef<SVGSVGElement>(null);
  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = ref.current!.getBoundingClientRect();
    const k = 200 / r.width;
    const x = (e.clientX - r.left) * k;
    const y = (e.clientY - r.top) * k;
    if ((x - 100) ** 2 + (y - 100) ** 2 > 88 * 88) return;
    set(["fundus", eye, "marks"], [...d.marks, { x, y, t: tool }]);
  };
  return (
    <div className="flex flex-col gap-3 items-start w-full">
      <div className="mono-label">{EYE[eye]}</div>
      <FundusDiagram eye={eye} d={d} svgRef={ref} onClickRetina={click} onRemoveMark={(i) => set(["fundus", eye, "marks"], d.marks.filter((_, j) => j !== i))} />
      <div className="flex flex-wrap gap-1.5">
        {FMARKS.map((m) => (
          <Chip key={m.id} on={tool === m.id} onClick={() => setTool(m.id)} className="!py-1 !px-2.5 !text-xs">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: m.c }} />
            {m.n}
          </Chip>
        ))}
      </div>
      <div className="w-full max-w-[310px]">
        <div className="flex justify-between mono-label">
          <span>Cup : disc</span>
          <span className="font-mono text-base text-ink normal-case tracking-normal">{d.cd.toFixed(1)}</span>
        </div>
        <input
          id={`cd-${eye}`}
          type="range"
          min="0.1"
          max="0.9"
          step="0.1"
          value={d.cd}
          onChange={(e) => set(["fundus", eye, "cd"], +e.target.value)}
          aria-label={`Cup to disc ratio ${EYE[eye]}`}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FSTATUS.map((s) => (
          <Chip
            key={s}
            on={d.status.includes(s)}
            warm={s !== "Normal"}
            onClick={() =>
              set(
                ["fundus", eye, "status"],
                d.status.includes(s) ? d.status.filter((x) => x !== s) : [...d.status, s]
              )
            }
            className="!py-1 !px-2.5 !text-xs"
          >
            {s}
          </Chip>
        ))}
      </div>
      <div className="text-sm text-mute">
        {d.marks.length
          ? `${d.marks.length} mark${d.marks.length > 1 ? "s" : ""} placed. Tap the retina to add, tap a mark to remove.`
          : "Tap the retina to place the selected mark."}
      </div>
    </div>
  );
}
