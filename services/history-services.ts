import { apiFetch } from "./http";
import type { PatientHistory, PatientHistoryFormData } from "@/schemas/history-schema";
import type {
  CreatePatientHistoryRequest,
  PatientHistory as PatientHistoryRecord,
} from "@/types/patient-types";

function toUiPatientHistory(record: PatientHistoryRecord): PatientHistory {
  return {
    id: record.id,
    patient_id: record.patient_id,
    uses_spectacles: record.uses_spectacles,
    systemic_medications: record.systemic_medications,
    topical_medications: record.topical_medications,
    notes: record.notes,
    condition_ids: record.condition_ids,
    created_at: record.created_at,
    created_by: record.created_by,
  };
}

/** GET /patient/:id/history — every entry for the patient, newest first, each with its resolved condition_ids. */
function fetchPatientHistoryRecords(patientId: string): Promise<PatientHistoryRecord[]> {
  return apiFetch<PatientHistoryRecord[]>(`/patient/${patientId}/history`);
}

/** POST /patient/:id/history — appends a new entry; existing entries are never updated or deleted. */
function createPatientHistoryRecord(
  patientId: string,
  body: CreatePatientHistoryRequest
): Promise<PatientHistoryRecord> {
  return apiFetch<PatientHistoryRecord>(`/patient/${patientId}/history`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── UI-facing patient history API ────────────────────────────────────────────

export async function getPatientHistories(patientId: string): Promise<PatientHistory[]> {
  const records = await fetchPatientHistoryRecords(patientId);
  return records.map(toUiPatientHistory);
}

export async function getLatestPatientHistory(patientId: string): Promise<PatientHistory | null> {
  const histories = await getPatientHistories(patientId);
  return histories[0] ?? null;
}

export async function createPatientHistory(
  patientId: string,
  data: PatientHistoryFormData
): Promise<PatientHistory> {
  const record = await createPatientHistoryRecord(patientId, {
    uses_spectacles: data.uses_spectacles,
    systemic_medications: data.systemic_medications || undefined,
    topical_medications: data.topical_medications || undefined,
    notes: data.notes || undefined,
    condition_ids: data.condition_ids,
  });
  return toUiPatientHistory(record);
}
