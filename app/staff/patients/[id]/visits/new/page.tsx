import { IntakeExamForm } from "@/components/forms/intake-exam-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link
          href={`/staff/patients/${id}`}
          className="p-0 -ml-0.5 grid size-11 place-items-center rounded-md border border-line bg-card text-ink hover:border-sage"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-md border border-border/60 overflow-hidden flex flex-col">
        <IntakeExamForm patientId={id} />
      </div>
    </div>
  );
}
