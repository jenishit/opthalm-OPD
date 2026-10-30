"use client";

import { useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { clamp } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import { Chip } from "@/components/ui/ChartUi";

/** Drag-to-set axis dial (0-180°) — no existing equivalent. */
export function AxisDial({
  value,
  onChange,
  size = 230,
}: {
  value: number | null;
  onChange: (v: number) => void;
  size?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const upd = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2),
      dy = e.clientY - (r.top + r.height / 2);
    const a = Math.round(((((-Math.atan2(dy, dx) * 180) / Math.PI) % 180) + 180) % 180);
    onChange(a === 0 ? 180 : a);
  };
  const v = value ?? 90;
  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        ref={ref}
        viewBox="0 0 220 220"
        width={size}
        height={size}
        className="touch-none cursor-grab select-none"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = true;
          upd(e);
        }}
        onPointerMove={(e) => drag.current && upd(e)}
        onPointerUp={() => {
          drag.current = false;
        }}
      >
        <circle cx="110" cy="110" r="102" fill="var(--color-app)" stroke="var(--color-strong)" strokeWidth="2" />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10 * Math.PI) / 180,
            l = i % 9 === 0 ? 14 : i % 3 === 0 ? 9 : 5;
          return (
            <line
              key={i}
              x1={110 + Math.cos(a) * (102 - l)}
              y1={110 - Math.sin(a) * (102 - l)}
              x2={110 + Math.cos(a) * 102}
              y2={110 - Math.sin(a) * 102}
              stroke="var(--color-mute)"
              strokeWidth="1.5"
            />
          );
        })}
        <text x="196" y="114" fontSize="11" fill="var(--color-mute)" textAnchor="end" fontFamily="Inconsolata">
          0°
        </text>
        <text x="110" y="34" fontSize="11" fill="var(--color-mute)" textAnchor="middle" fontFamily="Inconsolata">
          90°
        </text>
        <text x="24" y="114" fontSize="11" fill="var(--color-mute)" fontFamily="Inconsolata">
          180°
        </text>
        <g transform={`translate(110 110) rotate(${-v})`}>
          <line
            x1="-84"
            y1="0"
            x2="84"
            y2="0"
            stroke={value == null ? "var(--color-strong)" : "var(--color-sage)"}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="84" cy="0" r="9" fill="var(--color-clay)" />
          <circle cx="-84" cy="0" r="9" fill="var(--color-clay)" />
        </g>
        <circle cx="110" cy="110" r="30" fill="var(--color-card)" stroke="var(--color-strong)" />
        <text x="110" y="117" textAnchor="middle" fontSize="22" fontFamily="Inconsolata" fill="var(--color-ink)">
          {value == null ? "—" : v + "°"}
        </text>
      </svg>
      <div className="flex gap-2 flex-wrap justify-center">
        <Button variant="ghost" onClick={() => onChange(clamp((value ?? 90) - 5, 1, 180))}>
          <Minus className="size-4" />
          5°
        </Button>
        <Button variant="ghost" onClick={() => onChange(clamp((value ?? 90) - 1, 1, 180))}>
          <Minus className="size-4" />
          1°
        </Button>
        <Button variant="ghost" onClick={() => onChange(clamp((value ?? 90) + 1, 1, 180))}>
          <Plus className="size-4" />
          1°
        </Button>
        <Button variant="ghost" onClick={() => onChange(clamp((value ?? 90) + 5, 1, 180))}>
          <Plus className="size-4" />
          5°
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {[180, 45, 90, 135].map((a) => (
          <Chip key={a} on={value === a} onClick={() => onChange(a)}>
            {a}°
          </Chip>
        ))}
      </div>
    </div>
  );
}
