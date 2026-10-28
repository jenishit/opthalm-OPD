"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { IntakeExamFormData } from "@/schemas/shared-schema";
import { Stethoscope, Trash2 } from "lucide-react";
import { CatalogCombobox } from "./CatalogCombobox";

const selectClass =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";
const microLabel = "block text-xs font-medium text-muted-foreground mb-1.5";

export function DiagnosisSection() {
  const { register, control, watch, formState: { errors } } = useFormContext<IntakeExamFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "diagnoses",
  });

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border border-border/60 ">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3 mb-5">
          <span className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Stethoscope className="h-4 w-4" />
          </span>
          <h3 className="font-display text-lg font-medium text-foreground">Diagnosis</h3>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Add Diagnosis</label>
          <div className="max-w-md">
            <CatalogCombobox
              catalogType="diagnoses"
              placeholder="Search diagnosis (e.g. Cataract, Glaucoma)..."
              onSelect={(id, name, fullItem) => {
                // Check if already added
                if (!fields.some(f => f.diagnosis_id === id)) {
                  append({
                    diagnosis_id: id,
                    diagnosis_name: name,
                    icd10_code: fullItem.icd10_code,
                    laterality: "OU",
                    status: "provisional",
                  });
                }
              }}
            />
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/40 rounded-2xl border border-dashed border-border">
            No diagnosis added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="relative bg-muted/40 p-4 rounded-2xl border border-border/60 pr-12 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-3 right-3 md:top-auto md:bottom-3 p-1.5 text-muted-foreground rounded-full hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex-1">
                  <div className="font-semibold text-foreground">{field.diagnosis_name}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {field.diagnosis_id} {field.icd10_code && `| ICD-10: ${field.icd10_code}`}
                  </div>
                  {/* Hidden inputs to keep values */}
                  <input type="hidden" {...register(`diagnoses.${index}.diagnosis_id`)} />
                  <input type="hidden" {...register(`diagnoses.${index}.diagnosis_name`)} />
                  <input type="hidden" {...register(`diagnoses.${index}.icd10_code`)} />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <div className="flex-1 md:w-32">
                    <label className={microLabel}>Laterality</label>
                    <select
                      {...register(`diagnoses.${index}.laterality`)}
                      className={selectClass}
                    >
                      <option value="OD">Right Eye (OD)</option>
                      <option value="OS">Left Eye (OS)</option>
                      <option value="OU">Both Eyes (OU)</option>
                    </select>
                  </div>
                  <div className="flex-1 md:w-36">
                    <label className={microLabel}>Status</label>
                    <select
                      {...register(`diagnoses.${index}.status`)}
                      className={selectClass}
                    >
                      <option value="provisional">Provisional</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {errors.diagnoses && <p className="text-sm text-destructive mt-2">{errors.diagnoses.message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
