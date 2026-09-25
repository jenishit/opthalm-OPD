"use client";

import React from "react";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import type { IntakeExamFormData } from "@/lib/schemas/shared.schema";
import { Plus, Trash2, Eye } from "lucide-react";
import { NumericCell, chartLabel, chartShell } from "./chart-ui";

const acuityOptions = ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60", "CF", "HM", "PL"];

const stages = [
  { id: "unaided", label: "Unaided Vision", hint: "uncorrected acuity" },
  { id: "old_rx", label: "Present Glasses (PGP)", hint: "existing prescription" },
  { id: "retinoscopy", label: "Auto Refraction (AR)", hint: "objective" },
  { id: "subjective_acceptance", label: "Subjective Refraction", hint: "accepted lenses" },
  { id: "final_rx", label: "Final Prescription (Rx)", hint: "dispense" },
] as const;

type StageId = (typeof stages)[number]["id"];

const cellBorder =
  "w-full rounded-xl border-[1.5px] border-dashed border-border/80 bg-card px-2 py-2.5 text-center text-sm font-medium tabular-nums text-foreground outline-none transition-colors hover:border-primary/50 focus:border-solid focus:border-primary";

export function RefractionSection() {
  const { register, control, watch } = useFormContext<IntakeExamFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "readings",
  });

  const usesSpectacles = watch("history.uses_spectacles");

  const addReadingPair = (stage: "unaided" | "old_rx" | "pinhole" | "retinoscopy" | "subjective_acceptance" | "final_rx") => {
    append([
      { stage, eye: "OD", sphere: 0, cylinder: 0, axis: 0, va: "6/6" },
      { stage, eye: "OS", sphere: 0, cylinder: 0, axis: 0, va: "6/6" },
    ]);
  };

  const getReadingsByStage = (stage: string) => {
    return fields.map((field, index) => ({ field, index })).filter((item) => item.field.stage === stage);
  };

  const stages = [
    { id: "unaided", label: "Unaided Vision" },
    { id: "old_rx", label: "Present Glasses Prescription (PGP)", show: usesSpectacles },
    { id: "retinoscopy", label: "Auto Refraction (AR)" },
    { id: "subjective_acceptance", label: "Subjective Refraction" },
    { id: "final_rx", label: "Final Prescription (Rx)" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Add Buttons */}
      <div className="bg-card p-4 rounded-2xl border border-border/60 shadow-organic-sm flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground mr-2">Add Reading:</span>
        {stages.filter((s) => s.show !== false).map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => addReadingPair(stage.id as any)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-3 w-3" /> {stage.label}
          </button>
        ))}
      </div>

      {fields.length === 0 ? (
        <div className="bg-card p-10 rounded-2xl border border-dashed border-border text-center">
          <Eye className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">No Refraction Readings</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click a button above to add refraction readings.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {stages.map((stage) => {
            const stageReadings = getReadingsByStage(stage.id);
            if (stageReadings.length === 0) return null;

            return (
              <div key={stage.id} className="bg-card p-5 rounded-2xl border border-border/60 shadow-organic-sm">
                <div className="flex justify-between items-center mb-4 border-b border-border/60 pb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stage.label}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      // Remove all readings for this stage
                      const toRemove = stageReadings.map((r) => r.index).sort((a, b) => b - a); // sort descending so indices don't shift
                      toRemove.forEach((idx) => remove(idx));
                    }}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" /> Clear Stage
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground">Eye</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-24">Sph</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-24">Cyl</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-24">Axis</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-24">Add</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-24">V/A</th>
                        {stage.id === "final_rx" && (
                          <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground">Details</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {stageReadings.map(({ field, index }) => (
                        <tr
                          key={field.id}
                          className={field.eye === "OD" ? "bg-status-examining-bg/50" : "bg-status-completed-bg/50"}
                        >
                          <td
                            className={`px-2 py-3 font-bold ${field.eye === "OD" ? "text-status-examining" : "text-status-completed"}`}
                          >
                            {field.eye}
                            {/* Hidden field for stage and eye to maintain context */}
                            <input type="hidden" {...register(`readings.${index}.stage`)} />
                            <input type="hidden" {...register(`readings.${index}.eye`)} />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.25"
                              {...register(`readings.${index}.sphere`, { valueAsNumber: true })}
                              className={cellCls}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.25"
                              {...register(`readings.${index}.cylinder`, { valueAsNumber: true })}
                              className={cellCls}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              min="0"
                              max="180"
                              {...register(`readings.${index}.axis`, { valueAsNumber: true })}
                              className={cellCls}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              {...register(`readings.${index}.add_power`, { valueAsNumber: true })}
                              className={cellCls}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <select {...register(`readings.${index}.va`)} className={cellCls}>
                              <option value="6/6">6/6</option>
                              <option value="6/9">6/9</option>
                              <option value="6/12">6/12</option>
                              <option value="6/18">6/18</option>
                              <option value="6/24">6/24</option>
                              <option value="6/36">6/36</option>
                              <option value="6/60">6/60</option>
                              <option value="CF">CF</option>
                              <option value="HM">HM</option>
                              <option value="PL">PL</option>
                            </select>
                          </td>
                          {stage.id === "final_rx" && (
                            <td className="px-2 py-2 flex gap-2">
                              <input
                                type="number"
                                placeholder="PD"
                                {...register(`readings.${index}.pd`, { valueAsNumber: true })}
                                className={`${cellCls} w-16`}
                              />
                              <select {...register(`readings.${index}.lens_type`)} className={`${cellCls} w-24`}>
                                <option value="single_vision">Single</option>
                                <option value="bifocal">Bifocal</option>
                                <option value="progressive">Prog.</option>
                              </select>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
