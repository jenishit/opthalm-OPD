import { PatientRegistrationForm } from "@/components/forms/patient-registration-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPatientPage() {
  return (
    <div className="flex h-full flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/staff/patients"
          className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">Register New Patient</h1>
      </div>

      <div className="bg-card rounded-2xl border border-border/60 shadow-organic-sm p-6">
        <PatientRegistrationForm />
      </div>
    </div>
  );
}
