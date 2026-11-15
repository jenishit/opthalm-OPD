"use client";

import React, { useMemo } from "react";
import { getPatient } from "@/services/patients-services";
import { getVisits } from "@/services/visits-services";
import type { Visit } from "@/schemas/visit-schema";
import { useAsync } from "@/lib/hooks/use-async";
import { formatAge } from "@/lib/age";
import { HistoryTimeline } from "./HistoryTimeline";
import { User, Phone, MapPin, Briefcase, Calendar, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

export function PatientProfile({ patientId }: { patientId: string }) {
  // Independent loads: a visits failure must never hide a patient that exists,
  // and a real error must not be reported as "not found".
  const patientQ = useAsync(() => getPatient(patientId));
  const visitsQ = useAsync(() => getVisits({ patient_id: patientId }));

  const patient = patientQ.data;
  const visits = useMemo(
    () =>
      [...(visitsQ.data ?? [])].sort((a, b) =>
        String(b.scheduled_at ?? b.visit_date ?? b.created_at ?? "").localeCompare(String(a.scheduled_at ?? a.visit_date ?? a.created_at ?? "")),
      ),
    [visitsQ.data],
  );

  if (patientQ.loading) {
    return <div role="status" className="p-8 text-center text-muted-foreground">Loading patient profile...</div>;
  }

  if (patientQ.error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-destructive">Couldn&apos;t load this patient: {patientQ.error}</p>
        <button type="button" onClick={patientQ.reload} className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold hover:border-sage">
          Retry
        </button>
      </div>
    );
  }

  // A genuine 404 only: the patient doesn't exist (or was removed).
  if (!patient) {
    return <div className="p-8 text-center text-destructive">Patient not found</div>;
  }

  return (
    <div className="grid grid-cols-1 items-start lg:grid-cols-3 gap-6">
      {/* Left Column: Demographics & Visits */}
      <div className="lg:col-span-1 flex flex-col gap-6">

        {/* Demographics Card */}
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-semibold">
                {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
              </div>
              <div>
                <h2 className="font-display text-xl font-medium text-foreground">{patient.first_name} {patient.last_name}</h2>
                <div className="text-muted-foreground text-sm">ID: {patient.id.slice(0, 8).toUpperCase()}…</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">{patient.phone}</div>
                  <div className="text-xs text-muted-foreground">Primary Contact</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">{formatAge(patient.date_of_birth, patient.age)} • {patient.sex}</div>
                  <div className="text-xs text-muted-foreground">DOB: {patient.date_of_birth || "Unknown"}</div>
                </div>
              </div>

              {patient.occupation && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{patient.occupation}</div>
                    <div className="text-xs text-muted-foreground">Occupation</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {[patient.address_street, patient.address_city, patient.address_state].filter(Boolean).join(", ") || "No address provided"}
                  </div>
                  <div className="text-xs text-muted-foreground">Address</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-muted/40 px-6 py-3 border-t border-border/60">
            <button className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
              Edit Patient Details
            </button>
          </div>
        </div>

        {/* Visits Card */}
        <div className="bg-card rounded-2xl border border-border/60 flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-border/60 flex justify-between items-center bg-muted/40 rounded-t-2xl">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Visit History
            </h3>
            <span className="bg-muted text-muted-foreground text-xs py-1 px-2.5 rounded-full font-medium">
              {visits.length}
            </span>
          </div>
          <div className="overflow-y-auto p-0 flex-1">
            {visitsQ.loading ? (
              <div role="status" className="p-6 text-center text-sm text-muted-foreground">Loading visits…</div>
            ) : visitsQ.error ? (
              <div role="alert" className="flex flex-col items-center gap-2 p-6 text-center text-sm text-destructive">
                Couldn&apos;t load visits: {visitsQ.error}
                <button type="button" onClick={visitsQ.reload} className="rounded-md border border-line px-3 py-1 text-xs font-semibold text-foreground hover:border-sage">Retry</button>
              </div>
            ) : visits.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No previous visits</div>
            ) : (
              <ul className="divide-y divide-border/60">
                {visits.map((visit) => (
                  <li key={visit.id} className="group hover:bg-muted/40 transition-colors">
                    <Link href={`/patients/${patientId}/visits/${visit.id}`} className="block p-4">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-foreground text-sm">
                          {new Date(visit.scheduled_at ?? visit.visit_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <VisitStatusBadge status={visit.status} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {visit.chief_complaint}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Dr. {visit.examined_by || "Unassigned"}</span>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* Right Column: History Timeline */}
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border/60 bg-muted/40 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Clinical History Timeline</h3>
        </div>
        <div className="p-6 flex flex-col min-h-0">
          <HistoryTimeline patientId={patientId} visits={visits} />
        </div>
      </div>
    </div>
  );
}

function VisitStatusBadge({ status }: { status: Visit["status"] }) {
  return (
    <span
      className="pill"
      style={{
        backgroundColor: `var(--status-${status}-bg)`,
        color: `var(--status-${status}-ink)`,
      }}
    >
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
    </span>
  );
}
