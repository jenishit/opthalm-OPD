import type { Visit, VisitStatus } from "@/lib/schemas/visit.schema";
import type { Patient } from "@/lib/schemas/patient.schema";
import { listPatientDtos, toUiPatient } from "@/services/patients";
import { getPatientVisitDtos, toUiVisit } from "@/services/visits";

export interface QueueItem {
  visit: Visit;
  patient: Patient;
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

  const patients = await listPatientDtos();
  const visitLists = await Promise.all(
    patients.map((patient) => getPatientVisitDtos(patient.patient_id))
  );

  const queueItems: QueueItem[] = [];
  patients.forEach((patientDto, index) => {
    for (const dto of visitLists[index]?.visits ?? []) {
      if (dto.visit_date !== today) continue;
      if (status && dto.status !== status) continue;
      queueItems.push({
        visit: toUiVisit(dto, patientDto.patient_id),
        patient: toUiPatient(patientDto),
      });
    }
  });

  // Sort by created_at ascending (oldest first in queue)
  return queueItems.sort((a, b) => {
    const dateA = a.visit.created_at ? new Date(a.visit.created_at).getTime() : 0;
    const dateB = b.visit.created_at ? new Date(b.visit.created_at).getTime() : 0;
    return dateA - dateB;
  });
}
