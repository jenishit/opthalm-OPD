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

// Per-visit clinical detail has no backend endpoint yet; these return empty values.
export async function getVisitSymptoms(_visitId: string): Promise<VisitSymptoms | null> {
  return null;
}

export async function getVisitRefractions(_visitId: string): Promise<RefractionReading[]> {
  return [];
}

export async function getVisitExamination(_visitId: string): Promise<ExaminationFindings | null> {
  return null;
}

export async function getVisitDiagnoses(_visitId: string): Promise<VisitDiagnosis[]> {
  return [];
}

export async function getVisitTreatments(_visitId: string): Promise<Treatment[]> {
  return [];
}

export async function getVisitInvestigations(_visitId: string): Promise<Investigation[]> {
  return [];
}

export async function getVisitFollowUp(_visitId: string): Promise<FollowUp | null> {
  return null;
}

export async function createFullVisit(
  _patientId: string,
  _data: IntakeExamFormData
): Promise<Visit> {
  throw new NotImplementedError("Saving a full clinical visit");
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

  return {
    visit,
    symptoms: null,
    readings: [],
    examination: null,
    diagnoses: [],
    treatments: [],
    investigations: [],
    followUp: null,
  };
}
