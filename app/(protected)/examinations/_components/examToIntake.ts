import type { IntakeExamFormData } from "@/schemas/shared-schema";
import type { Eye } from "@/schemas/refraction-schema";
import { ANAT, COND } from "@/types/eye-types";
import { stableUuid } from "@/lib/stable-uuid";
import { addDays, iso, today0 } from "@/lib/utils";
import { snellenVA } from "./Snellen";
import { FINDINGS } from "./exam-defaults";
import { SLIT, FMARKS } from "./data";
import type { ExamPatient, ExamState } from "./types";

const EYE_KEY: Record<"od" | "os", Eye> = { od: "OD", os: "OS" };

const BLANK_SYMPTOMS: IntakeExamFormData["symptoms"] = {
  foreign_body_sensation: "none",
  redness: "none",
  swelling: "none",
  diminished_distance_vision: "none",
  diminished_near_vision: "none",
  blurring: "none",
  headache: "none",
  eye_pain: "none",
  watery_eyes: "none",
  discharge: "none",
  itching: "none",
  photophobia: "none",
  floaters: "none",
  flashes: "none",
  double_vision: "none",
  recent_fever: false,
};

/** Database column limits the backend enforces — longer values would fail the whole save. */
const MAX_SEGMENT = 255;
const MAX_NOTE = 255;
const MAX_RESULT = 50;
const MAX_TYPE = 50;
const MAX_EXAM_NOTES = 5000;

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const clipOpt = (text: string | undefined, max: number) => (text ? clip(text, max) : undefined);

