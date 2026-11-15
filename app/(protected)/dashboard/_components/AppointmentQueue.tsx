import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import { Badge } from "@/components/shadcn/badge";
import { ArrowRight, CalendarDays, ChevronRight } from "lucide-react";
import { OpsNotice } from "@/components/ui/OpsStat";
import { avatarAccent } from "@/lib/utils";
import type { QueueItem } from "@/services/queue-services";
import { TY, inferApptType } from "../../appointments/_components/appointment-type";
import { visitTime, toMinutes } from "../../appointments/_components/appointment-time";
import { STATUS_LABEL } from "../../appointments/_components/schedule-config";

const MAX_ROWS = 6;
const VARIANT = { scheduled: "ghost", waiting: "secondary", examining: "default", completed: "outline", cancelled: "ghost" } as const;

/** Today's real queue: cancelled visits hidden, finished ones last, in appointment order. */
export default function AppointmentQueue({
  items,
  loading,
  error,
  onRetry,
}: {
  items: QueueItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const active = items
    .filter((i) => i.visit.status !== "cancelled")
    .sort((a, b) => {
      const done = Number(a.visit.status === "completed") - Number(b.visit.status === "completed");
      return done || toMinutes(visitTime(a.visit) ?? "00:00") - toMinutes(visitTime(b.visit) ?? "00:00");
    });
  const shown = active.slice(0, MAX_ROWS);

  return (
    <div className="min-w-0 rounded-xl border border-line bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pb-3.5 pt-4.5">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Appointment queue</h3>
          <p className="mt-1 text-xs text-muted-foreground">Today&apos;s patients, in order</p>
        </div>
        <Link href="/appointments" className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-sage hover:text-primary-hover">
          View schedule <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <OpsNotice kind="loading" text="Loading today's queue…" />
      ) : error ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : shown.length === 0 ? (
        <OpsNotice kind="empty" text="No appointments today." />
      ) : (
        <ul className="px-3">
          {shown.map(({ visit, patient }) => {
            const { hue, initials } = avatarAccent(`${patient.first_name} ${patient.last_name}`);
            return (
              <li key={visit.id} className="border-t border-line/60 first:border-t-0">
                <Link href={`/patients/${patient.id}/visits/${visit.id}`} className="flex items-center gap-2.5 px-2 py-2.5 hover:bg-muted/40">
                  <span className="w-[52px] shrink-0 font-mono text-xs text-muted-foreground">{visitTime(visit) ?? "—"}</span>
                  <Avatar size="sm">
                    <AvatarFallback className="font-semibold" style={{ background: `hsl(${hue} 28% 82%)`, color: "var(--c-on-pastel)" }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-sm font-semibold text-foreground">
                      {patient.first_name} {patient.last_name}
                    </b>
                    <span className="block truncate text-xs text-muted-foreground">{TY[inferApptType(visit.chief_complaint)].label}</span>
                  </div>
                  <Badge variant={VARIANT[visit.status]}>{STATUS_LABEL[visit.status]}</Badge>
                  <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !error && active.length > MAX_ROWS && (
        <p className="px-5 pb-1 pt-2 text-xs text-muted-foreground">+{active.length - MAX_ROWS} more today</p>
      )}
      <Link
        href="/appointments"
        className="mx-4 my-3 flex items-center justify-center gap-2 rounded-lg border border-line bg-muted/40 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
      >
        <CalendarDays size={15} /> Open full appointment calendar <ArrowRight size={14} />
      </Link>
    </div>
  );
}
