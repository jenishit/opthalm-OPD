import { apiFetch, ApiError, NotImplementedError } from "./http";
import { useAuthStore } from "@/stores/authStore";
import { toScheduledAt } from "@/lib/clinic-time";
import { invalidateScheduleCache } from "./schedule-cache";
import type { Visit, VisitStatus, VisitSymptoms, VisitDiagnosis } from "@/schemas/visit-schema";
import type { RefractionReading } from "@/schemas/refraction-schema";
import type { ExaminationFindings } from "@/schemas/examination-schema";
import type { Treatment, FollowUp } from "@/schemas/treatment-schema";
import type { Investigation, IntakeExamFormData } from "@/schemas/shared-schema";
import type {
  PatientVisits,
  VisitClinical,
  VisitCreate,
  Visit as VisitRecord,
  VisitItem,
  VisitUpsertRequest,
} from "@/types/visit-types";

export function toUiVisit(record: VisitItem, patientId: string): Visit {
  return {
    id: record.id,
    patient_id: patientId,
    examined_by: record.examine_by.name,
    status: record.status as VisitStatus,
    visit_date: record.visit_date,
    scheduled_at: record.scheduled_at,
    ends_at: record.ends_at,
    duration_minutes: record.duration_minutes,
    chief_complaint: record.chief_complaint,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

// ── Raw records (wire shape) ─────────────────────────────────────────────────
//
// Private to this file — everything else in the app talks to the UI-facing
// functions below, which convert to/from schemas/visit-schema.ts's Visit.

function fetchPatientVisitRecords(patientId: string): Promise<PatientVisits> {
  return apiFetch<PatientVisits>(`/visit/patient/${patientId}`);
}

function fetchVisitRecord(id: string): Promise<VisitRecord> {
  return apiFetch<VisitRecord>(`/visit/${id}`);
}

/** POST /visit — returns the created visit with `examine_by` as a plain string. */
export async function createVisit(body: VisitUpsertRequest): Promise<VisitCreate> {
  try {
    return await apiFetch<VisitCreate>("/visit", { method: "POST", body: JSON.stringify(body) });
  } finally {
    invalidateScheduleCache();
  }
}

/** PATCH /visit/:id reuses the create body; returns a message. */
async function patchVisitRecord(id: string, body: VisitUpsertRequest): Promise<void> {
  try {
    return await apiFetch<void>(`/visit/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  } finally {
    invalidateScheduleCache();
  }
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
  const { visits } = await fetchPatientVisitRecords(filters.patient_id);
  return visits
    .map((v) => toUiVisit(v, filters.patient_id!))
    .filter((v) => !filters.date || String(v.visit_date).slice(0, 10) === filters.date)
    .filter((v) => !filters.status || v.status === filters.status);
}

export async function getVisit(id: string): Promise<Visit | null> {
  try {
    const record = await fetchVisitRecord(id);
    return toUiVisit(record, record.patient.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * PATCH /visit/:id reuses the create body, so every update must send the whole
 * visit — including `scheduled_at`/`duration_minutes`, or the appointment time
 * could be reset. This builds that body from the current record.
 */
function bodyFrom(current: VisitRecord, over: Partial<VisitUpsertRequest> = {}): VisitUpsertRequest {
  return {
    patient_id: current.patient.id,
    examine_by: current.examine_by.id,
    status: current.status,
    visit_date: current.visit_date,
    scheduled_at: current.scheduled_at,
    duration_minutes: current.duration_minutes,
    chief_complaint: current.chief_complaint,
    ...over,
  };
}

export async function updateVisitStatus(id: string, status: VisitStatus): Promise<Visit> {
  const current = await fetchVisitRecord(id);
  await patchVisitRecord(id, bodyFrom(current, { status }));
  return toUiVisit({ ...current, status }, current.patient.id);
}

/**
 * Moves a visit to a new date AND time ("YYYY-MM-DD", "HH:MM", clinic-local)
 * in one PATCH. The backend stores the appointment start as `scheduled_at`.
 */
export async function updateVisitSchedule(id: string, dateIso: string, time: string): Promise<Visit> {
  const current = await fetchVisitRecord(id);
  const scheduled_at = toScheduledAt(dateIso, time);
  await patchVisitRecord(id, bodyFrom(current, { scheduled_at, visit_date: dateIso }));
  return toUiVisit({ ...current, scheduled_at, visit_date: dateIso }, current.patient.id);
}

/** Rewrites the chief complaint — used to re-tag an appointment's type. */
export async function updateVisitComplaint(id: string, chiefComplaint: string): Promise<Visit> {
  const current = await fetchVisitRecord(id);
  await patchVisitRecord(id, bodyFrom(current, { chief_complaint: chiefComplaint }));
  return toUiVisit({ ...current, chief_complaint: chiefComplaint }, current.patient.id);
}

// ── Clinical sub-documents ───────────────────────────────────────────────────
//
// Symptoms, refraction, exam findings, diagnoses, treatments, follow-ups and
// investigations are all backed by real endpoints under /visit/:id/*.

/** Backend shape of an investigation (GET/PUT /visit/:id/investigations). */
interface InvestigationWire {
  id?: string;
  visit_id?: string;
  type: string;
  eye?: "OD" | "OS" | "OU";
  result_value?: string;
  notes?: string;
}

const RESULT_MAX = 50; // result_value is capped at 50 characters server-side

function toWire(inv: Investigation): InvestigationWire {
  const result = inv.result ?? "";
  // Anything beyond the result field's limit is kept in the notes rather than dropped.
  const overflow = result.length > RESULT_MAX ? result.slice(RESULT_MAX) : "";
  const notes = [inv.notes, overflow].filter(Boolean).join(" ").slice(0, 255);
  return {
    type: inv.type,
    eye: inv.eye,
    result_value: result.slice(0, RESULT_MAX) || undefined,
    notes: notes || undefined,
  };
}

function fromWire(w: InvestigationWire): Investigation {
  return {
    id: w.id,
    visit_id: w.visit_id,
    type: w.type as Investigation["type"],
    eye: w.eye,
    result: w.result_value ?? undefined,
    notes: w.notes ?? undefined,
  };
}

/** GET /visit/:id/clinical — the whole chart (symptoms, readings, exam findings, diagnoses, treatments, follow-up) in one call. */
export function getVisitClinical(visitId: string): Promise<VisitClinical> {
  return apiFetch<VisitClinical>(`/visit/${visitId}/clinical`);
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
 */
export async function saveClinicalData(
  visitId: string,
  data: IntakeExamFormData,
  /** partial: a focused chart (the exam page) that must not wipe what other forms recorded — symptoms and treatments are left alone, intake-owned exam fields are kept, and investigations are upserted rather than replaced. */
  opts: { partial?: boolean } = {},
): Promise<void> {
  let examination = data.examination;
  if (opts.partial) {
    // PUT /examination replaces the whole document: carry over what only the intake form fills in.
    const current = await getVisitClinical(visitId).catch(() => null);
    const keep = current?.examination;
    if (keep) {
      examination = {
        ...data.examination,
        bp: keep.bp,
        convergence: keep.convergence,
        cover_test: keep.cover_test,
        eom: keep.eom,
        iop_time: keep.iop_time,
      };
    }
  }

  await Promise.all([
    opts.partial ? Promise.resolve() : updateVisitSymptoms(visitId, data.symptoms),
    updateVisitExamination(visitId, examination),
    Promise.all(data.readings.map((reading) => upsertVisitReading(visitId, reading))),
    updateVisitDiagnoses(visitId, data.diagnoses),
    opts.partial ? Promise.resolve() : updateVisitTreatments(visitId, data.treatments),
    data.follow_up ? updateVisitFollowUp(visitId, data.follow_up) : Promise.resolve(),
  ]);

  if (opts.partial) {
    // PATCH upserts by test name + eye, so entries made on the intake form survive an exam save.
    if (data.investigations.length > 0) {
      await apiFetch(`/visit/${visitId}/investigations`, {
        method: "PATCH",
        body: JSON.stringify({ investigations: data.investigations.map(toWire) }),
      });
    }
    return;
  }
  // Replace-all semantics: saving an empty list clears investigations that were removed.
  await apiFetch(`/visit/${visitId}/investigations`, {
    method: "PUT",
    body: JSON.stringify({ investigations: data.investigations.map(toWire) }),
  });
}

export async function getVisitInvestigations(visitId: string): Promise<Investigation[]> {
  const list = await apiFetch<InvestigationWire[] | null>(`/visit/${visitId}/investigations`);
  return (list ?? []).map(fromWire);
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

  const record = await createVisit({
    patient_id: patientId,
    // POST /visit expects the examiner's profile id; it resolves it to a
    // display ref internally.
    examine_by: staffUser?.id || data.examined_by || "",
    status: "completed",
    // A full-RFC3339 start; a date-only value would be ignored and treated as "now".
    scheduled_at: new Date().toISOString(),
    chief_complaint: data.chief_complaint,
  });

  await saveClinicalData(record.id, data);

  return {
    id: record.id,
    patient_id: record.patient_id,
    // Keep the display name for the UI, not the raw id the API echoes back.
    examined_by: staffUser?.name || data.examined_by || record.examine_by,
    status: record.status as VisitStatus,
    visit_date: record.visit_date ?? String(record.scheduled_at ?? "").slice(0, 10),
    scheduled_at: record.scheduled_at,
    duration_minutes: record.duration_minutes,
    chief_complaint: record.chief_complaint,
    created_at: record.created_at,
    updated_at: record.updated_at,
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
    getVisitClinical(visitId),
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
