"use client";

import { toast } from "sonner";
import { UserRoundPlus, Users, Stethoscope, Glasses, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { TeamTable } from "./_components/TeamTable";
import { RolesGrid } from "./_components/RolesGrid";

function StatCard({
  label,
  value,
  change,
  foot,
  icon: Icon,
  bg,
  text,
}: {
  label: string;
  value: string;
  change: string;
  foot: string;
  icon: React.ElementType;
  bg: string;
  text: string;
}) {
  return (
    <div className="min-w-0 rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] p-[17px_18px_15px] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="flex items-center justify-between gap-2.5 text-[11px] text-[#727a70]">
        <span>{label}</span>
        <span className={"grid size-[34px] shrink-0 place-items-center rounded-[9px] " + bg + " " + text}>
          <Icon size={16} />
        </span>
      </div>
      <div className="my-3 font-['Manrope',sans-serif] text-[27px] font-semibold tracking-[-1px] text-[#293a30]">{value}</div>
      <div className="flex flex-wrap items-center gap-[7px] text-[10px] text-[#9a9e95]">
        <span className="inline-flex items-center gap-px font-bold text-[#3b805e]">
          <ArrowUpRight size={13} />
          {change}
        </span>
        <span>{foot}</span>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="font-['DM_Sans',sans-serif] text-[13px] text-[#23342c]">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap"
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-[18px]">
        <div>
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-[#8d927f]">PEOPLE & PERMISSIONS</div>
          <h1 className="m-0 font-['Playfair_Display',serif] text-[29px] font-semibold tracking-[-0.5px] text-[#26392e]">
            Team & roles
          </h1>
          <p className="m-0 mt-[7px] text-[12px] text-[#82877e]">
            Give every team member the right access for their responsibilities.
          </p>
        </div>
        <Button
          onClick={() => toast.info("Invite team member")}
          className="min-h-9 gap-2 rounded-[7px] border border-[#214c3a] bg-[#214c3a] px-3.5 text-[11px] font-semibold text-white hover:border-[#173d2c] hover:bg-[#173d2c]"
        >
          <UserRoundPlus size={14} />
          Invite team member
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <StatCard label="Team members" value="12" change="2 invited" foot="awaiting acceptance" icon={Users} bg="bg-[#e9f0e8]" text="text-[#214c3a]" />
        <StatCard
          label="Clinical team"
          value="04"
          change="Active"
          foot="doctors & optometrists"
          icon={Stethoscope}
          bg="bg-[#e8f0f2]"
          text="text-[#557d8b]"
        />
        <StatCard
          label="Optical team"
          value="05"
          change="Active"
          foot="opticians & sales"
          icon={Glasses}
          bg="bg-[#f7efdf]"
          text="text-[#a47a35]"
        />
        <StatCard label="Admin access" value="03" change="Protected" foot="manager & admin" icon={ShieldCheck} bg="bg-[#f0edf6]" text="text-[#8477a3]" />
      </div>

      <TeamTable />
      <RolesGrid />
    </div>
  );
}
