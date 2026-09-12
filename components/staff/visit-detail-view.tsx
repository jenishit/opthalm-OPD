"use client";

import React from "react";
import type { FullVisitData } from "@/lib/api/visits";

export function VisitDetailView({ visitData }: { visitData: FullVisitData }) {
  const { visit, symptoms, readings, examination, diagnoses, treatments, followUp } = visitData;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderSymptom = (label: string, val?: string | boolean) => {
    if (!val || val === "none") return null;
    return (
      <div className="flex justify-between py-1 border-b border-border/40 last:border-0">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className="font-medium text-foreground text-sm">{val === true ? "Yes" : val}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-muted/40 flex justify-between items-center">
          <h3 className="font-medium text-foreground">Visit Overview</h3>
          <span className="text-sm font-medium bg-muted text-muted-foreground py-1 px-3 rounded-full">
            {formatDate(visit.visit_date)}
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Chief Complaint</h4>
            <p className="text-foreground font-medium">{visit.chief_complaint}</p>
            {visit.complaint_duration && <p className="text-sm text-muted-foreground mt-1">Duration: {visit.complaint_duration}</p>}
          </div>
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Examined By</h4>
            <p className="text-foreground font-medium">{visit.examined_by ? `Dr. ${visit.examined_by}` : "Not assigned"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Symptoms */}
        {symptoms && (
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/40">
              <h3 className="font-medium text-foreground text-sm">Reported Symptoms</h3>
            </div>
            <div className="p-4">
              <div className="space-y-1">
                {renderSymptom("Foreign Body Sensation", symptoms.foreign_body_sensation)}
                {renderSymptom("Redness", symptoms.redness)}
                {renderSymptom("Swelling", symptoms.swelling)}
                {renderSymptom("Diminished Distance Vision", symptoms.diminished_distance_vision)}
                {renderSymptom("Diminished Near Vision", symptoms.diminished_near_vision)}
                {renderSymptom("Blurring", symptoms.blurring)}
                {renderSymptom("Headache", symptoms.headache)}
                {renderSymptom("Eye Pain", symptoms.eye_pain)}
                {renderSymptom("Watery Eyes", symptoms.watery_eyes)}
                {renderSymptom("Discharge", symptoms.discharge)}
                {renderSymptom("Itching", symptoms.itching)}
                {renderSymptom("Photophobia", symptoms.photophobia)}
                {renderSymptom("Floaters", symptoms.floaters)}
                {renderSymptom("Flashes", symptoms.flashes)}
                {renderSymptom("Double Vision", symptoms.double_vision)}
                {renderSymptom("Recent Fever", symptoms.recent_fever)}
              </div>
            </div>
          </div>
        )}

        {/* Examination */}
        {examination && (
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/40">
              <h3 className="font-medium text-foreground text-sm">Examination Findings</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-4">
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">IOP OD</span>
                  <span className="font-medium text-foreground">{examination.iop_od || "-"} mmHg</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">IOP OS</span>
                  <span className="font-medium text-foreground">{examination.iop_os || "-"} mmHg</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b border-border/40 pb-4">
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Convergence</span>
                  <span className="font-medium text-sm text-foreground">{examination.convergence || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Cover Test</span>
                  <span className="font-medium text-sm text-foreground">{examination.cover_test || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">EOM</span>
                  <span className="font-medium text-sm text-foreground">{examination.eom || "-"}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="block text-xs font-semibold text-primary uppercase mb-1">Anterior Segment</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/40 p-2 rounded-xl border border-border/40"><span className="font-medium mr-2 text-foreground">OD:</span><span className="text-muted-foreground">{examination.anterior_segment_od || "-"}</span></div>
                    <div className="bg-muted/40 p-2 rounded-xl border border-border/40"><span className="font-medium mr-2 text-foreground">OS:</span><span className="text-muted-foreground">{examination.anterior_segment_os || "-"}</span></div>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-primary uppercase mb-1">Fundus</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/40 p-2 rounded-xl border border-border/40"><span className="font-medium mr-2 text-foreground">OD:</span><span className="text-muted-foreground">{examination.fundus_od || "-"}</span></div>
                    <div className="bg-muted/40 p-2 rounded-xl border border-border/40"><span className="font-medium mr-2 text-foreground">OS:</span><span className="text-muted-foreground">{examination.fundus_os || "-"}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Refraction */}
      {readings && readings.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/60 shadow-organic-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 bg-muted/40">
            <h3 className="font-medium text-foreground text-sm">Vision & Refraction</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-card border-b border-border/60">
                  <th className="p-3 font-semibold text-muted-foreground">Stage</th>
                  <th className="p-3 font-semibold text-muted-foreground">Eye</th>
                  <th className="p-3 font-semibold text-muted-foreground">Sph</th>
                  <th className="p-3 font-semibold text-muted-foreground">Cyl</th>
                  <th className="p-3 font-semibold text-muted-foreground">Axis</th>
                  <th className="p-3 font-semibold text-muted-foreground">Add</th>
                  <th className="p-3 font-semibold text-muted-foreground">V/A</th>
                  <th className="p-3 font-semibold text-muted-foreground">PD / Lens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {readings.map((r) => (
                  <tr key={r.id} className={r.stage === "final_rx" ? "bg-primary/5 font-medium" : "bg-card"}>
                    <td className="p-3 capitalize text-foreground">{r.stage.replace("_", " ")}</td>
                    <td className={`p-3 font-bold ${r.eye === "OD" ? "text-status-examining" : "text-status-completed"}`}>{r.eye}</td>
                    <td className="p-3 text-foreground">{r.sphere ?? "-"}</td>
                    <td className="p-3 text-foreground">{r.cylinder ?? "-"}</td>
                    <td className="p-3 text-foreground">{r.axis ?? "-"}</td>
                    <td className="p-3 text-foreground">{r.add_power ?? "-"}</td>
                    <td className="p-3 text-foreground">{r.va ?? "-"}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {r.pd && `PD: ${r.pd} `}
                      {r.lens_type && `| ${r.lens_type.replace("_", " ")}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diagnosis & Treatments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Diagnoses */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-organic-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 bg-muted/40">
            <h3 className="font-medium text-foreground text-sm">Diagnoses</h3>
          </div>
          <div className="p-4">
            {diagnoses && diagnoses.length > 0 ? (
              <ul className="space-y-3">
                {diagnoses.map((d) => (
                  <li key={d.id} className="flex flex-col p-3 rounded-xl bg-muted/40 border border-border/40">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-foreground">{d.diagnosis_name}</span>
                      <span className="bg-card border border-border/60 text-muted-foreground px-2 py-0.5 rounded-full text-xs font-bold">{d.laterality}</span>
                    </div>
                    {d.icd10_code && <span className="text-xs text-muted-foreground mt-1">ICD-10: {d.icd10_code}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No diagnoses recorded</p>
            )}
          </div>
        </div>

        {/* Treatments & Follow Up */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-organic-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border/60 bg-muted/40">
            <h3 className="font-medium text-foreground text-sm">Treatment Plan</h3>
          </div>
          <div className="p-4 flex-1">
            {treatments && treatments.length > 0 ? (
              <ul className="space-y-4">
                {treatments.map((t) => (
                  <li key={t.id} className="border-l-2 border-primary pl-3 py-1">
                    {t.type === "medicine" ? (
                      <div>
                        <div className="font-medium text-foreground">{t.medicine_name}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {t.dosage} • {t.frequency} • {t.route}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 bg-muted inline-block px-2 py-0.5 rounded-full">Duration: {t.duration}</div>
                      </div>
                    ) : t.type === "procedure" ? (
                      <div>
                        <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1 block">Procedure</span>
                        <div className="font-medium text-foreground">{t.procedure_name}</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-status-examining uppercase tracking-wider mb-1 block">Advice</span>
                        <div className="text-sm text-foreground whitespace-pre-wrap">{t.advice_text}</div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-4">No treatments recorded</p>
            )}

            {followUp && (
              <div className="mt-6 pt-4 border-t border-border/60">
                <div className="flex justify-between items-center bg-accent/10 p-3 rounded-xl border border-accent/20">
                  <div>
                    <span className="block text-xs font-bold text-accent uppercase mb-1">Next Follow-up</span>
                    <span className="font-semibold text-foreground">{formatDate(followUp.follow_up_date)}</span>
                  </div>
                  {followUp.reason && (
                    <div className="text-right max-w-[50%]">
                      <span className="block text-xs font-medium text-muted-foreground mb-1">Reason</span>
                      <span className="text-sm text-foreground truncate block">{followUp.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
