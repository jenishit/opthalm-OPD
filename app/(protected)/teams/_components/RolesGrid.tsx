import { Eye, Glasses, CalendarDays, ShieldCheck, Check } from "lucide-react";

const ROLES = [
  {
    name: "Doctor / Optometrist",
    icon: Eye,
    desc: "Patient records, examinations, diagnoses, prescriptions",
    perms: "Clinical access",
  },
  {
    name: "Optician",
    icon: Glasses,
    desc: "Prescriptions, frame selection, optical orders, POS",
    perms: "Optical access",
  },
  {
    name: "Clinic staff",
    icon: CalendarDays,
    desc: "Appointments, patient check-in, basic patient details",
    perms: "Front desk access",
  },
  {
    name: "Practice manager",
    icon: ShieldCheck,
    desc: "Reports, inventory, suppliers, staff and settings",
    perms: "Management access",
  },
];

export function RolesGrid() {
  return (
    <div className="mt-[17px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 lg:grid-cols-4">
      {ROLES.map((r) => (
        <div
          key={r.name}
          className="rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] p-[18px] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]"
        >
          <span className="grid size-[34px] place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
            <r.icon size={19} />
          </span>
          <h3 className="mb-[7px] mt-[14px] font-['Playfair_Display',serif] text-[15px] font-semibold text-[#23342c]">{r.name}</h3>
          <p className="min-h-[48px] text-[10px] leading-[1.6] text-[#858d81]">{r.desc}</p>
          <span className="flex items-center gap-[5px] text-[9px] font-bold text-[#477451]">
            <Check size={13} />
            {r.perms}
          </span>
        </div>
      ))}
    </div>
  );
}
