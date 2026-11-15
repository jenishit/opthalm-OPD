"use client";

import React, { use, useEffect, useState } from "react";
import { getFullVisitData, type FullVisitData } from "@/services/visits-services";
import { getPatient } from "@/services/patients-services";
import type { Patient } from "@/schemas/patient-schema";
import { VisitDetailView } from "@/app/(protected)/patients/[id]/visits/[visitId]/_components/VisitDetailView";
import { PrescriptionPrint } from "@/app/(protected)/patients/[id]/visits/[visitId]/_components/PrescriptionPrint";
import { rxNumberFor } from "@/services/prescriptions-services";
import { loadSellerInfo, type SellerInfo } from "@/lib/pos/seller";
import { ApiError } from "@/services/http";
import { useAuthStore } from "@/stores/authStore";
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [clinic, setClinic] = useState<SellerInfo | null>(null);

  const { staffUser } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [pData, vData] = await Promise.all([
          getPatient(id),
          getFullVisitData(visitId),
        ]);
        setPatient(pData);
        setVisitData(vData);
      } catch (error) {
        console.error("Error fetching visit details", error);
        setLoadError(error instanceof ApiError ? error.message : "Something went wrong while loading this visit.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, visitId, reloadKey]);

  // Clinic letterhead for the printout (admin-only endpoint; falls back to the copy cached on this device).
  useEffect(() => {
    void loadSellerInfo().then((r) => setClinic(r.info));
  }, []);

  // Print the real page via the print stylesheet — the screen content hides itself
  // (print:hidden) and only the prescription remains.
  const handlePrint = () => window.print();

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading visit details...
      </div>
    );
  if (loadError)
    return (
      <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-destructive">Couldn&apos;t load this visit: {loadError}</p>
        <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold hover:border-sage">
          Retry
        </button>
      </div>
    );
  if (!patient || !visitData)
    return (
      <div className="p-8 text-center text-destructive">
        Visit or patient not found
      </div>
    );

  return (
    <div className="relative flex flex-col gap-6">
      <div className="flex flex-col gap-6 print:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/patients/${patient.id}`}
            className="p-0 -ml-0.5 grid size-11 place-items-center rounded-md border border-line bg-card text-ink hover:border-sage"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {patient.first_name} {patient.last_name} • ID:{" "}
              {patient.id.slice(0, 8).toUpperCase()}…
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {visitData.visit.status === "completed" && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-md border border-line bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-sage focus:outline-none transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Rx
            </button>
          )}
          <Link
            href={`/patients/${patient.id}/visits/${visitData.visit.id}/edit`}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <Edit className="h-4 w-4" />
            Edit Visit
          </Link>
        </div>
      </div>

      <div>
        <VisitDetailView visitData={visitData} />
      </div>
      </div>

      {/* Print-only prescription */}
      <div className="hidden print:block">
        <PrescriptionPrint
          prescription={{
            id: visitData.visit.id,
            visit_id: visitData.visit.id,
            patient_id: patient.id,
            prescription_number: rxNumberFor(visitData.visit.id, String(visitData.visit.visit_date).slice(0, 10)),
            type: "combined",
            signed_by: visitData.visit.examined_by ?? staffUser?.name ?? "Doctor",
            issued_at: String(visitData.visit.visit_date),
          }}
          visitData={visitData}
          patient={patient}
          clinic={clinic}
        />
      </div>
    </div>
  );
}
