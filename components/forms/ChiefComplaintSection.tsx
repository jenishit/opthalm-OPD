"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { IntakeExamFormData } from "@/schemas/shared-schema";
import { CatalogCombobox } from "./CatalogCombobox";

const fieldClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";

export function ChiefComplaintSection() {
  const { register, formState: { errors }, watch, setValue } = useFormContext<IntakeExamFormData>();

  const usesSpectacles = watch("history.uses_spectacles");
  const conditionIds = watch("history.condition_ids") || [];

  return (
    <div className="space-y-8">
      {/* Chief Complaint */}
      <div className="bg-card p-6 rounded-2xl border border-border/60 ">
        <h3 className="font-display text-lg font-medium text-foreground border-b border-border/60 pb-3 mb-5">Current Visit</h3>

        <div className="grid gap-5">
          <div>
            <label className={labelClass}>Chief Complaint <span className="text-destructive">*</span></label>
            <textarea
              {...register("chief_complaint")}
              rows={3}
              placeholder="E.g., Blurring of vision in both eyes for 2 weeks, associated with headache."
              className={fieldClass}
            />
            {errors.chief_complaint && <p className="mt-1.5 text-sm text-destructive">{errors.chief_complaint.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Duration</label>
            <input
              {...register("complaint_duration")}
              type="text"
              placeholder="E.g., 2 weeks"
              className={`${fieldClass} max-w-xs`}
            />
          </div>

          <div>
            <label className={labelClass}>Examining Doctor</label>
            <input
              {...register("examined_by")}
              type="text"
              className={`${fieldClass} max-w-xs`}
            />
          </div>
        </div>
      </div>

      {/* History (carried forward) */}
      <div className="bg-card p-6 rounded-2xl border border-border/60 border-l-4 border-l-clay">
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-border/60 pb-3 mb-5">
          <h3 className="font-display text-lg font-medium text-foreground">Patient History</h3>
          <span className="text-xs bg-clay-soft text-clay-ink border border-clay/20 px-2.5 py-1 rounded-full font-medium">Carried Forward &amp; Editable</span>
        </div>

        <div className="grid gap-6">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="uses_spectacles"
              className="h-4 w-4 rounded border-input accent-primary"
              {...register("history.uses_spectacles")}
            />
            <label htmlFor="uses_spectacles" className="block text-sm font-medium text-foreground">
              Patient currently uses spectacles
            </label>
          </div>

          <div>
            <label className={labelClass}>Known Systemic/Ocular Conditions</label>
            <p className="text-xs text-muted-foreground mb-3">Add or remove conditions. This updates the patient&apos;s ongoing history timeline.</p>

            <div className="mb-3 flex flex-wrap gap-2">
              {conditionIds.length === 0 ? (
                <span className="text-sm text-muted-foreground">No conditions added yet.</span>
              ) : (
                conditionIds.map((id) => (
                  <div key={id} className="bg-muted border border-border/60 rounded-full flex items-center overflow-hidden">
                    {/* The combobox shows proper names while editing; the pill
                        keeps a short reference for the stored id. */}
                    <span className="pl-3 pr-2 py-1 text-xs font-medium text-foreground">Condition: {id.slice(0, 8).toUpperCase()}…</span>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("history.condition_ids", conditionIds.filter(c => c !== id));
                      }}
                      className="px-2.5 py-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="max-w-md">
              <CatalogCombobox
                catalogType="conditions"
                placeholder="Search to add a condition..."
                onSelect={(id) => {
                  if (!conditionIds.includes(id)) {
                    setValue("history.condition_ids", [...conditionIds, id]);
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Systemic Medications</label>
              <textarea
                {...register("history.systemic_medications")}
                rows={2}
                placeholder="E.g., Metformin 500mg, Amlodipine 5mg"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Topical Ocular Medications</label>
              <textarea
                {...register("history.topical_medications")}
                rows={2}
                placeholder="E.g., Timolol 0.5% BD OU"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Clinical Notes (Internal)</label>
            <textarea
              {...register("history.notes")}
              rows={2}
              placeholder="General history notes..."
              className={`${fieldClass} bg-clay/5`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
