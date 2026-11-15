import { cn } from "@/lib/utils";
import type { QueueItem } from "@/services/queue-services";
import { TY, inferApptType } from "./appointment-type";
import { visitTime } from "./appointment-time";
import { STATUS_LABEL } from "./schedule-config";

/** Compact appointment tile used inside the week board cells. */
export function AppointmentTile({
  item,
  draggable,
  onClick,
  onDragStart,
}: {
  item: QueueItem;
  draggable?: boolean;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const { visit, patient } = item;
  const type = TY[inferApptType(visit.chief_complaint)];
  const cancelled = visit.status === "cancelled";
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`${patient.first_name} ${patient.last_name} · ${type.label} · ${STATUS_LABEL[visit.status]}`}
      className={cn(
        "w-full min-w-0 rounded border-l-[3px] px-1.5 py-1 text-left text-[11px] leading-tight transition-opacity hover:opacity-90",
        type.cardClass,
        cancelled && "opacity-50 line-through",
      )}
      style={{ borderLeftColor: `var(--status-${visit.status})` }}
    >
      <span className="block truncate font-semibold">
        {patient.first_name} {patient.last_name}
      </span>
      <span className="block truncate text-muted-foreground">
        {visitTime(visit) ?? ""} · {type.label}
      </span>
    </button>
  );
}
