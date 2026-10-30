import { RefractionChart } from "./RefractionChart";
import { IopChart } from "./IopChart";
import { SlitEye } from "./SlitEye";
import { FundusEye } from "./FundusEye";
import type { ExamState } from "./types";

const EYES = ["od", "os"] as const;

/** The full exam chart tab — refraction, IOP, slit lamp and fundus together. */
export function ExamChart({
  ex,
  set,
}: {
  ex: ExamState;
  set: (path: Array<string | number>, value: unknown) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <RefractionChart ex={ex} set={set} />
      <IopChart ex={ex} set={set} />
      <div>
        <div className="font-display font-bold text-lg mb-3">Slit Lamp</div>
        <div className="grid sm:grid-cols-2 gap-5">
          {EYES.map((e) => (
            <SlitEye key={e} eye={e} v={ex.slit[e]} set={set} />
          ))}
        </div>
      </div>
      <div>
        <div className="font-display font-bold text-lg mb-3">Fundus</div>
        <div className="grid sm:grid-cols-2 gap-5">
          {EYES.map((e) => (
            <FundusEye key={e} eye={e} d={ex.fundus[e]} set={set} />
          ))}
        </div>
      </div>
    </div>
  );
}
