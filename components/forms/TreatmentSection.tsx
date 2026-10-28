"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { IntakeExamFormData } from "@/schemas/shared-schema";
import { Pill, Trash2, Calendar } from "lucide-react";
import { CatalogCombobox } from "./CatalogCombobox";
import { NepaliDateField } from "@/components/ui";

const fieldCls =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";
const smallLabelCls = "block text-xs font-medium text-muted-foreground mb-1";
const chipBtnCls =
  "rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function TreatmentSection() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<IntakeExamFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "treatments",
  });

  return (
    <div className="space-y-6">
      {/* Treatments List */}
      <div className="bg-card p-6 rounded-2xl border border-border/60 ">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-5">
          <Pill className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-medium text-foreground">Treatment Plan</h3>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px] max-w-md">
            <label className="block text-sm font-medium text-foreground mb-1.5">Add Medication</label>
            <CatalogCombobox
              catalogType="medicines"
              placeholder="Search medication..."
              onSelect={(id, name) => {
                append({
                  type: "medicine",
                  medicine_id: id,
                  medicine_name: name,
                  dosage: "1 drop",
                  frequency: "BD (Twice a day)",
                  route: "Topical",
                  duration: "1 week",
                });
              }}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => append({ type: "procedure", procedure_name: "" })}
              className={chipBtnCls}
            >
              Add Procedure
            </button>
            <button
              type="button"
              onClick={() => append({ type: "advice", advice_text: "" })}
              className={chipBtnCls}
            >
              Add Advice
            </button>
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/40 rounded-2xl border border-dashed border-border">
            No treatments added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => {
              const type = watch(`treatments.${index}.type`);

              return (
                <div key={field.id} className="relative bg-muted/40 p-5 rounded-2xl border border-border/40 pr-12">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <input type="hidden" {...register(`treatments.${index}.type`)} />

                  {type === "medicine" && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          Medication
                        </span>
                        <span className="font-semibold text-foreground">{watch(`treatments.${index}.medicine_name`)}</span>
                        <input type="hidden" {...register(`treatments.${index}.medicine_id`)} />
                        <input type="hidden" {...register(`treatments.${index}.medicine_name`)} />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <div>
                          <label className={smallLabelCls}>Dosage</label>
                          <input type="text" {...register(`treatments.${index}.dosage`)} className={fieldCls} />
                        </div>
                        <div>
                          <label className={smallLabelCls}>Frequency</label>
                          <input type="text" {...register(`treatments.${index}.frequency`)} className={fieldCls} />
                        </div>
                        <div>
                          <label className={smallLabelCls}>Route</label>
                          <input type="text" {...register(`treatments.${index}.route`)} className={fieldCls} />
                        </div>
                        <div>
                          <label className={smallLabelCls}>Duration</label>
                          <input type="text" {...register(`treatments.${index}.duration`)} className={fieldCls} />
                        </div>
                      </div>
                    </div>
                  )}

                  {type === "procedure" && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-clay-soft px-2.5 py-0.5 text-xs font-semibold text-clay-ink">
                          Procedure
                        </span>
                      </div>
                      <div>
                        <label className={smallLabelCls}>Procedure Name</label>
                        <input
                          type="text"
                          {...register(`treatments.${index}.procedure_name`)}
                          placeholder="e.g. Syringing, YAG Capsulotomy"
                          className={fieldCls}
                        />
                      </div>
                    </div>
                  )}

                  {type === "advice" && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-status-examining-bg px-2.5 py-0.5 text-xs font-semibold text-status-examining-ink">
                          Advice
                        </span>
                      </div>
                      <div>
                        <label className={smallLabelCls}>Instructions / Advice</label>
                        <textarea
                          {...register(`treatments.${index}.advice_text`)}
                          rows={2}
                          placeholder="e.g. Use warm compresses, Avoid rubbing eyes"
                          className={fieldCls}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Follow Up */}
      <div className="bg-card p-6 rounded-2xl border border-border/60 ">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-5">
          <Calendar className="h-5 w-5 text-clay" />
          <h3 className="font-display text-lg font-medium text-foreground">Follow-up Plan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Follow-up date</label>
            <div className="max-w-xs">
              <NepaliDateField
                label="Follow-up date"
                value={watch("follow_up.follow_up_date") ?? ""}
                onChange={(next) =>
                  setValue("follow_up.follow_up_date", next ?? "", { shouldDirty: true })
                }
              />
            </div>
            {errors.follow_up && "follow_up_date" in errors.follow_up ? (
              <p className="mt-1 text-xs text-destructive">{errors.follow_up.follow_up_date?.message}</p>
            ) : null}
            <p className="text-xs text-muted-foreground mt-1.5">Leave blank if no follow-up needed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Reason for follow-up</label>
            <input
              type="text"
              {...register("follow_up.reason")}
              placeholder="e.g. Review IOP, Check response to meds"
              className={fieldCls}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
