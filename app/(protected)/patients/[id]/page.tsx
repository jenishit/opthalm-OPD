import { PatientProfile } from "@/app/(protected)/patients/[id]/_components/PatientProfile";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/patients"
        className="-mt-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={16} /> All patients
      </Link>
      <PatientProfile patientId={id} />
    </div>
  );
}
