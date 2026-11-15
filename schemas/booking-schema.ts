import * as z from "zod";
import type { Patient } from "./patient-schema";

export const apptTypes = ["new", "fu", "surg"] as const;

const timeField = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a time like 14:30");
const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");

/** New appointment: patient + type + when. */
export const bookingSchema = z.object({
  patient: z.custom<Patient | null>((v) => v != null, "Select a patient"),
  type: z.enum(apptTypes),
  date: dateField,
  time: timeField,
});
export type BookingForm = z.infer<typeof bookingSchema>;

/** Rescheduling an existing appointment. */
export const rescheduleSchema = z.object({ date: dateField, time: timeField });
export type RescheduleForm = z.infer<typeof rescheduleSchema>;
