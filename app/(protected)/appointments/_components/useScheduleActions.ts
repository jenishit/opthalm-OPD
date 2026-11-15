"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { toScheduledAt } from "@/lib/clinic-time";
import { ApiError } from "@/services/http";
import { createVisit, updateVisitComplaint, updateVisitSchedule, updateVisitStatus } from "@/services/visits-services";
import type { QueueItem } from "@/services/queue-services";
import type { Patient } from "@/schemas/patient-schema";
import type { VisitStatus } from "@/schemas/visit-schema";
import { useAuthStore } from "@/stores/authStore";
import { apptTypeComplaint, type ApptType } from "./appointment-type";

const fail = (e: unknown, fallback: string) => toast.error(e instanceof ApiError ? e.message : fallback);

/** Server-backed schedule mutations. Each one awaits the API, reports the real outcome, then refreshes. */
export function useScheduleActions(onChanged: () => void) {
  const staffId = useAuthStore((s) => s.staffUser?.id ?? "");

  const book = useCallback(
    async (patient: Patient, date: string, time: string, type: ApptType): Promise<boolean> => {
      try {
        await createVisit({
          patient_id: patient.id,
          examine_by: staffId,
          status: "scheduled",
          scheduled_at: toScheduledAt(date, time),
          visit_date: date,
          chief_complaint: apptTypeComplaint(type),
        });
        toast.success(`Booked ${patient.first_name} ${patient.last_name} · ${date} ${time}`);
        onChanged();
        return true;
      } catch (e) {
        fail(e, "Couldn't book the appointment");
        return false;
      }
    },
    [staffId, onChanged],
  );

  const move = useCallback(
    async (item: QueueItem, date: string, time: string): Promise<boolean> => {
      try {
        await updateVisitSchedule(item.visit.id, date, time);
        toast.success("Appointment moved");
        onChanged();
        return true;
      } catch (e) {
        fail(e, "Couldn't move the appointment");
        return false;
      }
    },
    [onChanged],
  );

  const retype = useCallback(
    async (item: QueueItem, type: ApptType): Promise<boolean> => {
      try {
        await updateVisitComplaint(item.visit.id, apptTypeComplaint(type));
        onChanged();
        return true;
      } catch (e) {
        fail(e, "Couldn't change the appointment type");
        return false;
      }
    },
    [onChanged],
  );

  const setStatus = useCallback(
    async (item: QueueItem, status: VisitStatus, okMessage: string): Promise<boolean> => {
      try {
        await updateVisitStatus(item.visit.id, status);
        toast.success(okMessage);
        onChanged();
        return true;
      } catch (e) {
        fail(e, "Couldn't update the appointment");
        return false;
      }
    },
    [onChanged],
  );

  return { book, move, retype, setStatus };
}
