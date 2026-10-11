import { PatientRegistrationForm } from "@/components/forms/patient-registration-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPatientPage() {
  return (
    <div className="flex h-full flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/staff/patients"
          className="p-0 -ml-0.5 grid size-11 place-items-center rounded-md border border-line bg-card text-ink hover:border-sage"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border/60 p-6">
        <PatientRegistrationForm />
      </div>
    </div>
  );
}
