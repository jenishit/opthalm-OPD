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
            className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">Patient Profile</h1>
        </div>

        <Link
          href={`/staff/patients/${id}/visits/new`}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-organic-sm transition-all hover:-translate-y-0.5 hover:shadow-organic hover:bg-primary/90 focus:outline-none focus:ring-3 focus:ring-ring/50"
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
