"use client";

import React, { useEffect, useState } from "react";
import { getPatientHistories } from "@/services/history-services";
import { getConditions } from "@/services/catalog-services";
import type { PatientHistory } from "@/schemas/history-schema";
import type { Condition } from "@/schemas/catalog-schema";
import { Clock, Glasses, Pill, Stethoscope, FileText } from "lucide-react";

export function HistoryTimeline({ patientId }: { patientId: string }) {
  const [histories, setHistories] = useState<PatientHistory[]>([]);
  const [allConditions, setAllConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [histData, condData] = await Promise.all([
          getPatientHistories(patientId),
          getConditions(),
        ]);
        setHistories(histData);
        setAllConditions(condData);
      } catch (error) {
        console.error("Error fetching histories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading) {
    return <div className="text-center text-sm text-muted-foreground py-4">Loading history...</div>;
  }

  if (histories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
        <FileText className="mb-3" aria-hidden />
        <p>No clinical history recorded yet.</p>
        <p className="text-xs">History is created automatically during visits.</p>
      </div>
    );
  }

  const getConditionNames = (ids: string[]) => {
    return ids.map((id) => allConditions.find((c) => c.id === id)?.name || "Unknown").join(", ");
  };

  return (
    <div className="relative border-l-2 border-border ml-3 md:ml-4 space-y-8 pb-4">
      {histories.map((history, idx) => {
        const date = new Date(history.created_at!);
        const isLatest = idx === 0;

        return (
          <div key={history.id} className="relative pl-6 md:pl-8">
            {/* Timeline Dot */}
            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-card ${isLatest ? "bg-primary" : "bg-border"}`} />

            <div className="mb-1 flex items-center gap-2">
              <span className={`text-sm font-semibold ${isLatest ? "text-primary" : "text-foreground"}`}>
                {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isLatest && (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>

            <div className={`mt-3 rounded-2xl border p-4 text-sm ${isLatest ? "border-primary/20 bg-primary/5" : "border-border/60 bg-muted/40"}`}>

              {/* Conditions */}
              {history.condition_ids.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1">
                    <Stethoscope className="h-3.5 w-3.5" /> Known conditions
                  </div>
                  <div className="text-foreground font-medium">
                    {getConditionNames(history.condition_ids)}
                  </div>
                </div>
              )}

              {/* Medications */}
              {(history.systemic_medications || history.topical_medications) && (
                <div className="mb-3 border-t border-border/60 pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1">
                    <Pill className="h-3.5 w-3.5" /> Medications
                  </div>
                  {history.systemic_medications && (
                    <div className="text-foreground mb-1"><span className="text-muted-foreground">Systemic:</span> {history.systemic_medications}</div>
                  )}
                  {history.topical_medications && (
                    <div className="text-foreground"><span className="text-muted-foreground">Topical:</span> {history.topical_medications}</div>
                  )}
                </div>
              )}

              {/* Other Details */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border/60 pt-3">
                <div className="flex items-center gap-1.5 text-foreground">
                  <Glasses className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Spectacles:</span> {history.uses_spectacles ? "Yes" : "No"}
                </div>
                {history.notes && (
                  <div>
                    <span className="text-muted-foreground text-xs font-semibold block mb-1">Clinical notes</span>
                    <p className="text-foreground bg-card/70 p-2 rounded-xl border border-border/60">{history.notes}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
