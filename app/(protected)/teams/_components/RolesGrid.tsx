import { ShieldCheck } from "lucide-react";
import { opsCard } from "@/components/ui/OpsStat";
import { ROLE_LABEL, ROLE_SCOPE } from "@/lib/permissions";
import { assignableRole } from "@/schemas/team-schema";

export function RolesGrid() {
  return (
    <div className="mt-[17px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
      {/* The platform super-admin role isn't a clinic role, so it isn't offered here. */}
      {assignableRole.map((r) => (
        <div key={r} className={`p-5 ${opsCard}`}>
          <span className="grid size-[34px] place-items-center rounded-[9px] bg-sage-soft text-sage">
            <ShieldCheck size={17} aria-hidden />
          </span>
          <h3 className="mb-[7px] mt-[14px] font-display text-[15px] font-semibold text-ink">
            {ROLE_LABEL[r]}
          </h3>
          <p className="m-0 text-[10px] leading-[1.7] text-mute">{ROLE_SCOPE[r]}</p>
        </div>
      ))}
    </div>
  );
}
