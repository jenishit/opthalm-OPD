import { apiFetch, ApiError, NotImplementedError } from "./http";
import { delay } from "@/lib/mock/delay";
import {
  mockVisitSymptoms,
  mockRefractionReadings,
  mockExaminationFindings,
  mockVisitDiagnoses,
  mockTreatments,
  mockInvestigations,
  mockFollowUps,
} from "@/lib/mock/data";
import { useAuthStore } from "@/stores/authStore";
import type { Visit, VisitStatus, VisitSymptoms, VisitDiagnosis } from "@/schemas/visit-schema";
import type { RefractionReading } from "@/schemas/refraction-schema";
import type { ExaminationFindings } from "@/schemas/examination-schema";
import type { Treatment, FollowUp } from "@/schemas/treatment-schema";
import type { Investigation, IntakeExamFormData } from "@/schemas/shared-schema";
import type {
  PatientVisitsDTO,
  VisitCreateDTO,
  VisitDTO,
  VisitItemDTO,
  VisitUpsertRequest,
} from "@/types/api-types";

export function toUiVisit(dto: VisitItemDTO, patientId: string): Visit {
  return {
    id: dto.id,
    patient_id: patientId,
    examined_by: dto.examine_by.name,
    status: dto.status as VisitStatus,
    visit_date: dto.visit_date,
    chief_complaint: dto.chief_complaint,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function getPatientVisitDtos(patientId: string): Promise<PatientVisitsDTO> {
  return apiFetch<PatientVisitsDTO>(`/visit/patient/${patientId}`);
}

export function getVisitDto(id: string): Promise<VisitDTO> {
  return apiFetch<VisitDTO>(`/visit/${id}`);
}

/** POST /visit — returns the created visit with `examine_by` as a plain string. */
export function createVisitDto(body: VisitUpsertRequest): Promise<VisitCreateDTO> {
  return apiFetch<VisitCreateDTO>("/visit", { method: "POST", body: JSON.stringify(body) });
}

/** PATCH /visit/:id reuses the create body; returns a message. */
export function updateVisitDto(id: string, body: VisitUpsertRequest): Promise<void> {
  return apiFetch<void>(`/visit/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

// ── UI-facing visit API ──────────────────────────────────────────────────────

export async function getVisits(filters?: {
  date?: string;
  status?: VisitStatus;
  patient_id?: string;
}): Promise<Visit[]> {
  if (!filters?.patient_id) {
    throw new NotImplementedError("Listing visits without a patient");
  }
  const { visits } = await getPatientVisitDtos(filters.patient_id);
  return visits
    .map((v) => toUiVisit(v, filters.patient_id!))
    .filter((v) => !filters.date || String(v.visit_date).slice(0, 10) === filters.date)
    .filter((v) => !filters.status || v.status === filters.status);
}

export async function getVisit(id: string): Promise<Visit | null> {
  try {
    const dto = await getVisitDto(id);
    return toUiVisit(dto, dto.patient.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function updateVisitStatus(id: string, status: VisitStatus): Promise<Visit> {
  const current = await getVisitDto(id);
  await updateVisitDto(id, {
    patient_id: current.patient.id,
    examine_by: current.examine_by.id,
    status,
    visit_date: current.visit_date,
    chief_complaint: current.chief_complaint,
  });
  return toUiVisit({ ...current, status }, current.patient.id);
}

// ── Clinical sub-documents ───────────────────────────────────────────────────
//
// Symptoms/refraction/exam findings/diagnoses/treatments/investigations/
// follow-ups have no backend endpoints yet — kept in a local store keyed by
// visit id until the backend grows clinical-document endpoints.

const symptomsStore: Record<string, VisitSymptoms> = { ...mockVisitSymptoms };
const refractionStore: Record<string, RefractionReading[]> = { ...mockRefractionReadings };
const examStore: Record<string, ExaminationFindings> = { ...mockExaminationFindings };
const diagnosesStore: Record<string, VisitDiagnosis[]> = { ...mockVisitDiagnoses };
const treatmentsStore: Record<string, Treatment[]> = { ...mockTreatments };
const investigationsStore: Record<string, Investigation[]> = { ...mockInvestigations };
const followUpStore: Record<string, FollowUp> = { ...mockFollowUps };

/**
 * Attaches the clinical sub-documents (symptoms, refraction, exam findings,
 * diagnoses, treatments, investigations, follow-up) to an existing visit id.
 * Exported so callers that already hold a real visit id (e.g. today's queue)
 * can save clinical data without creating a duplicate visit via createFullVisit.
 */
export function stashClinicalVisit(visitId: string, data: IntakeExamFormData): void {
  symptomsStore[visitId] = { ...data.symptoms, id: `vs${Date.now()}`, visit_id: visitId };
  refractionStore[visitId] = data.readings.map((r, i) => ({
    ...r,
    id: `r${Date.now()}_${i}`,
    visit_id: visitId,
  }));
  examStore[visitId] = { ...data.examination, id: `ef${Date.now()}`, visit_id: visitId };
  diagnosesStore[visitId] = data.diagnoses.map((d, i) => ({
    ...d,
    id: `vd${Date.now()}_${i}`,
    visit_id: visitId,
  }));
  treatmentsStore[visitId] = data.treatments.map((t, i) => ({
    ...t,
    id: `t${Date.now()}_${i}`,
    visit_id: visitId,
  }));
  if (data.investigations.length > 0) {
    investigationsStore[visitId] = data.investigations.map((inv, i) => ({
      ...inv,
      id: `inv${Date.now()}_${i}`,
      visit_id: visitId,
    }));
  }
  if (data.follow_up) {
    followUpStore[visitId] = { ...data.follow_up, id: `fu${Date.now()}`, visit_id: visitId };
  }
}

export async function getVisitSymptoms(visitId: string): Promise<VisitSymptoms | null> {
  await delay();
  return symptomsStore[visitId] ?? null;
}

export async function getVisitRefractions(visitId: string): Promise<RefractionReading[]> {
  await delay();
  return refractionStore[visitId] ?? [];
}

export async function getVisitExamination(visitId: string): Promise<ExaminationFindings | null> {
  await delay();
  return examStore[visitId] ?? null;
}

export async function getVisitDiagnoses(visitId: string): Promise<VisitDiagnosis[]> {
  await delay();
  return diagnosesStore[visitId] ?? [];
}

export async function getVisitTreatments(visitId: string): Promise<Treatment[]> {
  await delay();
  return treatmentsStore[visitId] ?? [];
}

export async function getVisitInvestigations(visitId: string): Promise<Investigation[]> {
  await delay();
  return investigationsStore[visitId] ?? [];
}

export async function getVisitFollowUp(visitId: string): Promise<FollowUp | null> {
  await delay();
  return followUpStore[visitId] ?? null;
}

/**
 * Persists the visit via POST /visit (patient, examiner, status, date, chief
 * complaint) and keeps the clinical payload locally until the backend grows
 * clinical-document endpoints.
 */
export async function createFullVisit(
  patientId: string,
  data: IntakeExamFormData
): Promise<Visit> {
  const staffUser = useAuthStore.getState().staffUser;
  const today = new Date().toISOString().split("T")[0];

  const dto = await createVisitDto({
    patient_id: patientId,
    // POST /visit expects the examiner's profile id; it resolves it to a
    // display ref internally.
    examine_by: staffUser?.id || data.examined_by || "",
    status: "completed",
    visit_date: today,
    chief_complaint: data.chief_complaint,
  });

  stashClinicalVisit(dto.id, data);

  return {
    id: dto.id,
    patient_id: dto.patient_id,
    // Keep the display name for the UI, not the raw id the API echoes back.
    examined_by: staffUser?.name || data.examined_by || dto.examine_by,
    status: dto.status as VisitStatus,
    visit_date: dto.visit_date,
    chief_complaint: dto.chief_complaint,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

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

  const [symptoms, readings, examination, diagnoses, treatments, investigations, followUp] =
    await Promise.all([
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
    symptoms,
    readings,
    examination,
    diagnoses,
    treatments,
    investigations,
    followUp,
  };
}
