import { useAuthStore } from "@/lib/store/auth-store";
import type { Visit, VisitStatus, VisitSymptoms, VisitDiagnosis } from "@/lib/schemas/visit.schema";
import type { RefractionReading } from "@/lib/schemas/refraction.schema";
import type { ExaminationFindings } from "@/lib/schemas/examination.schema";
import type { Treatment, FollowUp } from "@/lib/schemas/treatment.schema";
import type { Investigation, IntakeExamFormData } from "@/lib/schemas/shared.schema";
import { ApiError, NotImplementedError } from "@/services/http";
import {
  createVisitDto,
  getPatientVisitDtos,
  getVisitDto,
  toUiVisit,
  updateVisitDto,
} from "@/services/visits";
import {
  getVisitSymptoms as mockGetVisitSymptoms,
  getVisitRefractions as mockGetVisitRefractions,
  getVisitExamination as mockGetVisitExamination,
  getVisitDiagnoses as mockGetVisitDiagnoses,
  getVisitTreatments as mockGetVisitTreatments,
  getVisitInvestigations as mockGetVisitInvestigations,
  getVisitFollowUp as mockGetVisitFollowUp,
  stashClinicalVisit,
} from "./visits.mock";

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
    .filter((v) => !filters.date || v.visit_date === filters.date)
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

// Per-visit clinical content (symptoms, refraction, exam findings, …) has no
// backend endpoints yet. Visits created in this session keep their clinical
// payload in a local store (lib/api/visits.mock), so these delegate.
export function getVisitSymptoms(visitId: string): Promise<VisitSymptoms | null> {
  return mockGetVisitSymptoms(visitId);
}

export function getVisitRefractions(visitId: string): Promise<RefractionReading[]> {
  return mockGetVisitRefractions(visitId);
}

export function getVisitExamination(visitId: string): Promise<ExaminationFindings | null> {
  return mockGetVisitExamination(visitId);
}

export function getVisitDiagnoses(visitId: string): Promise<VisitDiagnosis[]> {
  return mockGetVisitDiagnoses(visitId);
}

export function getVisitTreatments(visitId: string): Promise<Treatment[]> {
  return mockGetVisitTreatments(visitId);
}

export function getVisitInvestigations(visitId: string): Promise<Investigation[]> {
  return mockGetVisitInvestigations(visitId);
}

export function getVisitFollowUp(visitId: string): Promise<FollowUp | null> {
  return mockGetVisitFollowUp(visitId);
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
      mockGetVisitSymptoms(visitId),
      mockGetVisitRefractions(visitId),
      mockGetVisitExamination(visitId),
      mockGetVisitDiagnoses(visitId),
      mockGetVisitTreatments(visitId),
      mockGetVisitInvestigations(visitId),
      mockGetVisitFollowUp(visitId),
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
