import { usageBarColor, usagePercent, usageTone } from "./platform-utils";

/** A labelled used/limit meter, used by the resource-utilization panels. */
export function UsageMeter({
  label,
  used,
  limit,
  hint,
}: {
  label: string;
  used: number;
  limit: number | null;
  hint?: string;
}) {
  const percent = usagePercent(used, limit);
  const width = limit === null ? 100 : Math.max(percent ?? 0, used > 0 ? 2 : 0);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[11px] text-mute">{label}</span>
        <b className="text-[11px] font-semibold text-ink">
          {used.toLocaleString()}{" "}
          <span className="font-normal text-mute">/ {limit === null ? "Unlimited" : limit.toLocaleString()}</span>
        </b>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[5px] bg-line">
        <span
          className="block h-full rounded-[5px] transition-[width] duration-300"
          style={{ width: `${width}%`, backgroundColor: usageBarColor(percent) }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 text-[9px] text-mute">
        <span>{hint ?? (percent === null ? "No cap on this plan" : `${percent.toFixed(0)}% of the plan limit used`)}</span>
        {percent !== null && (
          <span className={`font-semibold ${usageTone(percent)}`}>
            {percent >= 100 ? "At limit" : percent >= 80 ? "Near limit" : "Healthy"}
          </span>
        )}
      </div>
    </div>
  );
}

/** Three tiny inline bars for dense table rows. */
export function MiniUsage({ subscription }: { subscription: { seats_used: number; seats_limit: number | null; patient_records_used: number; patient_records_limit: number | null; locations_used: number; locations_limit: number | null } | null }) {
  if (!subscription) return <span className="text-[10px] text-mute">No plan</span>;
  const rows = [
    { label: "Seats", used: subscription.seats_used, limit: subscription.seats_limit },
    { label: "Patients", used: subscription.patient_records_used, limit: subscription.patient_records_limit },
    { label: "Locations", used: subscription.locations_used, limit: subscription.locations_limit },
  ];
  return (
    <div className="flex flex-col gap-1">
      {rows.map((row) => {
        const pct = usagePercent(row.used, row.limit);
        return (
          <div key={row.label} className="flex items-center gap-1.5" title={`${row.label}: ${row.used} of ${row.limit ?? "unlimited"}`}>
            <span className="w-12 shrink-0 text-[8px] uppercase tracking-[0.4px] text-mute">{row.label}</span>
            <span className="h-1 w-14 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full"
                style={{ width: `${pct === null ? 100 : Math.max(pct, row.used > 0 ? 2 : 0)}%`, backgroundColor: usageBarColor(pct) }}
              />
            </span>
            <span className={`w-10 text-[8px] ${usageTone(pct)}`}>{pct === null ? "∞" : `${pct.toFixed(0)}%`}</span>
          </div>
        );
      })}
    </div>
  );
}
