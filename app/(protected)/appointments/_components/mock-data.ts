import type { QueueItem } from "@/services/queue-services";

const today = new Date().toISOString().slice(0, 10);

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Sample queue entries shown only when today's real queue (from
 * getTodayQueue) comes back empty — there's no dedicated appointments
 * backend yet, so a fresh environment has nothing to display otherwise.
 * Flagged in DaySchedule as sample data so staff never mistake these for
 * real scheduled visits.
 */
export const MOCK_QUEUE: QueueItem[] = [
  {
    patient: {
      id: "mock-sarah-johnson",
      first_name: "Sarah",
      last_name: "Johnson",
      phone: "9800000001",
      age: 34,
      sex: "Female",
    },
    visit: {
      id: "mock-visit-1",
      patient_id: "mock-sarah-johnson",
      examined_by: "Mitchell",
      status: "examining",
      visit_date: today,
      chief_complaint: "Comprehensive eye exam",
      created_at: todayAt(9, 0),
    },
  },
  {
    patient: {
      id: "mock-michael-chen",
      first_name: "Michael",
      last_name: "Chen",
      phone: "9800000002",
      age: 41,
      sex: "Male",
    },
    visit: {
      id: "mock-visit-2",
      patient_id: "mock-michael-chen",
      examined_by: "Lee",
      status: "waiting",
      visit_date: today,
      chief_complaint: "Refraction check",
      created_at: todayAt(9, 30),
    },
  },
  {
    patient: {
      id: "mock-emily-davis",
      first_name: "Emily",
      last_name: "Davis",
      phone: "9800000003",
      age: 28,
      sex: "Female",
    },
    visit: {
      id: "mock-visit-3",
      patient_id: "mock-emily-davis",
      examined_by: "Mitchell",
      status: "completed",
      visit_date: today,
      chief_complaint: "Follow-up visit",
      created_at: todayAt(10, 0),
    },
  },
  {
    patient: {
      id: "mock-david-wilson",
      first_name: "David",
      last_name: "Wilson",
      phone: "9800000004",
      age: 52,
      sex: "Male",
    },
    visit: {
      id: "mock-visit-4",
      patient_id: "mock-david-wilson",
      status: "scheduled",
      visit_date: today,
      chief_complaint: "New patient consultation",
      created_at: todayAt(10, 30),
    },
  },
  {
    patient: {
      id: "mock-olivia-martinez",
      first_name: "Olivia",
      last_name: "Martinez",
      phone: "9800000005",
      age: 23,
      sex: "Female",
    },
    visit: {
      id: "mock-visit-5",
      patient_id: "mock-olivia-martinez",
      status: "scheduled",
      visit_date: today,
      chief_complaint: "Contact lens fitting",
      created_at: todayAt(11, 0),
    },
  },
];
