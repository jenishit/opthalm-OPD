"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, ClipboardList, Loader2, LogIn, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/shadcn/dialog";
import { Field, FieldError, FieldLabel } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { FormField } from "@/components/forms";
import { Chip } from "@/components/ui/ChartUi";
import { PatientPicker } from "@/components/ui/PatientPicker";
import { bookingSchema, rescheduleSchema, type BookingForm, type RescheduleForm } from "@/schemas/booking-schema";
import type { QueueItem } from "@/services/queue-services";
import { visitDay } from "@/services/queue-services";
import { useAuthStore } from "@/stores/authStore";
import { TY, inferApptType, type ApptType } from "./appointment-type";
import { visitTime } from "./appointment-time";
import { STATUS_LABEL } from "./schedule-config";
import type { useScheduleActions } from "./useScheduleActions";

export type ModalState = { kind: "new"; date: string; time: string } | { kind: "edit"; visitId: string } | null;

type Actions = ReturnType<typeof useScheduleActions>;

function TypeChips({ value, onChange }: { value: ApptType; onChange: (t: ApptType) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Appointment type">
      {(Object.entries(TY) as [ApptType, (typeof TY)[ApptType]][]).map(([k, v]) => (
        <Chip key={k} on={value === k} onClick={() => onChange(k)}>
          {v.label}
        </Chip>
      ))}
    </div>
  );
}

function NewBooking({ date, time, actions, onClose }: { date: string; time: string; actions: Actions; onClose: () => void }) {
  const { control, handleSubmit, formState } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { patient: null, type: "new", date, time },
  });

  async function onSubmit(v: BookingForm) {
    if (!v.patient) return;
    if (await actions.book(v.patient, v.date, v.time, v.type)) onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3.5">
      <Controller
        control={control}
        name="patient"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Patient</FieldLabel>
            <PatientPicker customer={field.value} onSelect={field.onChange} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Field>
            <FieldLabel>Type</FieldLabel>
            <TypeChips value={field.value} onChange={field.onChange} />
          </Field>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField control={control} name="date" label="Date">
          {({ field, id, invalid }) => <Input {...field} id={id} type="date" aria-invalid={invalid} />}
        </FormField>
        <FormField control={control} name="time" label="Time">
          {({ field, id, invalid }) => <Input {...field} id={id} type="time" step={300} aria-invalid={invalid} />}
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CalendarClock className="size-4" />}
          Book appointment
        </Button>
      </div>
    </form>
  );
}

function ManageAppointment({ item, actions, onClose, readOnly }: { item: QueueItem; actions: Actions; onClose: () => void; readOnly: boolean }) {
  const role = useAuthStore((s) => s.staffUser?.role);
  const { visit, patient } = item;
  const { control, handleSubmit, formState } = useForm<RescheduleForm>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: { date: visitDay(item), time: visitTime(visit) ?? "09:00" },
  });
  const type = inferApptType(visit.chief_complaint);
  const active = visit.status === "scheduled" || visit.status === "waiting";

  async function onReschedule(v: RescheduleForm) {
    if (await actions.move(item, v.date, v.time)) onClose();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-display text-lg font-semibold text-foreground">
          {patient.first_name} {patient.last_name}
        </div>
        <div className="text-sm text-muted-foreground">
          {STATUS_LABEL[visit.status]} · {visitDay(item)} {visitTime(visit) ?? ""}
        </div>
      </div>

      {!readOnly && active && (
        <div>
          <div className="mono-label mb-1.5">Type</div>
          <TypeChips value={type} onChange={(t) => void actions.retype(item, t)} />
        </div>
      )}

      {!readOnly && active && (
        <form onSubmit={handleSubmit(onReschedule)} noValidate className="flex flex-wrap items-end gap-3">
          <FormField control={control} name="date" label="Date" className="w-40">
            {({ field, id, invalid }) => <Input {...field} id={id} type="date" aria-invalid={invalid} />}
          </FormField>
          <FormField control={control} name="time" label="Time" className="w-32">
            {({ field, id, invalid }) => <Input {...field} id={id} type="time" step={300} aria-invalid={invalid} />}
          </FormField>
          <Button type="submit" variant="secondary" disabled={formState.isSubmitting}>
            {formState.isSubmitting && <Loader2 className="size-4 animate-spin" />} Reschedule
          </Button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {!readOnly && visit.status === "scheduled" && (
          <Button onClick={async () => (await actions.setStatus(item, "waiting", "Checked in")) && onClose()}>
            <LogIn className="size-4" /> Check in
          </Button>
        )}
        {(role === "doctor" || role === "admin") && visit.status !== "cancelled" && (
          <Button variant="secondary" asChild>
            <Link href="/examinations"><ClipboardList className="size-4" />Open consultation</Link>
          </Button>
        )}
        <Button variant="ghost" asChild>
          <Link href={`/patients/${patient.id}`}><UserRound className="size-4" />Record</Link>
        </Button>
        <div className="flex-1" />
        {!readOnly && active && (
          <Button variant="ghost" onClick={async () => (await actions.setStatus(item, "cancelled", "Appointment cancelled")) && onClose()}>
            <Trash2 className="size-4" /> Cancel visit
          </Button>
        )}
      </div>
    </div>
  );
}

export function BookingDialog({
  modal,
  items,
  actions,
  readOnly,
  onClose,
}: {
  modal: ModalState;
  items: QueueItem[];
  actions: Actions;
  readOnly: boolean;
  onClose: () => void;
}) {
  const current = modal?.kind === "edit" ? items.find((i) => i.visit.id === modal.visitId) : null;
  return (
    <Dialog open={!!modal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogTitle>{modal?.kind === "new" ? "New appointment" : "Appointment"}</DialogTitle>
        {modal?.kind === "new" && !readOnly && (
          // Keyed so the form restarts for each slot that is opened.
          <NewBooking key={`${modal.date}-${modal.time}`} date={modal.date} time={modal.time} actions={actions} onClose={onClose} />
        )}
        {modal?.kind === "edit" && current && <ManageAppointment key={current.visit.id} item={current} actions={actions} onClose={onClose} readOnly={readOnly} />}
        {modal?.kind === "edit" && !current && <p className="py-6 text-center text-sm text-muted-foreground">This appointment is no longer on the schedule.</p>}
      </DialogContent>
    </Dialog>
  );
}
