import { Card } from "@/components/shadcn/card";
import { COND } from "@/types/eye-types";
import { URG_NAME, URG_TONE } from "./constants";
import { PatientAvatar } from "./PatientAvatar";
import type { ExamPatient } from "./types";

export function ExamHeader({ p }: { p: ExamPatient }) {
  const lastVisit = p.visits[0];
  return (
    <Card className="flex flex-row flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <PatientAvatar p={p} size="lg" />
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-semibold">{p.name}</h2>
          <p className="truncate text-sm text-mute">
            {p.id.slice(0, 8).toUpperCase()} · {p.ageLabel ?? `${p.age} years`} ·{" "}
            {p.chiefComplaint ?? COND[lastVisit?.dx ?? ""]?.name ?? "Comprehensive eye examination"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-xs font-semibold text-sage">
          <span className="size-1.5 rounded-full bg-sage" />
          In progress
        </span>
        <span className={`pill pill-${URG_TONE[p.urg]}`}>{URG_NAME[p.urg]}</span>
      </div>
    </Card>
  );
}
