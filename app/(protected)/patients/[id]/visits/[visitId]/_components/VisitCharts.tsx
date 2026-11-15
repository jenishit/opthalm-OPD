"use client";

import { useMemo } from "react";
import type { FullVisitData } from "@/services/visits-services";
import { examFromVisit } from "@/app/(protected)/examinations/_components/examFromVisit";
import { SlitDiagram } from "@/app/(protected)/examinations/_components/SlitDiagram";
import { FundusDiagram } from "@/app/(protected)/examinations/_components/FundusDiagram";
import { AnatomyEye } from "@/app/(protected)/examinations/_components/AnatomyEye";
import { ANAT } from "@/types/eye-types";
import { cn } from "@/lib/utils";

const EYES = [
  { k: "od", label: "Right eye (OD)", wire: "OD" },
  { k: "os", label: "Left eye (OS)", wire: "OS" },
] as const;

const CARD = "overflow-hidden rounded-2xl border border-border/60 bg-card";
const HEAD = "border-b border-border/60 bg-muted/40 px-4 py-3 text-sm font-medium text-foreground";

/** Snellen 6/x as a decimal acuity (6/6 = 1.0, 6/60 = 0.1) — the bar length. */
function decimalVA(va?: string | null): number | null {
  const m = /^(\d+)\s*\/\s*(\d+)/.exec(va ?? "");
  if (!m || Number(m[2]) === 0) return null;
  return Math.min(1, Number(m[1]) / Number(m[2]));
}

function VaBar({ label, va }: { label: string; va?: string | null }) {
  const d = decimalVA(va);
  return (
    <div className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={va ? `${label} ${va}` : `${label} not recorded`}>
        {d != null && <div className="h-full rounded-full bg-sage" style={{ width: `${Math.max(6, d * 100)}%` }} />}
      </div>
      <span className="text-right font-mono font-semibold text-foreground">{va ?? "—"}</span>
    </div>
  );
}

/** Normal IOP is 10–21 mmHg: the band is shaded and the reading is a marker on a 0–40 scale. */
function IopBar({ value }: { value?: number | null }) {
  const MAX = 40;
  const tone = value == null ? "bg-muted-foreground" : value > 21 ? "bg-destructive" : value < 10 ? "bg-warn" : "bg-sage";
  return (
    <div>
      <div className="relative h-3 rounded-full bg-muted" role="img" aria-label={value == null ? "IOP not recorded" : `IOP ${value} mmHg`}>
        <div className="absolute inset-y-0 rounded-full bg-sage-soft" style={{ left: `${(10 / MAX) * 100}%`, width: `${((21 - 10) / MAX) * 100}%` }} />
        {value != null && <div className={cn("absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card", tone)} style={{ left: `${Math.min(100, (value / MAX) * 100)}%` }} />}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span>10 – 21 normal</span>
        <span>40 mmHg</span>
      </div>
    </div>
  );
}

/**
 * The visit at a glance, drawn rather than listed: acuity bars, IOP against the
 * normal band, and the slit-lamp / fundus / eye-map drawings rebuilt from what
 * the examiner recorded.
 */
export function VisitCharts({ data }: { data: FullVisitData }) {
  const ex = useMemo(() => examFromVisit(data), [data]);
  const byEye = EYES.map((e) => ({
    ...e,
    unaided: data.readings.find((r) => r.eye === e.wire && r.stage === "unaided")?.va,
    corrected: data.readings.find((r) => r.eye === e.wire && r.stage === "final_rx")?.va,
    iop: e.k === "od" ? data.examination?.iop_od : data.examination?.iop_os,
  }));
  const hasVa = byEye.some((e) => e.unaided || e.corrected);
  const hasIop = byEye.some((e) => e.iop != null);
  const hasSlit = !!ex && EYES.some(({ k }) => Object.values(ex.slit[k]).some(Boolean));
  const hasFundus = !!ex && EYES.some(({ k }) => ex.fundus[k].marks.length > 0 || ex.fundus[k].status.length > 0);
  const hasMap = !!ex && EYES.some(({ k }) => ex.marks[k].length > 0);

  if (!hasVa && !hasIop && !hasSlit && !hasFundus && !hasMap) return null;

  return (
    <div className="grid gap-6">
      {(hasVa || hasIop) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {hasVa && (
            <section className={CARD} aria-label="Visual acuity chart">
              <h3 className={HEAD}>Visual acuity</h3>
              <div className="grid gap-4 p-4 sm:grid-cols-2">
                {byEye.map((e) => (
                  <div key={e.k} className="flex flex-col gap-2">
                    <div className="text-xs font-semibold text-foreground">{e.label}</div>
                    <VaBar label="Unaided" va={e.unaided} />
                    <VaBar label="Corrected" va={e.corrected} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {hasIop && (
            <section className={CARD} aria-label="Intraocular pressure chart">
              <h3 className={HEAD}>Intraocular pressure</h3>
              <div className="grid gap-4 p-4 sm:grid-cols-2">
                {byEye.map((e) => (
                  <div key={e.k}>
                    <div className="mb-2 flex items-baseline justify-between text-xs font-semibold text-foreground">
                      <span>{e.label}</span>
                      <span className="font-mono text-base">{e.iop != null ? `${e.iop} mmHg` : "—"}</span>
                    </div>
                    <IopBar value={e.iop} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {ex && (hasSlit || hasFundus || hasMap) && (
        <section className={CARD} aria-label="Eye drawings">
          <h3 className={HEAD}>Eye findings, drawn</h3>
          <div className="paper-light grid gap-6 bg-card p-4">
            {hasSlit && (
              <Row title="Slit lamp">
                {(k) => <SlitDiagram eye={k} v={ex.slit[k]} className="w-full max-w-[230px]" />}
              </Row>
            )}
            {hasFundus && (
              <Row title="Fundus">
                {(k) => (
                  <div className="flex flex-col items-center gap-1">
                    <FundusDiagram eye={k} d={ex.fundus[k]} className="w-full max-w-[190px]" />
                    <span className="text-xs text-muted-foreground">
                      C:D {ex.fundus[k].cd.toFixed(1)}
                      {ex.fundus[k].status.length ? ` · ${ex.fundus[k].status.join(", ")}` : ""}
                    </span>
                  </div>
                )}
              </Row>
            )}
            {hasMap && (
              <Row title="Eye map — structures marked">
                {(k) => (
                  <div className="flex flex-col items-center gap-1">
                    <AnatomyEye marks={ex.marks[k]} toggle={() => {}} />
                    <span className="text-xs text-muted-foreground">{ex.marks[k].map((m) => ANAT[m as keyof typeof ANAT] ?? m).join(", ") || "None"}</span>
                  </div>
                )}
              </Row>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ title, children }: { title: string; children: (eye: "od" | "os") => React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</div>
      <div className="grid grid-cols-2 gap-4">
        {EYES.map((e) => (
          <figure key={e.k} className="flex flex-col items-center">
            <figcaption className="mb-1 text-[11px] font-bold uppercase tracking-wide text-foreground">{e.label}</figcaption>
            {children(e.k)}
          </figure>
        ))}
      </div>
    </div>
  );
}
