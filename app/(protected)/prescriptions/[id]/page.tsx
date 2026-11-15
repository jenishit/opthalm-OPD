"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { OpsNotice } from "@/components/ui/OpsStat";
import { usePrescriptions } from "../_components/usePrescriptions";
import { PrescriptionEditor } from "./_components/PrescriptionEditor";

export default function PrescriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";
  const { list, loading, error, reload } = usePrescriptions();
  const existing = list.find((p) => p.id === params.id);

  if (!isNew && !existing) {
    if (loading) return <OpsNotice kind="loading" text="Loading prescription…" />;
    if (error) return <OpsNotice kind="error" text={error} onRetry={reload} />;
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-muted-foreground">Prescription not found.</p>
        <Button variant="secondary" onClick={() => router.push("/prescriptions")}>
          <ArrowLeft className="size-4" />
          Back to prescriptions
        </Button>
      </div>
    );
  }

  // Keyed so the form state is rebuilt for each record.
  return <PrescriptionEditor key={existing?.id ?? "new"} existing={existing} isNew={isNew} id={params.id} />;
}
