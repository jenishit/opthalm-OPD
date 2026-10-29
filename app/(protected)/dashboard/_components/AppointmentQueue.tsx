import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import { Badge } from "@/components/shadcn/badge";
import { ArrowRight, CalendarDays, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  rose: "bg-[#f1e1dd] text-[#9c625b]",
  blue: "bg-[#e0eaf0] text-[#54788c]",
  gold: "bg-[#f2e9d5] text-[#9b783e]",
  green: "bg-sage-soft text-sage",
  lilac: "bg-[#e9e3f1] text-[#76648f]",
} as const;

const STATUS_VARIANT = {
  "In consultation": "default",
  Waiting: "secondary",
  "Checked in": "outline",
  Upcoming: "ghost",
} as const;

const appointments = [
  {
    time: "09:00 AM",
    name: "Sarah Johnson",
    type: "Comprehensive eye exam",
    status: "In consultation",
    initials: "SJ",
    tone: "rose",
  },
  {
    time: "09:30 AM",
    name: "Michael Chen",
    type: "Refraction",
    status: "Waiting",
    initials: "MC",
    tone: "blue",
  },
  {
    time: "10:00 AM",
    name: "Emily Davis",
    type: "Follow-up visit",
    status: "Checked in",
    initials: "ED",
    tone: "gold",
  },
  {
    time: "10:30 AM",
    name: "David Wilson",
    type: "New patient",
    status: "Upcoming",
    initials: "DW",
    tone: "green",
  },
  {
    time: "11:00 AM",
    name: "Olivia Martinez",
    type: "Contact lens fitting",
    status: "Upcoming",
    initials: "OM",
    tone: "lilac",
  },
] as const;

export default function AppointmentQueue() {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pb-3.5 pt-4.5">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            Appointment queue
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Your next patients, at a glance</p>
        </div>
        <Link
          href="/appointments"
          className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-sage hover:text-primary-hover"
        >
          View schedule <ArrowRight size={14} />
        </Link>
      </div>
      <div className="px-3">
        {appointments.map((a) => (
          <Link
            href="/appointments"
            key={a.name}
            className="flex items-center gap-2.5 border-t border-line/60 px-2 py-2.5 first:border-t-0 hover:bg-muted/40"
          >
            <span className="w-[58px] shrink-0 font-mono text-xs text-muted-foreground">
              {a.time}
            </span>
            <Avatar size="sm">
              <AvatarFallback className={cn("font-semibold", TONE_STYLES[a.tone])}>
                {a.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-sm font-semibold text-foreground">{a.name}</b>
              <span className="block truncate text-xs text-muted-foreground">{a.type}</span>
            </div>
            <Badge variant={STATUS_VARIANT[a.status]}>{a.status}</Badge>
            <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
      <Link
        href="/appointments"
        className="mx-4 my-3 flex items-center justify-center gap-2 rounded-lg border border-line bg-muted/40 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
      >
        <CalendarDays size={15} /> Open full appointment calendar <ArrowRight size={14} />
      </Link>
    </div>
  );
}
