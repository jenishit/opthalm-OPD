import { PatientListTable } from "@/components/staff/patient-list-table";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex h-11 items-center justify-end">
        <Link
          href="/staff/patients/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <UserPlus className="h-4 w-4" />
          Register Patient
        </Link>
      </div>

      <div className="flex-1 rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
        <PatientListTable />
      </div>
    </div>
  );
}
