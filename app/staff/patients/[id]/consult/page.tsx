import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IntakeExamForm } from "@/components/forms/intake-exam-form";

export default async function ConsultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = await params;
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/staff/patients/${patientId}`}
          aria-label="Back to patient record"
          className="-ml-1.5 grid size-11 place-items-center rounded-md border border-line bg-card text-ink hover:border-sage transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">
            Clinical examination and visit record
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-card">
        <IntakeExamForm patientId={patientId} />
      </div>
    </div>
  );
}
