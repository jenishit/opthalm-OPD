"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import SectionHeading from "../../../dashboard/_components/SectionHeading";
import { usePrescriptionStore } from "../../_components/store";
import type { PrescriptionRecord } from "../../_components/types";
import type { Patient } from "@/schemas/patient-schema";
import { rxFormSchema, type RxFormValues } from "@/schemas/rx-form-schema";
import { useAuthStore } from "@/stores/authStore";
import { RxEditor } from "./RxEditor";
import { RxPreview } from "./RxPreview";
import { newRecord, toFormValues, toRecord } from "./rx-utils";

export function PrescriptionEditor({ existing, isNew, id }: { existing: PrescriptionRecord | undefined; isNew: boolean; id: string }) {
  const router = useRouter();
  const staffUser = useAuthStore((s) => s.staffUser);
  const upsert = usePrescriptionStore((s) => s.upsert);
  const readOnly = existing?.source === "visit";

  // The record's identity (id, Rx number, signer) is fixed for this editing session;
  // everything the user can change lives in the form.
  const [base] = useState<PrescriptionRecord>(
    () => existing ?? newRecord(isNew ? `rx${Date.now()}` : id, staffUser?.name ?? "Staff"),
  );
  const [picked, setPicked] = useState<Patient | null>(null);

  const { control, handleSubmit, setValue, formState } = useForm<RxFormValues>({
    resolver: zodResolver(rxFormSchema) as Resolver<RxFormValues>,
    defaultValues: toFormValues(base),
  });
  const values = useWatch({ control }) as RxFormValues;
  // Live preview record, rebuilt from the current form values.
  const rx = useMemo(() => toRecord(values, base), [values, base]);

  const pickPatient = (p: Patient | null) => {
    setPicked(p);
    setValue("patientId", p?.id ?? "", { shouldValidate: true });
    setValue("patientName", p ? `${p.first_name} ${p.last_name}` : "");
  };

  const save = handleSubmit(
    (v) => {
      upsert({ ...toRecord(v, base), status: "issued" });
      toast.success("Prescription saved and attached to patient record");
      if (isNew) router.replace(`/prescriptions/${base.id}`);
    },
    () => toast.error("Fix the highlighted fields and try again"),
  );

  return (
    <>
      <SectionHeading
        eyebrow="REFRACTION & OPTICAL CARE"
        title={isNew ? "New prescription" : base.patientName}
        description={readOnly ? "Issued from the examination's final refraction. Edit the visit to change it." : "Saved in this browser only — it is not stored on the server."}
        actions={
          <Button variant="ghost" asChild>
            <Link href="/prescriptions"><ArrowLeft className="size-4" />All prescriptions</Link>
          </Button>
        }
      />
      <form onSubmit={save} noValidate className="grid items-start gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <RxEditor
          control={control}
          status={existing?.status ?? "draft"}
          isNew={isNew}
          picked={picked}
          existingPatientName={base.patientName}
          saving={formState.isSubmitting}
          readOnly={readOnly}
          onPickPatient={pickPatient}
        />
        <RxPreview rx={rx} />
      </form>
    </>
  );
}
