import Link from "next/link";
import { ArrowRight, CheckCircle2, Stethoscope, Wallet, DoorOpen } from "lucide-react";
import { OpsNotice } from "@/components/ui/OpsStat";
import { cn, formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types/billing-types";
import type { QueueItem } from "@/services/queue-services";
import { visitTime } from "../../appointments/_components/appointment-time";

const TONE = {
  green: "bg-sage-soft text-sage",
  blue: "bg-t-new-soft text-t-new",
  amber: "bg-warn-soft text-warn-ink",
} as const;

interface Entry {
  key: string;
  text: string;
  when: string; // sortable ISO
  label: string;
  icon: typeof CheckCircle2;
  tone: keyof typeof TONE;
}

const ago = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

/** Today's visit progress and (for roles that can see billing) the latest sales — all real records. */
export default function RecentActivity({
  todayItems,
  invoices,
  loading,
  error,
  onRetry,
}: {
  todayItems: QueueItem[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const entries: Entry[] = [
    ...todayItems
      .filter((i) => i.visit.status === "completed" || i.visit.status === "examining" || i.visit.status === "waiting")
      .map<Entry>((i) => {
        const name = `${i.patient.first_name} ${i.patient.last_name}`;
        const s = i.visit.status;
        return {
          key: `v-${i.visit.id}`,
          text: s === "completed" ? `Examination completed · ${name}` : s === "examining" ? `${name} is in consultation` : `${name} is waiting`,
          when: i.visit.scheduled_at ?? "",
          label: visitTime(i.visit) ?? "",
          icon: s === "completed" ? CheckCircle2 : s === "examining" ? Stethoscope : DoorOpen,
          tone: s === "completed" ? "green" : s === "examining" ? "blue" : "amber",
        };
      }),
    ...invoices.map<Entry>((inv) => ({
      key: `i-${inv.id}`,
      text: `${inv.invoice_no} · ${inv.patient_name} · ${formatCurrency(inv.total_amount)}`,
      when: inv.created_at,
      label: ago(inv.created_at),
      icon: Wallet,
      tone: "amber",
    })),
  ]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, 6);

  return (
    <div className="min-w-0 rounded-xl border border-line bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Recent activity</h3>
          <p className="mt-1 text-xs text-muted-foreground">Today&apos;s visits and latest sales</p>
        </div>
        <Link href="/appointments" className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-sage hover:text-primary-hover">
          Open schedule <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-4">
        {loading ? (
          <OpsNotice kind="loading" text="Loading activity…" />
        ) : error ? (
          <OpsNotice kind="error" text={error} onRetry={onRetry} />
        ) : entries.length === 0 ? (
          <OpsNotice kind="empty" text="Nothing has happened yet today." />
        ) : (
          entries.map(({ key, text, label, icon: Icon, tone }) => (
            <div key={key} className="flex items-center gap-3 border-t border-line/60 py-3 first:border-t-0 first:pt-0">
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", TONE[tone])}>
                <Icon size={15} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{text}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
