import { useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { clamp } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import { Chip } from "@/components/ui/ChartUi";

/** Drag-to-set intraocular pressure gauge (mmHg) — no existing equivalent. */

export function Gauge({
  value,
  onChange,
  max = 60,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const cx0 = 150,
    cy0 = 140,
    r = 112;
  const pt = (v: number, rr = r): [number, number] => [
    cx0 - rr * Math.cos((Math.PI * v) / max),
    cy0 - rr * Math.sin((Math.PI * v) / max),
  ];
  const arc = (a: number, b: number) => {
    const [x0, y0] = pt(a),
      [x1, y1] = pt(b);
    return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const upd = (e: React.PointerEvent) => {
    const rc = ref.current!.getBoundingClientRect(),
      k = 300 / rc.width,
      x = (e.clientX - rc.left) * k,
      y = (e.clientY - rc.top) * k;
    let a = Math.atan2(cy0 - y, x - cx0);
    if (a < 0) a = x < cx0 ? Math.PI : 0;
    onChange(Math.round((1 - a / Math.PI) * max * 2) / 2);
  };
  const [nx, ny] = pt(value ?? 0, r - 20);
  const gaugeBands: Array<[number, number, string]> = [
    [0, 10, "var(--color-warn)"],
    [10, 21, "var(--color-ok)"],
    [21, 25, "var(--color-warn)"],
    [25, 60, "var(--color-bad)"],
  ];
  const tone =
    value == null
      ? "var(--color-mute)"
      : value > 25
        ? "var(--color-bad)"
        : value > 21
          ? "var(--color-warn)"
          : "var(--color-ok)";
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        ref={ref}
        viewBox="0 0 300 175"
        className="w-full max-w-[340px] select-none cursor-pointer"
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
        {gaugeBands.map(([a, b, c]) => (
          <path key={a} d={arc(a, b)} fill="none" stroke={c} strokeWidth="15" />
        ))}
        {[0, 10, 20, 30, 40, 50, 60].map((v) => {
          const [x, y] = pt(v, r + 18);
          return (
            <text
              key={v}
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="11"
              fontFamily="Inconsolata"
              fill="var(--color-mute)"
            >
              {v}
            </text>
          );
        })}
        <line
          x1={cx0}
          y1={cy0}
          x2={nx}
          y2={ny}
          stroke="var(--color-ink)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx={cx0} cy={cy0} r="9" fill="var(--color-ink)" />
        <text
          x={cx0}
          y="170"
          textAnchor="middle"
          fontSize="26"
          fontFamily="Inconsolata"
          fontWeight="600"
          fill={tone}
        >
          {value == null ? "—" : value.toFixed(2)}{" "}
          <tspan fontSize="13" fill="var(--color-mute)">
            mmHg
          </tspan>
        </text>
      </svg>
      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          variant="ghost"
          onClick={() => onChange(clamp((value ?? 15) - 1, 0, max))}
        >
          <Minus className="size-4" />1
        </Button>
        <Button
          variant="ghost"
          onClick={() => onChange(clamp((value ?? 15) - 0.5, 0, max))}
        >
          <Minus className="size-4" />
          0.5
        </Button>
        <Button
          variant="ghost"
          onClick={() => onChange(clamp((value ?? 15) + 0.5, 0, max))}
        >
          <Plus className="size-4" />
          0.5
        </Button>
        <Button
          variant="ghost"
          onClick={() => onChange(clamp((value ?? 15) + 1, 0, max))}
        >
          <Plus className="size-4" />1
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {[12, 14, 16, 18, 21, 24, 30].map((v) => (
          <Chip key={v} on={value === v} onClick={() => onChange(v)}>
            {v}
          </Chip>
        ))}
      </div>
      <p className="text-xs text-mute">
        Normal range 10 to 21 mmHg. Drag the needle or use the buttons.
      </p>
    </div>
  );
}
