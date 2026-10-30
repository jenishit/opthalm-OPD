import { EYE } from "@/types/eye-types";
import { IopCell } from "@/components/ui/IopCell";
import { ChartGrid, type ChartRow } from "./ChartGrid";
import type { ExamState } from "./types";

/** Intraocular pressure — writes directly into the exam state. */
export function IopChart({
  ex,
  set,
}: {
  ex: ExamState;
  set: (path: Array<string | number>, value: unknown) => void;
}) {
  const rows: ChartRow[] = [
    [
      "Intraocular Pressure",
      "mmHg",
      (e) => <IopCell title={`IOP · ${EYE[e]}`} value={ex.iop[e]} onChange={(v) => set(["iop", e], v)} />,
    ],
  ];
  return <ChartGrid rows={rows} />;
}