const fmtD = (v: number | null) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}`);

/**
 * Maps the examination chart's working state (ExamState) onto the backend's
 * clinical-document shape (IntakeExamFormData) so it can be saved via
 * saveClinicalData and shown on the patient's visit page.
 *
 * Everything the examiner records is sent; where the backend has no dedicated
 * column it goes into the closest one, with the label kept so it still reads:
 *  - unaided VA            → reading (stage unaided)
 *  - manifest Rx, add, corrected distance VA → reading (stage final_rx)
 *  - retinoscopy meridians, corrected NEAR VA → investigations (recorded as entered —
 *    a meridian pair has no safe sphere/cylinder/axis conversion)
 *  - slit lamp (per region), eye-map marks   → anterior_segment_od/os
 *  - C:D, fundus status and marks            → fundus_od/os
 *  - investigations tab      → investigations (any test name, eye, result, notes)
 *  - examiner notes                          → examination.notes (5000 chars)
 *  - fundus mark positions, slit/eye-map picks, C:D, status → examination.fundus_marks / slit_findings (structured JSON)
 *  - findings checklist + typed findings     → diagnoses (provisional, per-eye laterality), ids derived from the text
 *  - follow-up interval + instructions       → follow_up
 * Symptoms, treatments and convergence/cover test/EOM aren't part of this chart
 * (they belong to the separate intake form); the exam page doesn't overwrite treatments.
 */
export function examToIntakeData(ex: ExamState, p: ExamPatient, examinerName: string): IntakeExamFormData {
  const chiefComplaint = p.chiefComplaint ?? COND[p.visits[0]?.dx ?? ""]?.name ?? "Comprehensive eye examination";

  const readings: IntakeExamFormData["readings"] = [];
  const investigations: IntakeExamFormData["investigations"] = [];

  (["od", "os"] as const).forEach((eye) => {
    const E = EYE_KEY[eye];
    const va = snellenVA(ex.va[eye]);
    if (va) readings.push({ eye: E, stage: "unaided", va: va.l });

    const mr = ex.mr[eye];
    const cv = ex.cv[eye];
    if (mr.s != null || mr.c != null || mr.a != null || ex.add[eye] != null || cv.d) {
      readings.push({
        eye: E,
        stage: "final_rx",
        sphere: mr.s ?? undefined,
        cylinder: mr.c ?? undefined,
        axis: mr.a ?? undefined,
        add_power: ex.add[eye] ?? undefined,
        va: cv.d ?? undefined,
      });
    }

    const [vert, horiz] = ex.ret[eye];
    if (vert != null || horiz != null) {
      investigations.push({
        type: "Retinoscopy",
        eye: E,
        result: clip(`V ${fmtD(vert)} / H ${fmtD(horiz)}`, MAX_RESULT),
        notes: "Retinoscopy, vertical / horizontal meridian (dioptres)",
      });
    }
    if (cv.n) {
      investigations.push({ type: "Near VA (corrected)", eye: E, result: clip(cv.n, MAX_RESULT), notes: "Corrected near vision" });
    }
  });

  // Anything the examiner entered on the Investigations tab goes first, exactly as typed.
  ex.investigations.forEach((r) => {
    if (!r.type.trim()) return;
    investigations.push({
      type: clip(r.type.trim(), MAX_TYPE),
      eye: r.eye || undefined,
      result: r.result.trim() ? clip(r.result.trim(), MAX_RESULT) : undefined,
      notes: r.notes.trim() ? clip(r.notes.trim(), MAX_NOTE) : undefined,
    });
  });

  const slitText = (eye: "od" | "os") => {
    const parts = (Object.keys(SLIT) as Array<keyof typeof SLIT>)
      .filter((k) => ex.slit[eye][k] != null)
      .map((k) => `${SLIT[k].n}: ${ex.slit[eye][k]}`);
    const marked = ex.marks[eye].map((id) => ANAT[id as keyof typeof ANAT] ?? id);
    if (marked.length) parts.push(`Marked: ${marked.join(", ")}`);
    return parts.length ? parts.join("; ") : undefined;
  };

  const fundusText = (eye: "od" | "os") => {
    const f = ex.fundus[eye];
    const parts = [...f.status, `C:D ${f.cd.toFixed(1)}`];
    const counts = FMARKS.map((m) => ({ n: m.n, c: f.marks.filter((x) => x.t === m.id).length })).filter((m) => m.c > 0);
    if (counts.length) parts.push(`Marks: ${counts.map((m) => `${m.c} ${m.n.toLowerCase()}`).join(", ")}`);
    return parts.join("; ");
  };

  // The checklist is not the diagnosis catalog, so its ids are derived UUIDs (see stableUuid).
  const diagnoses: IntakeExamFormData["diagnoses"] = [
    ...ex.findings.map((id) => ({
      diagnosis_id: ex.findingId[id] ?? stableUuid(`finding:${id}`),
      diagnosis_name: FINDINGS.find((f) => f.id === id)?.n ?? id,
      laterality: ex.findingEye[id] ?? ("OU" as const),
      status: "provisional" as const,
    })),
    ...ex.customFindings.map((text) => ({
      diagnosis_id: ex.findingId[text] ?? stableUuid(`finding:custom:${text.trim().toLowerCase()}`),
      diagnosis_name: clip(text.trim(), 255),
      laterality: ex.findingEye[text] ?? ("OU" as const),
      status: "provisional" as const,
    })),
  ];

  // Structured copies of the drawings, so the chart can be rebuilt exactly when the visit is reopened.
  const fundusMarks = {
    od: ex.fundus.od.marks.map((m) => ({ type: m.t, x: Math.round(m.x * 10) / 10, y: Math.round(m.y * 10) / 10 })),
    os: ex.fundus.os.marks.map((m) => ({ type: m.t, x: Math.round(m.x * 10) / 10, y: Math.round(m.y * 10) / 10 })),
  };
  const slitFindings = {
    slit: { od: ex.slit.od, os: ex.slit.os },
    anatomy: { od: ex.marks.od, os: ex.marks.os },
    fundus: {
      od: { cd: ex.fundus.od.cd, status: ex.fundus.od.status },
      os: { cd: ex.fundus.os.cd, status: ex.fundus.os.status },
    },
  };

  return {
    chief_complaint: chiefComplaint,
    examined_by: examinerName,
    history: { uses_spectacles: false, condition_ids: [] },
    symptoms: BLANK_SYMPTOMS,
    readings,
    examination: {
      iop_od: ex.iop.od ?? undefined,
      iop_os: ex.iop.os ?? undefined,
      anterior_segment_od: clipOpt(slitText("od"), MAX_SEGMENT),
      anterior_segment_os: clipOpt(slitText("os"), MAX_SEGMENT),
      fundus_od: clip(fundusText("od"), MAX_SEGMENT),
      fundus_os: clip(fundusText("os"), MAX_SEGMENT),
      notes: ex.notes.trim() ? clip(ex.notes.trim(), MAX_EXAM_NOTES) : undefined,
      fundus_marks: fundusMarks,
      slit_findings: slitFindings,
    },
    investigations,
    diagnoses,
    treatments: [],
    follow_up:
      ex.fu != null
        ? {
            follow_up_date: iso(addDays(today0(), ex.fu)), // local date — toISOString() would shift it a day back in Nepal
            reason: ex.fuNote ? clip(ex.fuNote, 255) : undefined,
            reminder_sent_at: null,
          }
        : undefined,
  };
}
