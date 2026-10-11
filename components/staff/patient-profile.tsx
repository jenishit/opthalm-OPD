"use client";

import React, { useEffect, useState } from "react";
import { getPatient } from "@/lib/api/patients";
import { getVisits } from "@/lib/api/visits";
import type { Patient } from "@/lib/schemas/patient.schema";
import type { Visit } from "@/lib/schemas/visit.schema";
import { HistoryTimeline } from "./history-timeline";
import { User, Phone, MapPin, Briefcase, Calendar, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

export function PatientProfile({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const [patientData, visitsData] = await Promise.all([
          getPatient(patientId),
          getVisits({ patient_id: patientId }),
        ]);
        setPatient(patientData);
        // Sort visits descending
        setVisits(visitsData.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()));
      } catch (error) {
        console.error("Error fetching patient", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading patient profile...</div>;
  }

  if (!patient) {
    return <div className="p-8 text-center text-destructive">Patient not found</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
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
                <div className="text-muted-foreground text-sm">ID: {patient.id}</div>
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
                  <div className="text-sm font-medium text-foreground">{patient.age} years • {patient.sex}</div>
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
            {visits.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No previous visits</div>
            ) : (
              <ul className="divide-y divide-border/60">
                {visits.map((visit) => (
                  <li key={visit.id} className="group hover:bg-muted/40 transition-colors">
                    <Link href={`/staff/patients/${patientId}/visits/${visit.id}`} className="block p-4">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-foreground text-sm">
                          {new Date(visit.visit_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 shadow-organic-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border/60 bg-muted/40 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Clinical History Timeline</h3>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <HistoryTimeline patientId={patientId} />
        </div>
      </div>
    </div>
  );
}

function VisitStatusBadge({ status }: { status: Visit["status"] }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
      style={{
        backgroundColor: `var(--status-${status}-bg)`,
        color: `var(--status-${status})`,
      }}
    >
      {status}
    </span>
  );
}
