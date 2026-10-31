import type { QueueItem } from "@/services/queue-services";
import { mockPatients } from "@/lib/mock/data";
import { addDays, iso } from "@/lib/utils";

const PLAN = [
  { dayOffset: 0, hour: 9, patientIndex: 0, complaint: "New patient consultation" },
  { dayOffset: 0, hour: 11, patientIndex: 1, complaint: "Follow-up visit" },
  { dayOffset: 1, hour: 10, patientIndex: 2, complaint: "Cataract surgery" },
  { dayOffset: 2, hour: 9, patientIndex: 3, complaint: "New patient consultation" },
  { dayOffset: 2, hour: 14, patientIndex: 4, complaint: "Follow-up visit" },
  { dayOffset: 3, hour: 11, patientIndex: 5, complaint: "New patient consultation" },
  { dayOffset: 4, hour: 15, patientIndex: 6, complaint: "Follow-up visit" },
] as const;

function at(day: Date, hour: number): string {
  const d = new Date(day);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/**
 * Sample week of appointments shown only when the real schedule for the
 * viewed week comes back empty — placed relative to the given Monday so the
 * sample always lands inside whichever week is currently on screen.
 */
export function getMockWeekQueue(monday: Date): QueueItem[] {
  return PLAN.filter((p) => p.patientIndex < mockPatients.length).map((p, i) => {
    const patient = mockPatients[p.patientIndex];
    const day = addDays(monday, p.dayOffset);
    return {
      patient,
      visit: {
        id: `mock-week-visit-${i}`,
        patient_id: patient.id,
        status: "scheduled",
        visit_date: iso(day),
        chief_complaint: p.complaint,
        created_at: at(day, p.hour),
      },
    };
  });
}
