import { Card } from "@/components/shadcn/card";
import { cn } from "@/lib/utils";
import { COND } from "@/types/eye-types";
import { QUEUE_TIMES } from "./constants";
import { PatientAvatar } from "./PatientAvatar";
import type { ExamPatient } from "./types";

export function QueuePanel({
  patients,
  selectedId,
  onSelect,
}: {
  patients: ExamPatient[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h3 className="font-display text-base font-semibold">Today&apos;s patients</h3>
          <p className="text-xs text-mute">
            Examination queue · 
            {patients.length} patients
          </p>
        </div>
        <span className="grid h-7 min-w-7 place-items-center rounded-md bg-sage-soft px-1.5 text-xs font-bold text-sage">
          {String(patients.length).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-col">
        {patients.map((x, i) => (
          <button
            key={x.id}
            type="button"
            onClick={() => onSelect(x.id)}
            className={cn(
              "flex items-center gap-2.5 border-b border-l-[3px] border-line/70 px-3.5 py-3 text-left transition-colors last:border-b-0",
              x.id === selectedId ? "border-l-sage bg-sage-soft/50" : "border-l-transparent hover:bg-app",
            )}
          >
            <PatientAvatar p={x} size="sm" />
            <span className="min-w-0 flex-1">
              <b className="block truncate text-sm font-semibold">{x.name}</b>
              <small className="block truncate text-xs text-mute">{COND[x.conds[0]]?.name ?? "General"}</small>
            </span>
            <span className="shrink-0 font-mono text-xs text-mute">{QUEUE_TIMES[i] ?? ""}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
