"use client";

import React from "react";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import type { IntakeExamFormData } from "@/schemas/shared-schema";
import { Plus, Trash2, Eye } from "lucide-react";
import { NumericCell, chartLabel, chartShell } from "@/components/ui";

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
  const visibleStages = stages.filter((stage) => stage.id !== "old_rx" || usesSpectacles);

  const addReadingPair = (stage: StageId) => {
    append([
      { stage, eye: "OD", va: "6/6" },
      { stage, eye: "OS", va: "6/6" },
    ]);
  };

  const getReadingsByStage = (stage: string) =>
    fields
      .map((field, index) => ({ field, index }))
      .filter((item) => item.field.stage === stage)
      .sort((a, b) => (a.field.eye === "OD" ? -1 : 1) - (b.field.eye === "OD" ? -1 : 1));

  return (
    <div className="space-y-5">
      <div className={chartShell}>
        <div className="border-b border-border/60 bg-muted/40 px-4 py-3">
          <p className={chartLabel}>Add a refraction reading</p>
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          {visibleStages.map((stage) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => addReadingPair(stage.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              <Plus className="size-3.5" />
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/70 bg-card p-10 text-center">
          <Eye className="mx-auto mb-2 size-10 text-muted-foreground/50" />
          <h3 className="font-display text-lg font-medium text-foreground">No refraction yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap a stage above to open its OD / OS chart.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleStages.map((stage) => {
            const stageReadings = getReadingsByStage(stage.id);
            if (stageReadings.length === 0) return null;
            const isFinal = stage.id === "final_rx";
            const template = isFinal
              ? "grid-cols-[56px_repeat(7,minmax(104px,1fr))]"
              : "grid-cols-[56px_repeat(5,minmax(104px,1fr))]";

            return (
              <div key={stage.id} className={chartShell}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
                  <div>
                    <h3 className="font-display text-lg font-medium text-foreground">{stage.label}</h3>
                    <p className={chartLabel}>{stage.hint}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const toRemove = stageReadings.map((r) => r.index).sort((a, b) => b - a);
                      toRemove.forEach((index) => remove(index));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" /> Clear stage
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <div className={`grid min-w-[620px] ${template}`}>
                    <div className="border-b border-border/60 p-2" />
                    {["Sphere", "Cylinder", "Axis", "Add", "Vision"].map((column) => (
                      <div
                        key={column}
                        className={`border-b border-l border-border/60 p-2 text-center ${chartLabel}`}
                      >
                        {column}
                      </div>
                    ))}
                    {isFinal ? (
                      <>
                        <div className={`border-b border-l border-border/60 p-2 text-center ${chartLabel}`}>
                          PD
                        </div>
                        <div className={`border-b border-l border-border/60 p-2 text-center ${chartLabel}`}>
                          Lens
                        </div>
                      </>
                    ) : null}

                    {stageReadings.map(({ field, index }) => (
                      <React.Fragment key={field.id}>
                        <div
                          className={`flex flex-col items-center justify-center border-b border-border/60 p-2 ${
                            field.eye === "OD"
                              ? "bg-status-examining-bg/50 text-status-examining"
                              : "bg-status-completed-bg/50 text-status-completed"
                          }`}
                        >
                          <span className="font-display text-base font-semibold">{field.eye}</span>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
                            {field.eye === "OD" ? "right" : "left"}
                          </span>
                        </div>

                        <div className="border-b border-l border-border/60 p-1.5">
                          <Controller
                            control={control}
                            name={`readings.${index}.sphere`}
                            render={({ field: input }) => (
                              <NumericCell
                                label={`Sphere · ${field.eye}`}
                                value={input.value ?? undefined}
                                onChange={input.onChange}
                              />
                            )}
                          />
                        </div>
                        <div className="border-b border-l border-border/60 p-1.5">
                          <Controller
                            control={control}
                            name={`readings.${index}.cylinder`}
                            render={({ field: input }) => (
                              <NumericCell
                                label={`Cylinder · ${field.eye}`}
                                value={input.value ?? undefined}
                                onChange={input.onChange}
                              />
                            )}
                          />
                        </div>
                        <div className="border-b border-l border-border/60 p-1.5">
                          <Controller
                            control={control}
                            name={`readings.${index}.axis`}
                            render={({ field: input }) => (
                              <NumericCell
                                label={`Axis · ${field.eye}`}
                                value={input.value ?? undefined}
                                onChange={input.onChange}
                                step={5}
                                min={0}
                                max={180}
                                decimals={0}
                                signed={false}
                                suffix="°"
                              />
                            )}
                          />
                        </div>
                        <div className="border-b border-l border-border/60 p-1.5">
                          <Controller
                            control={control}
                            name={`readings.${index}.add_power`}
                            render={({ field: input }) => (
                              <NumericCell
                                label={`Near add · ${field.eye}`}
                                value={input.value ?? undefined}
                                onChange={input.onChange}
                                min={0}
                                max={12}
                              />
                            )}
                          />
                        </div>
                        <div className="border-b border-l border-border/60 p-1.5">
                          <select
                            {...register(`readings.${index}.va`)}
                            aria-label={`Visual acuity · ${field.eye}`}
                            className={cellBorder}
                          >
                            {acuityOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        {isFinal ? (
                          <>
                            <div className="border-b border-l border-border/60 p-1.5">
                              <Controller
                                control={control}
                                name={`readings.${index}.pd`}
                                render={({ field: input }) => (
                                  <NumericCell
                                    label={`Pupillary distance · ${field.eye}`}
                                    value={input.value ?? undefined}
                                    onChange={input.onChange}
                                    step={0.5}
                                    min={20}
                                    max={90}
                                    decimals={1}
                                    signed={false}
                                  />
                                )}
                              />
                            </div>
                            <div className="border-b border-l border-border/60 p-1.5">
                              <select
                                {...register(`readings.${index}.lens_type`)}
                                aria-label={`Lens type · ${field.eye}`}
                                className={cellBorder}
                              >
                                <option value="single_vision">Single</option>
                                <option value="bifocal">Bifocal</option>
                                <option value="progressive">Progressive</option>
                                <option value="contact_lens">Contact</option>
                                <option value="none">None</option>
                              </select>
                            </div>
                          </>
                        ) : null}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
