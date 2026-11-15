import { cn } from "@/lib/utils";
import { subscriptionStatus } from "./platform-utils";

/** Plan-status pill shared by the clinic tables and detail header. */
export function StatusPill({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const s = subscriptionStatus(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 text-[9px] font-semibold leading-none",
        s.className,
        className,
      )}
    >
      <i className="size-1 rounded-full bg-current opacity-70" aria-hidden />
      {s.label}
    </span>
  );
}
