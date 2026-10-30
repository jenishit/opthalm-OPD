import { EYE } from "@/types/eye-types";
import { Field } from "@/components/ui/Field";
import { DiopterCell } from "@/components/ui/DiopterCell";
import { AxisCell } from "@/components/ui/AxisCell";
import { VaCell } from "@/components/ui/VaCell";
import { RetinoCross } from "@/components/ui/RetinoCross";
import { ChartGrid, type ChartRow } from "./ChartGrid";
import type { ExamState } from "./types";

/** Retinoscopy, manifest refraction, near add and corrected vision — every cell writes directly into the exam state. */
export function RefractionChart({
  ex,
  set,
}: {
  ex: ExamState;
  set: (path: Array<string | number>, value: unknown) => void;
}) {
  const rows: ChartRow[] = [
    [
      "Retinoscopy",
      "dioptres",
      (e) => <RetinoCross eye={e} v={ex.ret[e]} onChange={(v) => set(["ret", e], v)} />,
    ],
    [
      "Manifest Refraction",
      "sph / cyl × axis",
      (e) => (
        <div className="flex flex-wrap gap-2">
          <Field label="Sph">
            <DiopterCell
              title={`Sphere · ${EYE[e]}`}
              value={ex.mr[e].s}
              onChange={(v) => set(["mr", e, "s"], v)}
            />
          </Field>
          <Field label="Cyl">
            <DiopterCell
              title={`Cylinder · ${EYE[e]}`}
              value={ex.mr[e].c}
              onChange={(v) => set(["mr", e, "c"], v)}
            />
          </Field>
          <Field label="Axis">
            <AxisCell title={`Axis · ${EYE[e]}`} value={ex.mr[e].a} onChange={(v) => set(["mr", e, "a"], v)} />
          </Field>
        </div>
      ),
    ],
    [
      "Near Add",
      "presbyopia",
      (e) => (
        <DiopterCell
          title={`Near add · ${EYE[e]}`}
          value={ex.add[e]}
          defSign={1}
          onChange={(v) => set(["add", e], v)}
        />
      ),
    ],
    [
      "Corrected Vision",
      "distance · near",
      (e) => (
        <VaCell title={`Corrected vision · ${EYE[e]}`} value={ex.cv[e]} onChange={(v) => set(["cv", e], v)} />
      ),
    ],
  ];
  return <ChartGrid rows={rows} />;
}
