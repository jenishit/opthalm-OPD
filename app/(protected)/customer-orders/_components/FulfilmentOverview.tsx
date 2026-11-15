import { opsCard } from "@/components/ui/OpsStat";
import type { LabJob, LabJobStatus } from "@/types/lab-types";
import { STATUS_LABEL, STATUS_STYLE, type StatusTab } from "./status";

const STEPS: LabJobStatus[] = ["in_fitting", "ready_to_deliver", "delivered", "cancelled"];

export function FulfilmentOverview({ jobs, onSelect }: { jobs: LabJob[]; onSelect: (t: StatusTab) => void }) {
  return (
    <div className={`mt-[17px] ${opsCard}`}>
      <div className="px-5 pb-[14px] pt-[19px]">
        <h3 className="m-0 font-display text-base font-semibold text-ink">Fulfilment overview</h3>
        <p className="m-0 mt-[5px] text-[10px] text-mute">Orders by stage — select one to filter the list</p>
      </div>
      <div className="grid grid-cols-2 gap-2 px-5 pb-5 pt-[5px] md:grid-cols-4">
        {STEPS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            className="flex items-center gap-[9px] rounded-lg border border-line px-3 py-2.5 text-left hover:bg-app"
          >
            <span className={"grid size-[31px] shrink-0 place-items-center rounded-[9px] text-[11px] font-bold " + STATUS_STYLE[s]}>
              {jobs.filter((j) => j.status === s).length}
            </span>
            <b className="text-[10px] text-ink">{STATUS_LABEL[s]}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
