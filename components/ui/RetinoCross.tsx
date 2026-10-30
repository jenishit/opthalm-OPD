import { Copy } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { DiopterCell } from "@/components/ui/DiopterCell";
import { EYE } from "@/types/eye-types";

/** Cross-shaped vertical/horizontal meridian retinoscopy entry — no existing equivalent. */
export function RetinoCross({
  v,
  onChange,
  eye,
}: {
  v: [number | null, number | null];
  onChange: (v: [number | null, number | null]) => void;
  eye: "od" | "os";
}) {
  return (
    <div className="relative" style={{ width: 172, height: 118 }}>
      <svg viewBox="0 0 172 118" width="172" height="118" className="absolute inset-0" aria-hidden="true">
        <line x1="6" y1="59" x2="104" y2="59" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="55" y1="6" x2="55" y2="112" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <div className="absolute" style={{ left: 62, top: 4 }}>
        <DiopterCell
          title={`Retinoscopy, vertical meridian · ${EYE[eye]}`}
          value={v[0]}
          onChange={(x) => onChange([x, v[1]])}
          extra={
            <Button variant="secondary" onClick={() => onChange([v[0], v[0]])}>
              <Copy className="size-4" />
              Same on both
            </Button>
          }
        />
      </div>
      <div className="absolute" style={{ left: 62, top: 66 }}>
        <DiopterCell
          title={`Retinoscopy, horizontal meridian · ${EYE[eye]}`}
          value={v[1]}
          onChange={(x) => onChange([v[0], x])}
        />
      </div>
    </div>
  );
}
