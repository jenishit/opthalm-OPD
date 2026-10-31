import type { Visit, VisitStatus } from "@/schemas/visit-schema";
import type { Patient } from "@/schemas/patient-schema";
import { getPatients } from "@/services/patients-services";
import { getVisits } from "@/services/visits-services";

export interface QueueItem {
  visit: Visit;
  patient: Patient;
}

function sortByCreatedAt(items: QueueItem[]): QueueItem[] {
  return items.sort((a, b) => {
    const dateA = a.visit.created_at ? new Date(a.visit.created_at).getTime() : 0;
    const dateB = b.visit.created_at ? new Date(b.visit.created_at).getTime() : 0;
    return dateA - dateB;
  });
}

/**
 * Today's queue.
 *
 * The backend has no dedicated queue endpoint — it is assembled from the
 * patients list plus each patient's visits (GET /visit/patient/:id),
 * filtered to visit_date = today.
 */
export async function getTodayQueue(status?: VisitStatus): Promise<QueueItem[]> {
  const today = new Date().toISOString().split("T")[0];

  const patients = await getPatients();
  const visitLists = await Promise.all(patients.map((patient) => getVisits({ patient_id: patient.id })));

  const queueItems: QueueItem[] = [];
  patients.forEach((patient, index) => {
    for (const visit of visitLists[index] ?? []) {
      // The backend returns visit_date with a time portion
      // ("2026-10-25T00:00:00Z"); compare on the date part only.
      if (String(visit.visit_date).slice(0, 10) !== today) continue;
      if (status && visit.status !== status) continue;
      queueItems.push({ visit, patient });
    }
  });

  return sortByCreatedAt(queueItems);
}

/**
 * All visits whose visit_date falls within [startDate, endDate] (both
 * "YYYY-MM-DD", inclusive) — backs the Week and Month appointment views.
 *
 * Same N+1 assembly as getTodayQueue (no dedicated range endpoint on the
 * backend yet): fetch every patient, then every patient's visits, then
 * filter client-side.
 */
export async function getQueueForRange(startDate: string, endDate: string): Promise<QueueItem[]> {
  const patients = await getPatients();
  const visitLists = await Promise.all(patients.map((patient) => getVisits({ patient_id: patient.id })));

  const queueItems: QueueItem[] = [];
  patients.forEach((patient, index) => {
    for (const visit of visitLists[index] ?? []) {
      const date = String(visit.visit_date).slice(0, 10);
      if (date < startDate || date > endDate) continue;
      queueItems.push({ visit, patient });
    }
  });

  return sortByCreatedAt(queueItems);
}
