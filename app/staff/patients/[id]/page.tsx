import { PatientProfile } from "@/components/staff/patient-profile";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  // Normally, this would be an async component fetching data on the server,
  // but since we are mocking, the client component handles the data fetching.
  const { id } = await params;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/staff/patients"
            className="p-0 -ml-0.5 grid size-11 place-items-center rounded-md border border-line bg-card text-ink hover:border-sage"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <Link
          href={`/staff/patients/${id}/visits/new`}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Plus className="h-4 w-4" />
          New Visit
        </Link>
      </div>

      <div className="flex-1">
        <PatientProfile patientId={id} />
      </div>
    </div>
  );
}
