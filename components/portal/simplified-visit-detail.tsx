"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getVisit } from "@/lib/api/visits.mock";
import { getTreatments } from "@/lib/api/treatments";
import type { Visit } from "@/lib/schemas/visit.schema";
import type { Treatment, FollowUp } from "@/lib/schemas/treatment.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Calendar, Glasses, Activity } from "lucide-react";

interface SimplifiedVisitDetailProps {
  visitId: string;
}

export function SimplifiedVisitDetail({ visitId }: SimplifiedVisitDetailProps) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const visitData = await getVisit(visitId);
        if (visitData) {
          setVisit(visitData);
          const treatmentData = await getTreatments(visitId);
          // Assuming API returns { treatments, follow_up } or similar
          // Since our mock is simpler, let's assume it returns an array of treatments
          setTreatments(treatmentData as unknown as Treatment[]); // Simplification for mock
        }
      } catch (error) {
        console.error("Failed to fetch visit details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [visitId]);

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading visit details...</div>;
  }

  if (!visit) {
    return <div className="p-8 text-center text-destructive">Visit not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-4">
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
          Visit on {format(new Date(visit.visit_date), "MMMM d, yyyy")}
        </h2>
        <p className="text-muted-foreground mt-1">
          Examined by Dr. {visit.examined_by || "Doctor"}
        </p>
      </div>

      <div className={`grid gap-6 ${followUp ? "md:grid-cols-2" : ""}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Reason for Visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              {visit.chief_complaint || "Routine checkup"}
            </p>
          </CardContent>
        </Card>

        {followUp && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-clay" />
                Next Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-foreground">
                {format(new Date(followUp.follow_up_date), "MMMM d, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{followUp.reason}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-status-examining" />
            Prescribed Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {treatments.length > 0 ? (
            <ul className="space-y-4">
              {treatments.map((t, idx) => (
                <li key={idx} className="flex flex-col border-b border-border/40 last:border-0 pb-3 last:pb-0">
                  <span className="font-medium text-foreground">{t.medicine_id}</span>
                  <span className="text-sm text-muted-foreground">
                    Take {t.dosage}, {t.frequency} for {t.duration}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Route: {t.route}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">No medications prescribed during this visit.</p>
          )}
        </CardContent>
      </Card>

      {/* Note: In a real app we'd fetch the final refraction and show it nicely */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Glasses className="h-5 w-5 text-clay" />
            Glasses Prescription
          </CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground italic">
             Check your full Glasses History for detailed power measurements.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}

