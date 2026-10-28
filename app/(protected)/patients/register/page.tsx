"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PatientRegistrationForm } from "@/components/forms/PatientRegistrationForm";

export default function RegisterPatientPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link
          href="/staff/patients"
          aria-label="Back to patients"
          className="-ml-1.5 grid size-11 place-items-center rounded-md border border-line bg-card text-ink hover:border-sage transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="pt-3.5 text-sm text-muted-foreground">Create a patient record before their first clinical visit.</p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4 sm:p-6">
        <PatientRegistrationForm />
      </div>
    </div>
  );
}
