import { apiFetch, ApiError, NotImplementedError } from "./http";
import { delay } from "@/lib/mock/delay";
import { mockInvestigations } from "@/lib/mock/data";
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

/** Reschedules a visit to a new date — e.g. dragging it to another day on the appointments calendar. */
export async function updateVisitDate(id: string, visitDate: string): Promise<Visit> {
  const current = await getVisitDto(id);
  await updateVisitDto(id, {
    patient_id: current.patient.id,
    examine_by: current.examine_by.id,
    status: current.status,
    visit_date: visitDate,
    chief_complaint: current.chief_complaint,
  });
  return toUiVisit({ ...current, visit_date: visitDate }, current.patient.id);
}

/** Rewrites the chief complaint — used to re-tag an appointment's type on the week board. */
export async function updateVisitComplaint(id: string, chiefComplaint: string): Promise<Visit> {
  const current = await getVisitDto(id);
  await updateVisitDto(id, {
    patient_id: current.patient.id,
    examine_by: current.examine_by.id,
    status: current.status,
    visit_date: current.visit_date,
    chief_complaint: chiefComplaint,
  });
  return toUiVisit({ ...current, chief_complaint: chiefComplaint }, current.patient.id);
}

// ── Clinical sub-documents ───────────────────────────────────────────────────
//
// Symptoms/refraction/exam findings/diagnoses/treatments/follow-ups are now
// backed by real endpoints under /visit/:id/*. Investigations still have no
// endpoint, so they stay in a local store keyed by visit id.

const investigationsStore: Record<string, Investigation[]> = { ...mockInvestigations };

/** Shape returned by GET /visit/:id/clinical — the whole chart in one call. */
export interface VisitClinicalDTO {
  symptoms: VisitSymptoms | null;
  readings: RefractionReading[];
  examination: ExaminationFindings | null;
  diagnoses: VisitDiagnosis[];
  treatments: Treatment[];
  follow_up: FollowUp | null;
}

/** GET /visit/:id/clinical — the whole chart (symptoms, readings, exam findings, diagnoses, treatments, follow-up) in one call. */
export function getVisitClinicalDto(visitId: string): Promise<VisitClinicalDTO> {
  return apiFetch<VisitClinicalDTO>(`/visit/${visitId}/clinical`);
}

/** PUT /visit/:id/symptoms — replaces the visit's single symptoms document. */
export function updateVisitSymptoms(visitId: string, symptoms: VisitSymptoms): Promise<VisitSymptoms> {
  return apiFetch<VisitSymptoms>(`/visit/${visitId}/symptoms`, {
    method: "PUT",
    body: JSON.stringify(symptoms),
  });
}

/** PUT /visit/:id/examination — replaces the visit's single examination-findings document. */
export function updateVisitExamination(
  visitId: string,
  examination: ExaminationFindings
): Promise<ExaminationFindings> {
  return apiFetch<ExaminationFindings>(`/visit/${visitId}/examination`, {
    method: "PUT",
    body: JSON.stringify(examination),
  });
}

/** GET /visit/:id/readings — every refraction reading recorded for the visit. */
export function getVisitReadings(visitId: string): Promise<RefractionReading[]> {
  return apiFetch<RefractionReading[]>(`/visit/${visitId}/readings`);
}

/** POST /visit/:id/readings — upserts by (eye, stage): re-posting the same eye+stage replaces that reading instead of duplicating it. */
export function upsertVisitReading(visitId: string, reading: RefractionReading): Promise<RefractionReading> {
  return apiFetch<RefractionReading>(`/visit/${visitId}/readings`, {
    method: "POST",
    body: JSON.stringify(reading),
  });
}

/** PUT /visit/:id/diagnoses — atomic delete+reinsert of the full diagnosis set. */
export function updateVisitDiagnoses(visitId: string, diagnoses: VisitDiagnosis[]): Promise<VisitDiagnosis[]> {
  return apiFetch<VisitDiagnosis[]>(`/visit/${visitId}/diagnoses`, {
    method: "PUT",
    body: JSON.stringify({ diagnoses }),
  });
}

/** PUT /visit/:id/treatments — atomic delete+reinsert of the full treatment set. */
export function updateVisitTreatments(visitId: string, treatments: Treatment[]): Promise<Treatment[]> {
  return apiFetch<Treatment[]>(`/visit/${visitId}/treatments`, {
    method: "PUT",
    body: JSON.stringify({ treatments }),
  });
}

/** PUT /visit/:id/follow-up — replaces the visit's single follow-up document. */
export function updateVisitFollowUp(visitId: string, followUp: FollowUp): Promise<FollowUp> {
  return apiFetch<FollowUp>(`/visit/${visitId}/follow-up`, {
    method: "PUT",
    body: JSON.stringify(followUp),
  });
}

/**
 * Saves the full clinical chart (symptoms, readings, exam findings,
 * diagnoses, treatments, follow-up) to an existing visit id. Exported so
 * callers that already hold a real visit id (e.g. today's queue) can save
 * clinical data without creating a duplicate visit via createFullVisit.
 *
 * Investigations have no backend endpoint yet, so they're kept locally.
 */
export async function saveClinicalData(visitId: string, data: IntakeExamFormData): Promise<void> {
  await Promise.all([
    updateVisitSymptoms(visitId, data.symptoms),
    updateVisitExamination(visitId, data.examination),
    Promise.all(data.readings.map((reading) => upsertVisitReading(visitId, reading))),
    updateVisitDiagnoses(visitId, data.diagnoses),
    updateVisitTreatments(visitId, data.treatments),
    data.follow_up ? updateVisitFollowUp(visitId, data.follow_up) : Promise.resolve(),
  ]);

  if (data.investigations.length > 0) {
    investigationsStore[visitId] = data.investigations.map((inv, i) => ({
      ...inv,
      id: `inv${Date.now()}_${i}`,
      visit_id: visitId,
    }));
  }
}

export async function getVisitInvestigations(visitId: string): Promise<Investigation[]> {
  await delay();
  return investigationsStore[visitId] ?? [];
}

/**
 * Creates the visit via POST /visit (patient, examiner, status, date, chief
 * complaint), then saves the full clinical chart to it.
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

  await saveClinicalData(dto.id, data);

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

  const [clinical, investigations] = await Promise.all([
    getVisitClinicalDto(visitId),
    getVisitInvestigations(visitId),
  ]);

  return {
    visit,
    symptoms: clinical.symptoms,
    readings: clinical.readings,
    examination: clinical.examination,
    diagnoses: clinical.diagnoses,
    treatments: clinical.treatments,
    investigations,
    followUp: clinical.follow_up,
  };
}
