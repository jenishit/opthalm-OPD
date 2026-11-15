import type { PlatformRoleCount, PlatformTotals } from "@/types/platform-types";
import { roleLabel } from "./platform-utils";

const PLAN_ROWS = [
  { key: "active_clinics", label: "Active", color: "var(--c-sage)" },
  { key: "trialing_clinics", label: "Trialing", color: "var(--c-t-new)" },
  { key: "pending_clinics", label: "Pending setup", color: "var(--c-clay)" },
  { key: "past_due_clinics", label: "Past due", color: "var(--c-warn)" },
  { key: "cancelled_clinics", label: "Cancelled", color: "var(--c-bad)" },
  { key: "no_plan_clinics", label: "No plan", color: "var(--c-strong)" },
] as const;

/** Subscription status mix across the tenant base. */
export function PlanHealthPanel({ totals }: { totals: PlatformTotals }) {
  const total = totals.clinics;
  const rows = PLAN_ROWS.map((row) => ({ ...row, count: totals[row.key] }));
  const known = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="flex flex-col rounded-[11px] border border-line bg-card shadow-sm">
      <div className="px-5 pb-4 pt-[18px]">
        <h3 className="m-0 font-display text-base font-semibold text-ink">Plan health</h3>
        <p className="m-0 mt-[5px] text-[10px] text-mute">Subscription status across every clinic</p>
      </div>

      {total === 0 ? (
        <p className="px-5 pb-5 text-[10px] text-mute">No clinics yet.</p>
      ) : (
        <div className="flex flex-col gap-4 px-5 pb-5">
          <div className="flex h-2 overflow-hidden rounded-full bg-line">
            {rows.map((row) =>
              row.count > 0 ? (
                <span
                  key={row.key}
                  style={{ width: `${(row.count / total) * 100}%`, backgroundColor: row.color }}
                  title={`${row.label}: ${row.count}`}
                />
              ) : null,
            )}
          </div>
          <ul className="flex flex-col gap-2.5">
            {rows.map((row) => (
              <li key={row.key} className="flex items-center gap-2 text-[10px]">
                <i className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: row.color }} aria-hidden />
                <span className="flex-1 text-mute">{row.label}</span>
                <b className="font-semibold text-ink">{row.count}</b>
                <span className="w-10 text-right text-[9px] text-mute">
                  {total ? `${Math.round((row.count / total) * 100)}%` : "0%"}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-line pt-3 text-[9px] text-mute">
            {known} of {total} clinics have a subscription row.
          </p>
        </div>
      )}
    </div>
  );
}

/** Account mix by backend role. */
export function RoleMixPanel({ roles }: { roles: PlatformRoleCount[] }) {
  const total = roles.reduce((sum, role) => sum + role.count, 0);
  const max = roles.reduce((peak, role) => Math.max(peak, role.count), 0);

  return (
    <div className="flex flex-col rounded-[11px] border border-line bg-card shadow-sm">
      <div className="px-5 pb-4 pt-[18px]">
        <h3 className="m-0 font-display text-base font-semibold text-ink">Accounts by role</h3>
        <p className="m-0 mt-[5px] text-[10px] text-mute">Staff and patient-portal logins across all clinics</p>
      </div>

      {roles.length === 0 ? (
        <p className="px-5 pb-5 text-[10px] text-mute">No accounts yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5 px-5 pb-5">
          {roles.map((role) => (
            <li key={role.role_name} className="flex items-center gap-2.5 text-[10px]">
              <span className="w-24 shrink-0 truncate text-mute">{roleLabel(role.role_name)}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-t-surg"
                  style={{ width: `${max ? Math.max((role.count / max) * 100, 2) : 0}%` }}
                />
              </span>
              <b className="w-8 text-right font-semibold text-ink">{role.count}</b>
              <span className="w-9 text-right text-[9px] text-mute">
                {total ? `${Math.round((role.count / total) * 100)}%` : "0%"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
