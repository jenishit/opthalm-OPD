import type { IntakeExamFormData } from "@/schemas/shared-schema";
import type { Eye } from "@/schemas/refraction-schema";
import { COND } from "@/types/eye-types";
import { addDays, today0 } from "@/lib/utils";
import { snellenVA } from "./Snellen";
import { FINDINGS } from "./mock-data";
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

/**
 * Maps the examination chart's working state (ExamState) onto the backend's
 * clinical-document shape (IntakeExamFormData) so it can be saved via
 * stashClinicalVisit/createFullVisit and rendered by VisitDetailView on the
 * patient's profile.
 *
 * This chart doesn't collect every field IntakeExamFormData models — symptoms,
 * convergence/cover-test/EOM, treatments, and investigations aren't part of
 * this UI (they belong to the separate intake form), so those are left at
 * their defaults rather than fabricated.
 */
export function examToIntakeData(ex: ExamState, p: ExamPatient, examinerName: string): IntakeExamFormData {
  const chiefComplaint = p.chiefComplaint ?? COND[p.visits[0]?.dx ?? ""]?.name ?? "Comprehensive eye examination";

  const readings: IntakeExamFormData["readings"] = [];
  (["od", "os"] as const).forEach((eye) => {
    const va = snellenVA(ex.va[eye]);
    if (va) {
      readings.push({ eye: EYE_KEY[eye], stage: "unaided", va: va.l });
    }
    const mr = ex.mr[eye];
    if (mr.s != null || mr.c != null || mr.a != null || ex.add[eye] != null) {
      readings.push({
        eye: EYE_KEY[eye],
        stage: "final_rx",
        sphere: mr.s ?? undefined,
        cylinder: mr.c ?? undefined,
        axis: mr.a ?? undefined,
        add_power: ex.add[eye] ?? undefined,
      });
    }
  });

  const anteriorSegment = (eye: "od" | "os") => {
    const picks = Object.values(ex.slit[eye]).filter((v): v is string => v != null);
    return picks.length > 0 ? picks.join(", ") : undefined;
  };

  const fundusText = (eye: "od" | "os") => {
    const f = ex.fundus[eye];
    const parts = [...f.status, `C:D ${f.cd.toFixed(1)}`];
    return parts.join(", ");
  };

  const diagnoses: IntakeExamFormData["diagnoses"] = [
    ...ex.findings.map((id) => ({
      diagnosis_id: id,
      diagnosis_name: FINDINGS.find((f) => f.id === id)?.n ?? id,
      laterality: "OU" as const,
    })),
    ...ex.customFindings.map((text, i) => ({
      diagnosis_id: `custom-${i}-${text.slice(0, 12)}`,
      diagnosis_name: text,
      laterality: "OU" as const,
    })),
  ];

  return {
    chief_complaint: chiefComplaint,
    examined_by: examinerName,
    history: { uses_spectacles: false, condition_ids: [] },
    symptoms: BLANK_SYMPTOMS,
    readings,
    examination: {
      iop_od: ex.iop.od ?? undefined,
      iop_os: ex.iop.os ?? undefined,
      anterior_segment_od: anteriorSegment("od"),
      anterior_segment_os: anteriorSegment("os"),
      fundus_od: fundusText("od"),
      fundus_os: fundusText("os"),
    },
    investigations: [],
    diagnoses,
    treatments: [],
    follow_up:
      ex.fu != null
        ? {
            follow_up_date: addDays(today0(), ex.fu).toISOString().slice(0, 10),
            reason: ex.fuNote || undefined,
            reminder_sent_at: null,
          }
        : undefined,
  };
}
