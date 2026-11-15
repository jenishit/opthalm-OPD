import type { Control } from "react-hook-form";
import { Check, Printer } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import { FormField, NativeSelect } from "@/components/forms";
import { PatientPicker } from "@/components/ui/PatientPicker";
import type { RxFormValues } from "@/schemas/rx-form-schema";
import type { Patient } from "@/schemas/patient-schema";
import { LENS_TYPE_LABEL, type LensType, type RxStatus } from "../../_components/types";
import { RxEyeTable } from "./RxEyeTable";
import { VALID_MONTHS, fieldClass } from "./rx-utils";

const LENS_TYPES: LensType[] = ["single_vision", "bifocal", "progressive", "contact_lens", "none"];
const label = "text-sm font-medium text-ink";
const control_ = `${fieldClass} aria-invalid:border-destructive`;

export function RxEditor({
  control,
  status,
  isNew,
  picked,
  existingPatientName,
  saving,
  readOnly = false,
  onPickPatient,
}: {
  control: Control<RxFormValues>;
  status: RxStatus;
  isNew: boolean;
  /** The patient chosen in the picker (null until one is selected). */
  picked: Patient | null;
  existingPatientName: string;
  saving: boolean;
  readOnly?: boolean;
  onPickPatient: (patient: Patient | null) => void;
}) {
  return (
    <Card className="flex flex-col gap-4 p-5 print:hidden">
      <fieldset disabled={readOnly} className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">Prescription details</h3>
          <p className="text-sm text-muted-foreground">Patient and examination information</p>
        </div>
        <Badge variant={status === "issued" ? "default" : "secondary"}>{status === "issued" ? "Issued" : "Draft"}</Badge>
      </div>

      {isNew ? (
        <FormField control={control} name="patientId" label="Patient" labelClassName={label}>
          {() => <PatientPicker customer={picked} onSelect={onPickPatient} />}
        </FormField>
      ) : (
        <div className="flex flex-col gap-1.5">
          <span className={label}>Patient</span>
          <div className={`${fieldClass} bg-app text-mute`}>{existingPatientName}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField control={control} name="issuedAt" label="Prescription date" labelClassName={label}>
          {({ field, id, invalid }) => <input {...field} id={id} type="date" aria-invalid={invalid} className={control_} />}
        </FormField>
        <FormField control={control} name="lensType" label="Lens type" labelClassName={label}>
          {({ field, id, invalid }) => (
            <NativeSelect {...field} id={id} aria-invalid={invalid} className={control_}>
              {LENS_TYPES.map((t) => <option key={t} value={t}>{LENS_TYPE_LABEL[t]}</option>)}
            </NativeSelect>
          )}
        </FormField>
      </div>

      <RxEyeTable control={control} />

      <div className="grid grid-cols-2 gap-3">
        <FormField control={control} name="pd" label="Pupillary distance (PD)" labelClassName={label}>
          {({ field, id, invalid }) => <input {...field} id={id} type="number" placeholder="mm" aria-invalid={invalid} className={control_} />}
        </FormField>
        <FormField control={control} name="validMonths" label="Prescription valid for" labelClassName={label}>
          {({ field, id, invalid }) => (
            <NativeSelect {...field} id={id} aria-invalid={invalid} className={control_}>
              {VALID_MONTHS.map((m) => <option key={m} value={m}>{m} months</option>)}
            </NativeSelect>
          )}
        </FormField>
      </div>

      <FormField control={control} name="notes" label="Notes" labelClassName={label}>
        {({ field, id, invalid }) => <textarea {...field} id={id} rows={3} aria-invalid={invalid} className={control_} />}
      </FormField>

      </fieldset>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print
        </Button>
        {!readOnly && (
          <Button type="submit" disabled={saving}>
            <Check className="size-4" />
            Save prescription
          </Button>
        )}
      </div>
    </Card>
  );
}
