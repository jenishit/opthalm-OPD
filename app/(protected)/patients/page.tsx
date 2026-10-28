import { PatientListTable } from "@/app/(protected)/patients/_components/PatientListTable";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-11 items-center justify-end">
        <Link
          href="/staff/patients/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <UserPlus className="h-4 w-4" />
          Register Patient
        </Link>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
        <PatientListTable />
      </div>
    </div>
  );
}
