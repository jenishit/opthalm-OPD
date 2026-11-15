"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Field, FieldError, FieldLabel } from "@/components/shadcn/field";
import { FormField, NativeSelect } from "@/components/forms";
import { PatientPicker } from "@/components/ui/PatientPicker";
import { labOrderSchema, type LabOrderForm } from "@/schemas/lab-order-schema";
import { ApiError } from "@/services/http";
import { createLabJob } from "@/services/lab-services";

const JOB_TYPES = ["Spectacles – single vision", "Spectacles – progressive", "Spectacles – bifocal", "Lens replacement", "Sunglasses – prescription", "Contact lenses", "Repair"];
const DEFAULTS: LabOrderForm = { patient: null, jobType: JOB_TYPES[0], expected: "", advance: "", notes: "" };

export function NewOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const { control, handleSubmit, reset, formState } = useForm<LabOrderForm>({
    resolver: zodResolver(labOrderSchema),
    defaultValues: DEFAULTS,
  });

  const close = (next: boolean) => {
    if (!next) reset(DEFAULTS);
    onOpenChange(next);
  };

  async function onSubmit(v: LabOrderForm) {
    if (!v.patient) return;
    try {
      await createLabJob({
        patient_id: v.patient.id,
        job_type: v.jobType,
        expected_delivery_date: v.expected || undefined,
        advance_payment: v.advance ? Number(v.advance) : undefined,
        notes: v.notes || undefined,
      });
      toast.success("Order created");
      close(false);
      onCreated();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to create the order");
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogTitle>New customer order</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          {/* A custom control (patient search) plugs into RHF through Controller. */}
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
          <FormField control={control} name="jobType" label="Order type">
            {({ field, id, invalid }) => (
              <NativeSelect {...field} id={id} aria-invalid={invalid}>
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </NativeSelect>
            )}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField control={control} name="expected" label="Expected delivery">
              {({ field, id, invalid }) => <Input {...field} id={id} type="date" aria-invalid={invalid} />}
            </FormField>
            <FormField control={control} name="advance" label="Advance paid">
              {({ field, id, invalid }) => <Input {...field} id={id} type="number" min={0} step="0.01" aria-invalid={invalid} />}
            </FormField>
          </div>
          <FormField control={control} name="notes" label="Notes">
            {({ field, id, invalid }) => <Input {...field} id={id} placeholder="Frame, lens, coating…" aria-invalid={invalid} />}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => close(false)}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="size-4 animate-spin" />} Create order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
