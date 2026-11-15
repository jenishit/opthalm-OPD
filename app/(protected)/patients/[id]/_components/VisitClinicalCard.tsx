"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getFullVisitData } from "@/services/visits-services";
import { useAsync } from "@/lib/hooks/use-async";
import type { Visit } from "@/schemas/visit-schema";

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const fmt = (v: number | undefined, plus = true) => (v == null ? "—" : `${plus && v > 0 ? "+" : ""}${v.toFixed(2)}`);

function whenOf(v: Visit): Date | null {
  const raw = v.scheduled_at ?? v.visit_date ?? v.created_at;
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

/** One visit on the clinical timeline: loads that visit's recorded chart and summarises it. */
export function VisitClinicalCard({ visit, patientId, latest }: { visit: Visit; patientId: string; latest: boolean }) {
  const q = useAsync(() => getFullVisitData(visit.id));
  const d = q.data;
  const date = whenOf(visit);

  const hasAny =
    !!d &&
    (d.readings.length > 0 ||
      d.diagnoses.length > 0 ||
      d.investigations.length > 0 ||
      !!d.followUp ||
      !!d.examination?.notes ||
      !!d.examination?.iop_od ||
      !!d.examination?.iop_os ||
      !!d.examination?.anterior_segment_od ||
      !!d.examination?.anterior_segment_os ||
      !!d.examination?.fundus_od ||
      !!d.examination?.fundus_os);

  const eyes = (["OD", "OS"] as const).map((eye) => ({
    eye,
    unaided: d?.readings.find((r) => r.eye === eye && r.stage === "unaided"),
    rx: d?.readings.find((r) => r.eye === eye && r.stage === "final_rx"),
    iop: eye === "OD" ? d?.examination?.iop_od : d?.examination?.iop_os,
    ant: eye === "OD" ? d?.examination?.anterior_segment_od : d?.examination?.anterior_segment_os,
    fundus: eye === "OD" ? d?.examination?.fundus_od : d?.examination?.fundus_os,
  }));

  return (
    <div className="relative pl-6 md:pl-8">
      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-card ${latest ? "bg-primary" : "bg-border"}`} />
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className={`text-sm font-semibold ${latest ? "text-primary" : "text-foreground"}`}>
          {date ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Date unknown"}
        </span>
        <span className="text-xs capitalize text-muted-foreground">{visit.status}</span>
        {visit.chief_complaint && <span className="text-xs text-muted-foreground">· {visit.chief_complaint}</span>}
        <Link href={`/patients/${patientId}/visits/${visit.id}`} className="ml-auto inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline">
          Full visit <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className={`mt-2 rounded-2xl border p-4 text-sm ${latest ? "border-primary/20 bg-primary/5" : "border-border/60 bg-muted/40"}`}>
        {q.loading ? (
          <p className="text-muted-foreground">Loading examination…</p>
        ) : q.error ? (
          <p className="text-destructive">
            Couldn&apos;t load this visit&apos;s record: {q.error}{" "}
            <button type="button" onClick={q.reload} className="font-semibold underline">Retry</button>
          </p>
        ) : !hasAny ? (
          <p className="text-muted-foreground">No examination recorded for this visit yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {eyes.map((e) => (
                <div key={e.eye} className="rounded-xl border border-border/60 bg-card/70 p-3">
                  <div className="mb-1 font-semibold text-foreground">{e.eye === "OD" ? "Right eye (OD)" : "Left eye (OS)"}</div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                    {e.unaided?.va && (<><dt className="text-muted-foreground">Unaided VA</dt><dd>{e.unaided.va}</dd></>)}
                    {e.rx && (
                      <>
                        <dt className="text-muted-foreground">Final Rx</dt>
                        <dd>
                          {fmt(e.rx.sphere)} / {fmt(e.rx.cylinder)} × {e.rx.axis ?? "—"}
                          {e.rx.add_power != null ? ` · add ${fmt(e.rx.add_power)}` : ""}
                          {e.rx.va ? ` · VA ${e.rx.va}` : ""}
                        </dd>
                      </>
                    )}
                    {e.iop != null && (<><dt className="text-muted-foreground">IOP</dt><dd>{e.iop} mmHg</dd></>)}
                    {e.ant && (<><dt className="text-muted-foreground">Anterior</dt><dd className="break-words">{e.ant}</dd></>)}
                    {e.fundus && (<><dt className="text-muted-foreground">Fundus</dt><dd className="break-words">{e.fundus}</dd></>)}
                  </dl>
                </div>
              ))}
            </div>

            {d && d.diagnoses.length > 0 && (
              <div>
                <div className={LABEL}>Findings / diagnoses</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {d.diagnoses.map((x, i) => (
                    <span key={x.id ?? i} className="rounded-full bg-card px-2.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-border">
                      {x.diagnosis_name ?? x.diagnosis_id}
                      {x.laterality ? ` · ${x.laterality}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {d && d.investigations.length > 0 && (
              <div>
                <div className={LABEL}>Investigations &amp; notes</div>
                <ul className="mt-1 space-y-0.5">
                  {d.investigations.map((x, i) => (
                    <li key={x.id ?? i} className="text-foreground">
                      <span className="text-muted-foreground">{x.eye ? `${x.eye} · ` : ""}</span>
                      {[x.result, x.notes].filter(Boolean).join(" — ") || x.type}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {d?.examination?.notes && (
              <div>
                <div className={LABEL}>Examiner notes</div>
                <p className="whitespace-pre-wrap text-foreground">{d.examination.notes}</p>
              </div>
            )}

            {d?.followUp && (
              <div>
                <div className={LABEL}>Follow-up</div>
                <p className="text-foreground">
                  {new Date(d.followUp.follow_up_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {d.followUp.reason ? ` — ${d.followUp.reason}` : ""}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
