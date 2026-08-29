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
          className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">New Clinical Visit</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-2xl border border-border/60 shadow-organic-sm overflow-hidden flex flex-col">
        <IntakeExamForm patientId={id} />
      </div>
    </div>
  );
}
