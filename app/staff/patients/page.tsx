import { PatientListTable } from "@/components/staff/patient-list-table";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">Patients</h1>

        <Link
          href="/staff/patients/new"
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-organic-sm transition-all hover:-translate-y-0.5 hover:shadow-organic hover:bg-primary/90 focus:outline-none focus:ring-3 focus:ring-ring/50"
        >
          <UserPlus className="h-4 w-4" />
          Register Patient
        </Link>
      </div>

      <div className="flex-1 rounded-2xl border border-border/60 bg-card shadow-organic-sm overflow-hidden flex flex-col">
        <PatientListTable />
      </div>
    </div>
  );
}
