import { delay } from "@/lib/mock/delay";
import {
  mockVisits,
  mockVisitSymptoms,
  mockRefractionReadings,
  mockExaminationFindings,
  mockVisitDiagnoses,
  mockTreatments,
  mockInvestigations,
  mockFollowUps,
} from "@/lib/mock/data";
import type { Visit, VisitStatus, VisitSymptoms, VisitDiagnosis } from "@/lib/schemas/visit.schema";
import type { RefractionReading } from "@/lib/schemas/refraction.schema";
import type { ExaminationFindings } from "@/lib/schemas/examination.schema";
import type { Treatment, FollowUp } from "@/lib/schemas/treatment.schema";
import type { Investigation, IntakeExamFormData } from "@/lib/schemas/shared.schema";

let visits = [...mockVisits];
const symptoms = { ...mockVisitSymptoms };
const readings = { ...mockRefractionReadings };
const examFindings = { ...mockExaminationFindings };
const visitDiagnoses = { ...mockVisitDiagnoses };
const treatments = { ...mockTreatments };
const investigations = { ...mockInvestigations };
const followUps = { ...mockFollowUps };

// ── Visit CRUD ──────────────────────────────────────────────────────────────

export async function getVisits(filters?: {
  date?: string;
  status?: VisitStatus;
  patient_id?: string;
}): Promise<Visit[]> {
  await delay();
  let result = visits;
  if (filters?.date) result = result.filter((v) => v.visit_date === filters.date);
  if (filters?.status) result = result.filter((v) => v.status === filters.status);
  if (filters?.patient_id) result = result.filter((v) => v.patient_id === filters.patient_id);
  return result;
}

export async function getVisit(id: string): Promise<Visit | null> {
  await delay();
  return visits.find((v) => v.id === id) ?? null;
}

export async function updateVisitStatus(id: string, status: VisitStatus): Promise<Visit> {
  await delay();
  const idx = visits.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error("Visit not found");
  visits[idx] = { ...visits[idx], status, updated_at: new Date().toISOString() };
  return visits[idx];
}

// ── Visit Detail Getters ────────────────────────────────────────────────────

export async function getVisitSymptoms(visitId: string): Promise<VisitSymptoms | null> {
  await delay();
  return symptoms[visitId] ?? null;
}

export async function getVisitRefractions(visitId: string): Promise<RefractionReading[]> {
  await delay();
  return readings[visitId] ?? [];
}

export async function getVisitExamination(visitId: string): Promise<ExaminationFindings | null> {
  await delay();
  return examFindings[visitId] ?? null;
}

export async function getVisitDiagnoses(visitId: string): Promise<VisitDiagnosis[]> {
  await delay();
  return visitDiagnoses[visitId] ?? [];
}

export async function getVisitTreatments(visitId: string): Promise<Treatment[]> {
  await delay();
  return treatments[visitId] ?? [];
}

export async function getVisitInvestigations(visitId: string): Promise<Investigation[]> {
  await delay();
  return investigations[visitId] ?? [];
}

export async function getVisitFollowUp(visitId: string): Promise<FollowUp | null> {
  await delay();
  return followUps[visitId] ?? null;
}

// ── Create Full Visit (intake/exam form submission) ─────────────────────────

/**
 * Stores the clinical payload (symptoms/refraction/exam/diagnoses/treatments)
 * locally. The backend's POST /visit only persists core visit fields; these
 * clinical documents have no endpoints yet.
 */
export function stashClinicalVisit(visitId: string, data: IntakeExamFormData): void {
  symptoms[visitId] = { ...data.symptoms, id: `vs${Date.now()}`, visit_id: visitId };
  readings[visitId] = data.readings.map((r, i) => ({
    ...r,
    id: `r${Date.now()}_${i}`,
    visit_id: visitId,
  }));
  examFindings[visitId] = { ...data.examination, id: `ef${Date.now()}`, visit_id: visitId };
  visitDiagnoses[visitId] = data.diagnoses.map((d, i) => ({
    ...d,
    id: `vd${Date.now()}_${i}`,
    visit_id: visitId,
  }));
  treatments[visitId] = data.treatments.map((t, i) => ({
    ...t,
    id: `t${Date.now()}_${i}`,
    visit_id: visitId,
  }));
  if (data.investigations.length > 0) {
    investigations[visitId] = data.investigations.map((inv, i) => ({
      ...inv,
      id: `inv${Date.now()}_${i}`,
      visit_id: visitId,
    }));
  }
  if (data.follow_up) {
    followUps[visitId] = { ...data.follow_up, id: `fu${Date.now()}`, visit_id: visitId };
  }
}

export async function createFullVisit(
  patientId: string,
  data: IntakeExamFormData
): Promise<Visit> {
  await delay(500);

  const visitId = `v${Date.now()}`;
  const today = new Date().toISOString().split("T")[0];

  const newVisit: Visit = {
    id: visitId,
    patient_id: patientId,
    examined_by: data.examined_by,
    status: "completed",
    visit_date: today,
    chief_complaint: data.chief_complaint,
    complaint_duration: data.complaint_duration,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  visits = [newVisit, ...visits];
  stashClinicalVisit(visitId, data);

  return newVisit;
}

// ── Get complete visit data for view/edit ────────────────────────────────────

export interface FullVisitData {
  visit: Visit;
  symptoms: VisitSymptoms | null;
  readings: RefractionReading[];
  examination: ExaminationFindings | null;
  diagnoses: VisitDiagnosis[];
  treatments: Treatment[];
  investigations: Investigation[];
  followUp: FollowUp | null;
}

export async function getFullVisitData(visitId: string): Promise<FullVisitData | null> {
  const visit = await getVisit(visitId);
  if (!visit) return null;

  const [sym, refs, exam, diag, treats, invs, fu] = await Promise.all([
    getVisitSymptoms(visitId),
    getVisitRefractions(visitId),
    getVisitExamination(visitId),
    getVisitDiagnoses(visitId),
    getVisitTreatments(visitId),
    getVisitInvestigations(visitId),
    getVisitFollowUp(visitId),
  ]);

  return {
    visit,
    symptoms: sym,
    readings: refs,
    examination: exam,
    diagnoses: diag,
    treatments: treats,
    investigations: invs,
    followUp: fu,
  };
}
