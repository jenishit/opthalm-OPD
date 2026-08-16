import { delay } from "@/lib/mock/delay";
import { mockPatientHistories, mockConditions } from "@/lib/mock/data";
import type { PatientHistory, PatientHistoryFormData } from "@/lib/schemas/history.schema";

let histories = [...mockPatientHistories];

export async function getPatientHistories(patientId: string): Promise<PatientHistory[]> {
  await delay();
  return histories
    .filter((h) => h.patient_id === patientId)
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Descending
    });
}

export async function getLatestPatientHistory(patientId: string): Promise<PatientHistory | null> {
  const patientHistories = await getPatientHistories(patientId);
  return patientHistories[0] ?? null;
}

export async function createPatientHistory(
  patientId: string,
  data: PatientHistoryFormData,
  staffId?: string
): Promise<PatientHistory> {
  await delay();
  
  const newHistory: PatientHistory = {
    ...data,
    id: `ph${Date.now()}`,
    patient_id: patientId,
    created_at: new Date().toISOString(),
    created_by: staffId,
  };
  
  histories = [newHistory, ...histories];
  return newHistory;
}
