import type { FullVisitData } from "@/services/visits-services";
import { stableUuid } from "@/lib/stable-uuid";
import { today0, uid } from "@/lib/utils";
import { BLANK, FINDINGS } from "./exam-defaults";
import { keysForVA } from "./Snellen";
import type { ExamState, FundusFindings, SlitFindings } from "./types";

const EYES = ["od", "os"] as const;
const DAY = 86_400_000;

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const num = (v: string | undefined): number | null => {
  if (v == null || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Investigation rows the exam page derives itself (and older saves that stored them as "other"). */
const isDerived = (type: string, result?: string) =>
  type === "Retinoscopy" ||
  type === "Near VA (corrected)" ||
  (type === "other" && /^(Retinoscopy V|Near VA|Examiner notes)/.test(result ?? ""));

/**
 * The inverse of examToIntakeData: rebuilds the exam chart from what was saved
 * on the visit, so reopening a patient shows their recorded values. Returns
 * null when nothing has been recorded yet (the chart then starts blank).
 */
export function examFromVisit(d: FullVisitData): ExamState | null {
  const ex: ExamState = structuredClone(BLANK);
  let any = false;
  const mark = () => {
    any = true;
  };

  // Visual acuity and refraction
  for (const r of d.readings) {
    const eye = r.eye === "OD" ? "od" : r.eye === "OS" ? "os" : null;
    if (!eye) continue;
    if (r.stage === "unaided") {
      ex.va[eye] = keysForVA(r.va);
      mark();
    } else if (r.stage === "final_rx") {
      ex.mr[eye] = { s: r.sphere ?? null, c: r.cylinder ?? null, a: r.axis ?? null };
      ex.add[eye] = r.add_power ?? null;
      ex.cv[eye].d = r.va ?? null;
      mark();
    }
  }

  // Examination: IOP, notes, drawings
  const e = d.examination;
  if (e) {
    if (e.iop_od != null) { ex.iop.od = e.iop_od; mark(); }
    if (e.iop_os != null) { ex.iop.os = e.iop_os; mark(); }
    if (e.notes) { ex.notes = e.notes; mark(); }

    const marks = obj(e.fundus_marks);
    for (const eye of EYES) {
      const list = marks[eye];
      if (Array.isArray(list)) {
        ex.fundus[eye].marks = list
          .map((m) => obj(m))
          .filter((m) => typeof m.x === "number" && typeof m.y === "number")
          .map((m) => ({ x: m.x as number, y: m.y as number, t: String(m.type ?? "") }));
        if (ex.fundus[eye].marks.length) mark();
      }
    }

    const sl = obj(e.slit_findings);
    const slit = obj(sl.slit);
    const anat = obj(sl.anatomy);
    const fundus = obj(sl.fundus);
    for (const eye of EYES) {
      const s = obj(slit[eye]);
      const next = { ...ex.slit[eye] } as SlitFindings;
      (Object.keys(next) as Array<keyof SlitFindings>).forEach((k) => {
        if (typeof s[k] === "string") next[k] = s[k] as string;
      });
      ex.slit[eye] = next;
      if (Object.values(next).some((v) => v != null)) mark();

      if (Array.isArray(anat[eye])) {
        ex.marks[eye] = (anat[eye] as unknown[]).map(String);
        if (ex.marks[eye].length) mark();
      }
      const f = obj(fundus[eye]);
      const merged: FundusFindings = { ...ex.fundus[eye] };
      if (typeof f.cd === "number") merged.cd = f.cd;
      if (Array.isArray(f.status)) merged.status = (f.status as unknown[]).map(String);
      ex.fundus[eye] = merged;
      if (merged.status.length || merged.marks.length) mark();
    }
  }

  // Investigations: retinoscopy and near VA map back onto their fields; the rest are listed.
  for (const inv of d.investigations) {
    const eye = inv.eye === "OD" ? "od" : inv.eye === "OS" ? "os" : null;
    const type = inv.type ?? "";
    if (type === "Retinoscopy" && eye) {
      const m = /V\s*(\S+)\s*\/\s*H\s*(\S+)/.exec(inv.result ?? "");
      if (m) { ex.ret[eye] = [num(m[1]), num(m[2])]; mark(); }
    } else if (type === "Near VA (corrected)" && eye) {
      ex.cv[eye].n = inv.result ?? null;
      mark();
    } else if (!isDerived(type, inv.result)) {
      ex.investigations.push({ id: uid(), type, eye: inv.eye ?? "", result: inv.result ?? "", notes: inv.notes ?? "" });
      mark();
    }
  }

  // Findings: checklist items match by their derived id; everything else comes back as a typed finding.
  for (const dx of d.diagnoses) {
    const name = dx.diagnosis_name ?? "";
    const preset = FINDINGS.find((f) => stableUuid(`finding:${f.id}`) === dx.diagnosis_id);
    const key = preset ? preset.id : name;
    if (!key) continue;
    if (preset) ex.findings.push(preset.id);
    else ex.customFindings.push(name);
    ex.findingId[key] = dx.diagnosis_id;
    ex.findingEye[key] = dx.laterality;
    mark();
  }

  // Follow-up: days from today (a date already past can't be a "follow-up in N days", so it is left off).
  if (d.followUp?.follow_up_date) {
    const days = Math.round((new Date(`${d.followUp.follow_up_date.slice(0, 10)}T00:00:00`).getTime() - today0().getTime()) / DAY);
    if (days > 0) { ex.fu = days; mark(); }
    if (d.followUp.reason) { ex.fuNote = d.followUp.reason; mark(); }
  }

  if (!any) return null;
  ex.saved = d.visit.status === "completed";
  return ex;
}
