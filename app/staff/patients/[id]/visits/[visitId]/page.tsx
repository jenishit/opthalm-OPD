"use client";

import React, { use, useEffect, useState, useRef } from "react";
import { getFullVisitData, type FullVisitData } from "@/lib/api/visits";
import { getPatient } from "@/lib/api/patients";
import type { Patient } from "@/lib/schemas/patient.schema";
import { VisitDetailView } from "@/components/staff/visit-detail-view";
import { PrescriptionPrint } from "@/components/staff/prescription-print";
import { createPrescription } from "@/lib/api/prescriptions";
import { useAuthStore } from "@/lib/store/auth-store";
import Link from "next/link";
import { ArrowLeft, Printer, Edit } from "lucide-react";

export default function VisitPage({
  params,
}: {
  params: Promise<{ id: string; visitId: string }>;
}) {
  const { id, visitId } = use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visitData, setVisitData] = useState<FullVisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const { staffUser } = useAuthStore();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pData, vData] = await Promise.all([
          getPatient(id),
          getFullVisitData(visitId),
        ]);
        setPatient(pData);
        setVisitData(vData);
      } catch (error) {
        console.error("Error fetching visit details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, visitId]);

  const handlePrint = async () => {
    if (!visitData || !patient || !staffUser) return;

    setIsPrinting(true);
    try {
      // 1. Create a prescription record in the backend (mock)
      // Determine type based on data
      const hasFinalRx = visitData.readings.some(r => r.stage === "final_rx");
      const hasMeds = visitData.treatments.some(t => t.type === "medicine");

      let rxType: "spectacle" | "medication" | "combined" = "combined";
      if (hasFinalRx && !hasMeds) rxType = "spectacle";
      else if (!hasFinalRx && hasMeds) rxType = "medication";

      const rx = await createPrescription(visitData.visit.id, patient.id, rxType, staffUser.name);

      // 2. Attach prescription metadata to state if we were showing it dynamically,
      // but for simplicity we'll just trigger the browser print dialogue.
      // In a real app, we might use react-to-print library here.

      // Temporary hack for mock printing:
      const printContents = printRef.current?.innerHTML;
      if (printContents) {
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        // Need to reload window to restore React listeners after innerHTML replacement
        window.location.reload();
      }

    } catch (error) {
      console.error("Print failed", error);
    } finally {
      setIsPrinting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading visit details...</div>;
  if (!patient || !visitData) return <div className="p-8 text-center text-destructive">Visit or patient not found</div>;

  return (
    <div className="flex h-full flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/staff/patients/${patient.id}`}
            className="p-0 -ml-0.5 grid size-11 place-items-center rounded-md border border-line bg-card text-ink hover:border-sage"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {patient.first_name} {patient.last_name} • ID: {patient.id}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {visitData.visit.status === "completed" && (
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 rounded-md border border-line bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-sage focus:outline-none transition-colors"
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? "Generating..." : "Print Rx"}
            </button>
          )}
          <Link
            href={`/staff/patients/${patient.id}/visits/${visitData.visit.id}/edit`}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-organic-sm transition-all hover:-translate-y-0.5 hover:shadow-organic hover:bg-primary/90 focus:outline-none focus:ring-3 focus:ring-ring/50"
          >
            <Edit className="h-4 w-4" />
            Edit Visit
          </Link>
        </div>
      </div>

      <div className="flex-1">
        <VisitDetailView visitData={visitData} />
      </div>

      {/* Hidden print container */}
      <div className="hidden">
        <div ref={printRef}>
          <PrescriptionPrint
            prescription={{
              id: "temp",
              visit_id: visitData.visit.id,
              patient_id: patient.id,
              prescription_number: "PREVIEW",
              type: "combined",
              signed_by: staffUser?.name || "Doctor",
              issued_at: new Date().toISOString()
            }}
            visitData={visitData}
            patient={patient}
          />
        </div>
      </div>
    </div>
  );
}
