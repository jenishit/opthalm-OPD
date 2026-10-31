import Link from "next/link";
import { ArrowRight, CheckCircle2, Package, UserRoundPlus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  green: "bg-sage-soft text-sage",
  blue: "bg-[#e8f0f2] text-[#557d8b]",
  amber: "bg-[#f7efdf] text-[#a47a35]",
  violet: "bg-[#f0edf6] text-[#8477a3]",
} as const;

const activity = [
  {
    text: "Prescription created for Sarah Johnson",
    time: "2 min ago",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    text: "Order SO-1024 moved to production",
    time: "12 min ago",
    icon: Package,
    tone: "blue",
  },
  {
    text: "Payment received · $320.00",
    time: "28 min ago",
    icon: Wallet,
    tone: "amber",
  },
  {
    text: "New patient registered · Michael Chen",
    time: "1 hour ago",
    icon: UserRoundPlus,
    tone: "violet",
  },
] as const;

export default function RecentActivity() {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            Recent activity
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Latest updates from your team</p>
        </div>
        <Link
          href="/reports"
          className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-sage hover:text-primary-hover"
        >
          See all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-4">
        {activity.map(({ text, time, icon: Icon, tone }) => (
          <div
            key={text}
            className="flex items-center gap-3 border-t border-line/60 py-3 first:border-t-0 first:pt-0"
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg",
                TONE_STYLES[tone]
              )}
            >
              <Icon size={15} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{text}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
