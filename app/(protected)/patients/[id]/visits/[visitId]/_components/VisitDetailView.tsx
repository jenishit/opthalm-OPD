"use client";

import React from "react";
import type { FullVisitData } from "@/services/visits-services";
import { VisitCharts } from "./VisitCharts";

export function VisitDetailView({ visitData }: { visitData: FullVisitData }) {
  const { visit, symptoms, readings, examination, diagnoses, treatments, followUp } = visitData;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
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
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Chief Complaint</h4>
            <p className="text-foreground font-medium">{visit.chief_complaint}</p>
            {visit.complaint_duration && <p className="text-sm text-muted-foreground mt-1">Duration: {visit.complaint_duration}</p>}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Examined By</h4>
            <p className="text-foreground font-medium">{visit.examined_by ? `Dr. ${visit.examined_by}` : "Not assigned"}</p>
          </div>
        </div>
      </div>

      <VisitCharts data={visitData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Symptoms */}
        <SymptomsCard symptoms={symptoms} />

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
                  <span className="block text-xs font-semibold text-primary mb-1">Anterior Segment</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/40 p-2 rounded-xl border border-border/40"><span className="font-medium mr-2 text-foreground">OD:</span><span className="text-muted-foreground">{examination.anterior_segment_od || "-"}</span></div>
                    <div className="bg-muted/40 p-2 rounded-xl border border-border/40"><span className="font-medium mr-2 text-foreground">OS:</span><span className="text-muted-foreground">{examination.anterior_segment_os || "-"}</span></div>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-primary mb-1">Fundus</span>
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
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
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
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
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
              <p className="text-sm text-muted-foreground">No diagnoses recorded</p>
            )}
          </div>
        </div>

        {/* Treatments & Follow Up */}
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden flex flex-col">
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
                        <span className="text-xs font-semibold text-clay-ink mb-1 block">Procedure</span>
                        <div className="font-medium text-foreground">{t.procedure_name}</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-semibold text-status-examining-ink mb-1 block">Advice</span>
                        <div className="text-sm text-foreground whitespace-pre-wrap">{t.advice_text}</div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">No treatments recorded</p>
            )}

            {followUp && (
              <div className="mt-6 pt-4 border-t border-border/60">
                <div className="flex justify-between items-center bg-clay-soft p-3 rounded-xl border border-clay/20">
                  <div>
                    <span className="block text-xs font-semibold text-clay-ink mb-1">Next follow-up</span>
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

const SYMPTOM_LABELS: Array<[keyof NonNullable<FullVisitData["symptoms"]>, string]> = [
  ["foreign_body_sensation", "Foreign body sensation"],
  ["redness", "Redness"],
  ["swelling", "Swelling"],
  ["diminished_distance_vision", "Diminished distance vision"],
  ["diminished_near_vision", "Diminished near vision"],
  ["blurring", "Blurring"],
  ["headache", "Headache"],
  ["eye_pain", "Eye pain"],
  ["watery_eyes", "Watery eyes"],
  ["discharge", "Discharge"],
  ["itching", "Itching"],
  ["photophobia", "Photophobia"],
  ["floaters", "Floaters"],
  ["flashes", "Flashes"],
  ["double_vision", "Double vision"],
];

const EYE_TONE: Record<string, string> = {
  OD: "bg-sage-soft text-sage",
  OS: "bg-clay-soft text-clay",
  OU: "bg-warn-soft text-warn-ink",
};

/** Reported symptoms as chips tagged with the affected eye; says so plainly when none were recorded. */
function SymptomsCard({ symptoms }: { symptoms: FullVisitData["symptoms"] }) {
  const present = symptoms
    ? SYMPTOM_LABELS.map(([key, label]) => ({ label, eye: String(symptoms[key] ?? "none") })).filter((s) => s.eye !== "none")
    : [];
  const fever = symptoms?.recent_fever === true;
  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center justify-between">
        <h3 className="font-medium text-foreground text-sm">Reported Symptoms</h3>
        {present.length > 0 && <span className="text-xs text-muted-foreground">{present.length} reported</span>}
      </div>
      <div className="p-4">
        {present.length === 0 && !fever ? (
          <p className="text-sm text-muted-foreground">
            {symptoms ? "No symptoms were reported for this visit." : "Symptoms weren't recorded for this visit."}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {present.map((s) => (
              <li key={s.label} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 py-1 pl-3 pr-1 text-sm text-foreground">
                {s.label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${EYE_TONE[s.eye] ?? "bg-muted text-muted-foreground"}`}>{s.eye}</span>
              </li>
            ))}
            {fever && (
              <li className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-sm text-foreground">Recent fever</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
