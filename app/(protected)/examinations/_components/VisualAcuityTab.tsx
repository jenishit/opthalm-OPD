import { Segmented } from "@/components/ui/ChartUi";
import { Gauge } from "@/components/ui/Gauge";
import type { SetExam } from "./constants";
import Snellen from "./Snellen";
import type { ExamState } from "./types";

const LABEL = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

export function VisualAcuityTab({
  ex,
  eye,
  onEyeChange,
  set,
}: {
  ex: ExamState;
  eye: "od" | "os";
  onEyeChange: (e: "od" | "os") => void;
  set: SetExam;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Segmented
        value={eye}
        onChange={onEyeChange}
        options={[
          { value: "od", label: "Right eye (OD)" },
          { value: "os", label: "Left eye (OS)" },
        ]}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <span className={LABEL}>Visual acuity · tap the letters read</span>
          <Snellen keys={ex.va[eye]} onChange={(k) => set(["va", eye], k)} />
        </div>
        <div>
          <span className={LABEL}>Intraocular pressure</span>
          <Gauge value={ex.iop[eye] ?? 15} onChange={(v) => set(["iop", eye], v)} />
        </div>
      </div>
    </div>
  );
}
