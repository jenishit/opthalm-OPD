"use client";

import { useMemo, useState } from "react";
import { UserRoundPlus, Users, Stethoscope, Wrench, ShieldCheck } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { OpsStat } from "@/components/ui/OpsStat";
import { useAsync } from "@/lib/hooks/use-async";
import { getProfileDetails } from "@/services/profile-services";
import { useAuthStore } from "@/stores/authStore";
import { TeamTable } from "./_components/TeamTable";
import { RolesGrid } from "./_components/RolesGrid";
import { InviteDialog } from "./_components/InviteDialog";
import { toStaffRoleName } from "./_components/role-name";

export default function TeamPage() {
  const staffRole = useAuthStore((s) => s.staffUser?.role);
  const canInvite = staffRole === "admin" || staffRole === "superadmin";
  const { data, loading, error, reload } = useAsync(getProfileDetails);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Platform super-admin accounts belong to the operator, not the clinic's team — only another super-admin sees them.
  const members = useMemo(
    () => (data ?? []).filter((m) => staffRole === "superadmin" || toStaffRoleName(m.role_name) !== "superadmin"),
    [data, staffRole],
  );
  const counts = useMemo(() => {
    const c = { clinical: 0, ops: 0, admin: 0 };
    for (const m of members) {
      const r = toStaffRoleName(m.role_name);
      if (r === "doctor" || r === "optometrist") c.clinical++;
      else if (r === "admin" || r === "superadmin") c.admin++;
      else c.ops++;
    }
    return c;
  }, [members]);

  return (
    <div className="font-sans text-[13px] text-ink">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-[18px]">
        <div>
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-mute">PEOPLE & PERMISSIONS</div>
          <h1 className="m-0 font-display text-[29px] font-semibold tracking-[-0.5px] text-ink">
            Team & roles
          </h1>
          <p className="m-0 mt-[7px] text-[12px] text-mute">
            Give every team member the right access for their responsibilities.
          </p>
        </div>
        {canInvite && (
          <Button
            onClick={() => setInviteOpen(true)}
            className="min-h-9 gap-2 rounded-[7px] border border-sage bg-sage px-3.5 text-[11px] font-semibold text-primary-foreground hover:border-sagehover hover:bg-sagehover"
          >
            <UserRoundPlus size={14} />
            Add team member
          </Button>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <OpsStat label="Team members" value={loading ? "…" : String(members.length)} foot="in this clinic" icon={Users} bg="bg-sage-soft" text="text-sage" />
        <OpsStat label="Clinical team" value={loading ? "…" : String(counts.clinical)} foot="doctors & optometrists" icon={Stethoscope} bg="bg-t-new-soft" text="text-t-new" />
        <OpsStat label="Operations" value={loading ? "…" : String(counts.ops)} foot="billing, inventory & lab" icon={Wrench} bg="bg-warn-soft" text="text-warn-ink" />
        <OpsStat label="Admin access" value={loading ? "…" : String(counts.admin)} foot="admins" icon={ShieldCheck} bg="bg-t-surg-soft" text="text-t-surg" />
      </div>

      <TeamTable members={members} loading={loading} error={error} onRetry={reload} />
      <RolesGrid />
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onCreated={reload} />
    </div>
  );
}
