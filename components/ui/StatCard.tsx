import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const KIND_STYLES = {
  green: "bg-sage-soft text-sage",
  blue: "bg-t-new-soft text-t-new",
  amber: "bg-warn-soft text-warn-ink",
  violet: "bg-t-surg-soft text-t-surg",
} as const;

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  kind = "green",
  foot,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  kind?: keyof typeof KIND_STYLES;
  foot: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2.5 text-xs text-muted-foreground">
        <span>{label}</span>
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            KIND_STYLES[kind]
          )}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-0.5 font-semibold text-sage">
          <ArrowUpRight size={13} />
          {change}
        </span>
        <span>{foot}</span>
      </div>
    </div>
  );
}
