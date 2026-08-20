import { getVisits } from "./visits";
import { getPatient } from "./patients";
import type { Visit, VisitStatus } from "@/lib/schemas/visit.schema";
import type { Patient } from "@/lib/schemas/patient.schema";

export interface QueueItem {
  visit: Visit;
  patient: Patient;
}

export async function getTodayQueue(status?: VisitStatus): Promise<QueueItem[]> {
  const today = new Date().toISOString().split("T")[0];
  const visits = await getVisits({ date: today, status });
  
  const queueItems: QueueItem[] = [];
  
  for (const visit of visits) {
    const patient = await getPatient(visit.patient_id);
    if (patient) {
      queueItems.push({ visit, patient });
    }
  }
  
  // Sort by created_at ascending (oldest first in queue)
  return queueItems.sort((a, b) => {
    const dateA = a.visit.created_at ? new Date(a.visit.created_at).getTime() : 0;
    const dateB = b.visit.created_at ? new Date(b.visit.created_at).getTime() : 0;
    return dateA - dateB;
  });
}
